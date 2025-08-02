import type { drive_v3 } from "googleapis";
import { get_GCP_API } from "@/resources/copy_GCP_API";

export interface driveData {
	name: string;
	teamDriveId: string;
}

export interface mgdzData {
	teamDriveId: string;
	fileName: string;
	url: string;
}

// https://developers.google.com/drive/api/reference/rest/v3?hl=ja
/**
 * GDriveにある.mgdzファイルの一覧から
 * それらのファイルがあるフォルダの一覧を取得
 */
export async function getGoogleWorkspaceList() {
	// APIを取得
	const drive = await get_GCP_API("drive");

	const filesList: mgdzData[] = [];
	let pageToken: string | null | undefined = null;
	let i = 0; // logのためだけなのでなしでもよい
	do {
		const response: { data: drive_v3.Schema$FileList } = await drive.files.list(
			{
				corpora: "allDrives", // すべてのドライブから検索
				includeItemsFromAllDrives: true,
				supportsAllDrives: true,
				q: "name contains '.mgdz' and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
				fields: "nextPageToken, files(id, name, parents, teamDriveId)",
				spaces: "drive",
				pageToken: pageToken ?? undefined,
			},
		);

		const files = response.data.files;
		if (files?.length) {
			for (const file of files) {
				if (file.name && file.teamDriveId) {
					filesList.push({
						teamDriveId: file.teamDriveId,
						fileName: file.name,
						url: `https://drive.google.com/drive/folders/${file.parents ? file.parents[0] : ""}`,
					});
				}
			}
		}
		pageToken = response.data.nextPageToken;
		console.log(`while:${i++}`);
	} while (pageToken);
	console.log(filesList.length);
	return filesList;
}

/**
 * 共有ドライブの一覧を取得
 */
export async function getSharedDriveName() {
	// APIを取得
	const drive = await get_GCP_API("drive");

	// 共有ドライブの一覧objを取得
	const drives: driveData[] = [];
	let pageToken: null | string | undefined = null;
	try {
		do {
			try {
				const res: { data: drive_v3.Schema$DriveList } =
					await drive.drives.list({
						pageToken: pageToken ?? undefined,
					});

				if (res.data.drives && res.data.drives.length > 0) {
					// ドライブ情報を配列に格納
					for (const teamDrive of res.data.drives) {
						if (teamDrive.name && teamDrive.id) {
							drives.push({ name: teamDrive.name, teamDriveId: teamDrive.id });
						}
					}
				}
				// 次のページのトークンを取得
				pageToken = res.data.nextPageToken;
			} catch (error) {
				console.error("Error fetching drives:", error);
				break;
			}
		} while (pageToken);

		const result: driveData[] = [];
		drives.map((l) => {
			if (!l.name.match(/^■/)) result.push(l);
		});

		return result;
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
			if ("errors" in err) {
				console.log((err as { errors: string[] }).errors); // 型がわからない場合一時的に `any` を使う
			}
		} else {
			console.error("予期しないエラー:", err);
		}
	}
}

// 実行
// getGoogleWorkspaceList();

// results.push({ id: getId(), label: "GoogleWorkspace", children: [] });

// [
// 	{
// 		"id": 0,
// 		"label": "タナカヤ",
// 		"children": [
// 			{
// 				"id": 3,
// 				"label": "社有土地以外",
// 				"children": [
// 					{ "id": 61, "label": "Trader", "children": [] },
// 					{
// 						"id": 62,
// 						"label": "●山科区御陵賃貸マンション",
// 						"children": [
// 							{ "id": 1175, "label": "山科区御陵賃貸マンション邸新築工事" }
// 						]
// 					},
