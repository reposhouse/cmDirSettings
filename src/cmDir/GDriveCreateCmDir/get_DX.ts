import type {
	DXAPI_keiyakuType,
	DXAPI_ledgerType,
} from "src/resources/types_DX";
import { DX_API } from "@/resources/copy_axios_DX_API";
import { startEndLog_And_timer } from "@/resources/copy_const";

export interface MergeCmListType extends DXAPI_keiyakuType {
	GDrive: string | undefined;
}

export async function get_DXkeiyaku_deliveredCmList(
	startYear: string,
	endYear: string,
) {
	startEndLog_And_timer();

	const q = [
		"real_deliveryAt:nn",
		`real_deliveryAt:ge:${startYear}-01-01`,
		`real_deliveryAt:le:${endYear}-12-31`,
	].join(",");

	const dx_deliveredCmNumberList = await DX_API<DXAPI_keiyakuType>(
		"GET",
		"/v2/chumon/keiyaku/list",
		{
			limit: -1,
			q,
		},
	);

	startEndLog_And_timer();
	if (dx_deliveredCmNumberList?.data) {
		return dx_deliveredCmNumberList.data;
	}
	return undefined;
}

/**
 * c-DXのユーザー追加項目APIからGDriveのURLを取得
 * ※お客様番号は取れない
 */
export async function get_DXledgeritem_GDriveList(): Promise<
	{ bukkenNumber: string; GDrive: string }[] | undefined
> {
	startEndLog_And_timer();

	const dx_ledgeritem_GDriveList = await DX_API<DXAPI_ledgerType>(
		"GET",
		"/v1/common/ledgeritem/list",
		{
			limit: -1,
			q: [
				"ledgerType:eq:4",
				'name:eq:"GDrive"',
				"value:nn",
				'value:starts:"https://drive.google.com/drive/folders/"',
			].join(","),
		},
	);

	startEndLog_And_timer();

	if (dx_ledgeritem_GDriveList?.data) {
		// 物件番号とDriveURLを返す
		return dx_ledgeritem_GDriveList.data.map((item) => {
			return { bukkenNumber: item.bukkenNumber, GDrive: item.value };
		});
	}
	return undefined;
}

/**
 * 1-5,契約台帳とGDriveのマージ
 */
export function merge_dx_deliveredCm_GDrive(
	dx_deliveredCmListData: DXAPI_keiyakuType[],
	dx_ledgeritem_GDriveList: { bukkenNumber: string; GDrive: string }[],
) {
	startEndLog_And_timer();

	const mergeCmList = [];
	// 外構工事はフォルダ作成から除外
	for (const dx_deliveredCm of dx_deliveredCmListData) {
		if (dx_deliveredCm.name?.startsWith("外構工事")) {
			console.log("外構工事 skip");
			continue;
		}

		// c-DX契約台帳のデータにGDriveのURLを追加
		const dx_ledgeritem_GDrive = dx_ledgeritem_GDriveList.find(
			(item) => item.bukkenNumber === dx_deliveredCm.number,
		);
		mergeCmList.push({
			...dx_deliveredCm,
			GDrive: dx_ledgeritem_GDrive?.GDrive,
		});
	}

	startEndLog_And_timer();
	return mergeCmList;
}
