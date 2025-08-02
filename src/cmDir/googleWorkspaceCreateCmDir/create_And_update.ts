import * as fs from "fs";
import { join } from "path";
import * as XLSX from "xlsx";
import { startEndLog_And_timer } from "@/resources/copy_const";
import { get_GCP_API } from "@/resources/copy_GCP_API";
import type { DifferenceObjType } from "./diff";
import type { MergeCmListType } from "./get_DX";

interface ImportXlsxData {
	台帳種類: "契約台帳(注文)";
	更新区分: "更新";
	お客様番号: string;
	物件番号: string;
	GDrive: string;
}

export async function create_And_update(
	diffList: DifferenceObjType,
	yearFolders: { id: string; name: string }[],
) {
	startEndLog_And_timer();

	// not_registered_in_c_DX: 新規作成してc-DXに登録
	const result_create = await create_cmFolder(
		diffList.not_registered_in_c_DX,
		yearFolders,
	);

	// not_exist_in_c_DX: 作成済みをc-DXに登録
	const result_update = await update_cmFolder(diffList.not_exist_in_c_DX);

	// 書き込むデータを作成
	const importXlsxData: ImportXlsxData[] = [...result_create, ...result_update];

	write_xlsx(importXlsxData);

	startEndLog_And_timer();
}

/**
 * not_registered_in_c_DX:c-DXに登録されていない場合
 * 新規作成してc-DXに登録
 */
export async function create_cmFolder(
	not_registered_in_c_DX: MergeCmListType[],
	yearFolders: { id: string; name: string }[],
): Promise<ImportXlsxData[]> {
	startEndLog_And_timer();
	const gDrive = await get_GCP_API("drive");

	const returnData: ImportXlsxData[] = [];

	// 1,c-DXに登録されていない場合
	for (const item of not_registered_in_c_DX) {
		const deliveryYear = item.real_deliveryAt?.slice(0, 4);
		console.log(
			`[ Start ]  :  create_CmFolder : ${deliveryYear} : ${item.customerNumber}_${item.name}`,
		);

		// 作成先のフォルダを指定
		const targetFolder = yearFolders.find(
			(folder) => folder.name === `${deliveryYear}年`,
		);

		if (!targetFolder) {
			console.log(`${deliveryYear}年のフォルダが見つかりません`);
			// TODO:規則通りの場合は、共有ドライブを新しく作成する？
			continue;
		}

		// フォルダを作成;
		const newCmFolder = await gDrive.files.create({
			requestBody: {
				name: `${item.customerNumber}_${item.name}`,
				mimeType: "application/vnd.google-apps.folder",
				parents: [targetFolder.id],
			},
			fields: "id, name",
			supportsAllDrives: true,
		});

		returnData.push({
			台帳種類: "契約台帳(注文)",
			更新区分: "更新",
			お客様番号: item.customerNumber as string,
			物件番号: item.number as string,
			GDrive:
				`https://drive.google.com/drive/folders/${newCmFolder.data.id}` ||
				"https://drive.google.com/drive/shared-drives",
		});

		console.log(`${item.customerNumber}_${item.name} を作成しました`);
	}

	startEndLog_And_timer();
	return returnData;
}

/**
 * not_exist_in_c_DX:GDriveにフォルダが存在するが、c-DXに存在しない場合
 * 作成済みをc-DXに登録
 */
export async function update_cmFolder(
	not_exist_in_c_DX: MergeCmListType[],
): Promise<ImportXlsxData[]> {
	startEndLog_And_timer();

	const returnData: ImportXlsxData[] = [];

	for (const item of not_exist_in_c_DX) {
		returnData.push({
			台帳種類: "契約台帳(注文)",
			更新区分: "更新",
			お客様番号: item.customerNumber as string,
			物件番号: item.number as string,
			GDrive: item.GDrive || "https://drive.google.com/drive/shared-drives",
		});
	}
	startEndLog_And_timer();
	return returnData;
}

/**
 * not_exist_in_GDrive:c-DXに登録されているが、GDriveにフォルダが存在しない場合
 * 合ってるのか確認して、c-DXのURLを削除すれば次回作成される。
 * // TODO:タスクリストとして出力するか？
 */
/**
 * not_match_customerNumber:c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(お客様番号)が一致しない場合
 * 正しそうなものを検索する？
 * // TODO:タスクリストとして出力するか？
 */

/**
 * not_match_bukkenName:c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(物件名)が一致しない場合
 * // TODO:APIで直接変更する
 */

export async function write_xlsx(importXlsxData: ImportXlsxData[]) {
	startEndLog_And_timer();
	if (importXlsxData.length === 0) {
		console.log("書き込むデータがありません");
		startEndLog_And_timer();
		return;
	}

	// 1. テンプレートファイルを読み込み
	const workbook = XLSX.readFile(join(__dirname, "GDriveUpdateSheet.xlsx"));

	// 2. 既存のシート名を取得
	const sheetName = workbook.SheetNames[0]; // 1番目のシートを対象
	const worksheet = workbook.Sheets[sheetName];

	// 3.jsonデータをシート形式に変換し、3行目（A3）から書き込み
	const newDataSheet = XLSX.utils.json_to_sheet(importXlsxData, {
		origin: "A3",
		skipHeader: true, // 3行目にheaderが入るのでこれをなしにする
	});
	// A3以降に書かれたデータを既存のシートにマージ
	Object.assign(worksheet, newDataSheet);

	// ワークブックにシートを再設定（念のため）
	workbook.Sheets[sheetName] = worksheet;

	// 今日の日付でファイル名を生成
	const today = new Date();
	const dateStr =
		today.getFullYear().toString() +
		(today.getMonth() + 1).toString().padStart(2, "0") +
		today.getDate().toString().padStart(2, "0");

	// ファイル名の重複チェックと番号付与
	let fileName = `importDataGDrive_${dateStr}.xlsx`;
	let counter = 2;
	while (fs.existsSync(join(__dirname, fileName))) {
		fileName = `importDataGDrive_${dateStr}(${counter}).xlsx`;
		counter++;
	}

	// 新しいファイルとして出力
	XLSX.writeFile(workbook, join(__dirname, fileName));

	console.log(`${fileName} を作成しました`);
	console.log(
		"https://dx1.kensetsu-cloud.jp/main/dxapp/t/X201EC0/member/bulkupdate/chumonKeiyakuList",
	);
	startEndLog_And_timer();
}
