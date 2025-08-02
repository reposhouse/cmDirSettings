import type { drive_v3 } from "googleapis";
import { startEndLog_And_timer } from "@/resources/copy_const";
import { get_GCP_API } from "@/resources/copy_GCP_API";

/**
 * GDriveのフォルダ一覧を取得
 * @param targetYear 特定の年のフォルダのみを取得する場合の年（例: "2024"）、undefinedの場合は今年から6年前まで
 * @returns フォルダリスト
 */
export async function get_GDrive_folderList(
	targetYear: string | undefined,
): Promise<{ id: string; name: string }[]> {
	startEndLog_And_timer();

	const gDrive = await get_GCP_API("drive");

	// ドライブ一覧を取得(ページングあり)
	let drives: drive_v3.Schema$Drive[] = [];
	let nextPageToken: string | undefined;
	do {
		const res = await gDrive.drives.list({
			pageSize: 100,
			fields: "nextPageToken,drives(id,name)",
		});

		if (res.data.drives) {
			drives = [...drives, ...res.data.drives];
		}
		nextPageToken = res.data.nextPageToken ?? undefined;
	} while (nextPageToken);

	// id と name があるものだけ抽出
	let filtered = drives
		.filter((d): d is { id: string; name: string } => !!d.id && !!d.name)
		.map((d) => ({ id: d.id, name: d.name }));

	// 特殊フォルダを追加
	const specialFolder = ["リフォームのみ物件", "未整理・不明"];
	const specialFolderList = specialFolder.map((name) => {
		// filteredから該当する名前のフォルダを検索
		const found = filtered.find((folder) => folder.name === name);
		return { id: found?.id || "", name };
	});

	// 年フォルダフィルタリング
	if (targetYear) {
		// targetYearがある場合：その前後1年ずつの3つのフォルダを抽出
		const targetYearNum = parseInt(targetYear, 10);
		const prevYear = (targetYearNum - 1).toString();
		const nextYear = (targetYearNum + 1).toString();

		const yearPattern = new RegExp(
			`^(${prevYear}|${targetYear}|${nextYear})年$`,
		);
		filtered = filtered.filter((folder) => yearPattern.test(folder.name));
	} else {
		// targetYearがundefinedの場合：今年から6年前までのフォルダを抽出
		const currentYear = new Date().getFullYear();
		const yearPatterns = [];
		for (let year = currentYear - 6; year <= currentYear; year++) {
			yearPatterns.push(`${year}年`);
		}
		const yearPattern = new RegExp(`^(${yearPatterns.join("|")})$`);
		filtered = filtered.filter((folder) => yearPattern.test(folder.name));
	}

	startEndLog_And_timer();
	return [...filtered, ...specialFolderList];
}

/**
 * 各共有ドライブから顧客フォルダの一覧を取得
 */
export async function get_allCmFolderList(
	yearFolders: { id: string; name: string }[],
): Promise<{ id: string; name: string }[]> {
	startEndLog_And_timer();

	const gDrive = await get_GCP_API("drive");
	const allCmFolderList: { id: string; name: string }[] = [];
	yearFolders.forEach((i) => {
		console.log(`[ Start ]  :  get_allCmFolderList : ${i.name}`);
	});

	console.log("各フォルダの数を取得中...");
	await Promise.all(
		yearFolders.map(async (yearFolder) => {
			let folderPageToken: string | undefined;
			do {
				const res = await gDrive.files.list({
					corpora: "drive",
					driveId: yearFolder.id,
					includeItemsFromAllDrives: true,
					supportsAllDrives: true,
					fields: "nextPageToken, files(id, name, parents)",
					pageSize: 1000,
					pageToken: folderPageToken,
					q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false", // フォルダのみを取得
				});

				if (res.data.files) {
					// 1階層目のフォルダのみを抽出（親が年フォルダのみ）
					const firstLevelFolders = res.data.files
						.filter((file) => file.parents?.includes(yearFolder.id))
						.filter(
							(file): file is { id: string; name: string } =>
								!!file.id && !!file.name,
						)
						.map((file) => ({ id: file.id, name: file.name }));
					allCmFolderList.push(...firstLevelFolders);
				}
				folderPageToken = res.data.nextPageToken ?? undefined;
			} while (folderPageToken);
		}),
	);

	console.log(`累計${allCmFolderList.length}件`);
	startEndLog_And_timer();

	// id と name が存在するファイルのみをフィルタリングして返す
	return allCmFolderList
		.filter(
			(file): file is { id: string; name: string } => !!file.id && !!file.name,
		)
		.map((file) => ({ id: file.id, name: file.name }));
}
