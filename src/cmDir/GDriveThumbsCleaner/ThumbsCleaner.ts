import { startEndLog_And_timer, Utilities } from "src/resources/copy_const";
import { get_GCP_API } from "src/resources/copy_GCP_API";

main();
/**
 * Thumbs.db をゴミ箱に移動する関数
 * 500件を削除する
 * create系APIなのでリクエスト回数が厳し目
 */
async function main() {
	startEndLog_And_timer();
	const thumbs_list = await get_thumbs_list();
	console.log(thumbs_list?.length);

	if (!thumbs_list) {
		console.log("thumbs_list is undefined");
		return;
	}
	const drive = await get_GCP_API("drive");

	let deletedCount = 0;
	for (const thumbs of thumbs_list) {
		const url = `https://drive.google.com/file/d/${thumbs.id}`;
		try {
			await drive.files.update({
				fileId: thumbs.id,
				supportsAllDrives: true,
				requestBody: {
					trashed: true,
				},
			});
			console.log(`✅ move to trash: ${++deletedCount}, ${url}`);
		} catch (err) {
			console.error(`❌ Failed to delete ${err}, ${url}}`);
		}
		await Utilities.sleep(1500); // 2秒待機
	}

	startEndLog_And_timer();
}

interface ThumbsListType {
	id: string;
	name: "Thumbs.db";
	teamDriveId: string;
}
async function get_thumbs_list(): Promise<ThumbsListType[] | undefined> {
	startEndLog_And_timer();

	const drive = await get_GCP_API("drive");
	const res = await drive.files.list({
		corpora: "allDrives",
		includeItemsFromAllDrives: true,
		supportsAllDrives: true,
		q: "name contains 'Thumbs.db' and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
		fields: "nextPageToken, files(id, name, teamDriveId)",
		spaces: "drive",
		pageSize: 500,
	});

	startEndLog_And_timer();
	return res.data?.files as ThumbsListType[];
}
