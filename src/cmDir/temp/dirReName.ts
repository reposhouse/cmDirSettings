// NOTE:このコードはフォルダ名を変更するのに一時的に利用
// NOTE:他の用途に使ってもよい

// import { startEndLog_And_timer, Utilities } from "src/resources/copy_const";
// import { get_GCP_API } from "src/resources/copy_GCP_API";

// main();
// /**
//  * ARCHITRENDLastData.db をゴミ箱に移動する関数
//  * 500件を削除する
//  * create系APIなのでリクエスト回数が厳し目
//  */
// async function main() {
// 	startEndLog_And_timer();
// 	const ARCHITRENDLastData_list = await get_ARCHITRENDLastData_list();
// 	console.log(ARCHITRENDLastData_list?.length);

// 	if (!ARCHITRENDLastData_list) {
// 		console.log("ARCHITRENDLastData_list is undefined");
// 		return;
// 	}
// 	const drive = await get_GCP_API("drive");

// 	let renamedCount = 0;
// 	for (const ARCHITRENDLastData of ARCHITRENDLastData_list) {
// 		const url = `https://drive.google.com/file/d/${ARCHITRENDLastData.id}`;
// 		try {
// 			await drive.files.update({
// 				fileId: ARCHITRENDLastData.id,
// 				supportsAllDrives: true,
// 				requestBody: { name: "16_ARCHITRENDLastData" },
// 			});
// 			console.log(`✅ rename: ${++renamedCount}, ${url}`);
// 		} catch (err) {
// 			console.error(`❌ Failed to rename ${err}, ${url}}`);
// 		}
// 		await Utilities.sleep(1500); // 2秒待機
// 	}

// 	startEndLog_And_timer();
// }

// interface ARCHITRENDLastDataListType {
// 	id: string;
// 	name: "ARCHITRENDLastData";
// 	teamDriveId: string;
// }
// async function get_ARCHITRENDLastData_list(): Promise<
// 	ARCHITRENDLastDataListType[] | undefined
// > {
// 	startEndLog_And_timer();

// 	const drive = await get_GCP_API("drive");
// 	const res = await drive.files.list({
// 		corpora: "allDrives",
// 		includeItemsFromAllDrives: true,
// 		supportsAllDrives: true,
// 		q: "name = 'ARCHITRENDLastData' and mimeType = 'application/vnd.google-apps.folder'",
// 		fields: "nextPageToken, files(id, name, teamDriveId)",
// 		spaces: "drive",
// 		pageSize: 500,
// 	});

// 	startEndLog_And_timer();
// 	return res.data?.files as ARCHITRENDLastDataListType[];
// }
