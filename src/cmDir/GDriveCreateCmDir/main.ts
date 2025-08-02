/**
 * 1,GoogleDriveの有無を確認
 * 1-1,引渡済のお客様番号一覧を取得
 * 1-2,c-DXのGoogleDriveの有無を取得
 * 1-3,Googleドライブのフォルダ一覧の取得
 * 1-4,これらの差分を取得
 * 1-5,整合の確認
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { startEndLog_And_timer } from "@/resources/copy_const";
import { create_And_update } from "./create_And_update";
import { difference_DXkeiyaku_GDrive } from "./diff";
import {
	get_DXkeiyaku_deliveredCmList,
	get_DXledgeritem_GDriveList,
	merge_dx_deliveredCm_GDrive,
} from "./get_DX";
import { get_allCmFolderList, get_GDrive_folderList } from "./get_GDrive";

export async function main(year?: string | number) {
	startEndLog_And_timer();

	// NOTE:特定の年だけをテストして作成する場合のみ指定(空欄は全件調査)
	const yearValidation = async (): Promise<{
		targetYear: string | undefined;
		startYear: string;
		endYear: string;
	}> => {
		if (year) {
			const yearStr = String(year).trim();
			const isValidYear = /^\d{4}$/.test(yearStr);
			const targetYear = isValidYear
				? yearStr
				: new Date().getFullYear().toString(); // 形がおかしかった旨の表示を出す
			return { targetYear, startYear: targetYear, endYear: targetYear };
		}
		// 引数がない場合：今年から5年前までのc-DX、6年前までのGDrive
		const currentYear = new Date().getFullYear();
		const cDXStartYear = currentYear - 5;
		return {
			targetYear: undefined,
			startYear: cDXStartYear.toString(),
			endYear: currentYear.toString(),
		};
	};
	const { targetYear, startYear, endYear } = await yearValidation();

	// 各APIから必要なデータを取得
	const [
		dx_deliveredCmListData, // 契約台帳一覧のAPI結果
		dx_ledgeritem_GDriveList, // c-DXユーザー追加項目のGDriveリスト
		yearFolders, // GDrive年フォルダ一覧
	] = await Promise.all([
		get_DXkeiyaku_deliveredCmList(startYear, endYear), // 1-1-1,引渡済みお客様番号一覧を取得(契約台帳一覧)
		get_DXledgeritem_GDriveList(), // 1-2,c-DXのユーザー追加項目APIからGDriveのURLを取得
		get_GDrive_folderList(targetYear), // 1-3-1,GDriveの年フォルダのみを抽出
	]);

	// 1-3-2,ドライブ内のフォルダ一覧を取得
	const allCmFolderList = await get_allCmFolderList(yearFolders);

	if (!dx_deliveredCmListData || !allCmFolderList || !dx_ledgeritem_GDriveList)
		/**
		 * 取得が出来ているかここでチェック
		 * 取得が出来ていない場合はエラーを投げる
		 */
		throw new Error("データが取得できませんでした");

	// 1-4-1,契約台帳とGDriveのマージ
	const mergeCmList = merge_dx_deliveredCm_GDrive(
		dx_deliveredCmListData,
		dx_ledgeritem_GDriveList,
	);

	// 1-4-2,これらの差分を取得
	const diffList = difference_DXkeiyaku_GDrive(mergeCmList, allCmFolderList);

	// NOTE:差分をログファイルに出力
	const logLines: string[] = [];
	for (const [key, list] of Object.entries(diffList)) {
		for (const item of list) {
			logLines.push(
				`${key}: ${item.customerNumber}_${item.name}_${item.GDrive}`,
			);
		}
	}

	// ログファイルに書き込み
	const logPath = join(__dirname, "diffList.log");
	if (logLines.length > 0) {
		writeFileSync(logPath, logLines.join("\n"), "utf-8");
		console.log(`差分ログを出力しました: ${logPath}`);
	} else {
		console.log("差分がありません。終了します。");
		return;
	}

	await create_And_update(diffList, yearFolders);
	startEndLog_And_timer();
}
