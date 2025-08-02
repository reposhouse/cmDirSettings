import { startEndLog_And_timer } from "@/resources/copy_const";
import type { MergeCmListType } from "./get_DX";

/**
 * 1-3-1,契約台帳←→GDriveの差分
 */
/**
 * @property not_registered_in_c_DX:c-DXに登録されていない場合
 * @property not_exist_in_GDrive:c-DXに登録されているが、GDriveにフォルダが存在しない場合
 * @property not_match_customerNumber:c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(お客様番号)が一致しない場合
 * @property not_match_bukkenName:c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(物件名)が一致しない場合
 * @property not_exist_in_c_DX:GDriveにフォルダが存在するが、c-DXに存在しない場合
 */
export interface DifferenceObjType {
	not_registered_in_c_DX: MergeCmListType[];
	not_exist_in_GDrive: MergeCmListType[];
	not_match_customerNumber: MergeCmListType[];
	not_match_bukkenName: MergeCmListType[];
	not_exist_in_c_DX: MergeCmListType[];
}
export function difference_DXkeiyaku_GDrive(
	mergeCmList: MergeCmListType[],
	allCmFolderList: { id: string; name: string }[],
): DifferenceObjType {
	startEndLog_And_timer();

	const differenceObj: DifferenceObjType = {
		not_registered_in_c_DX: [],
		not_exist_in_GDrive: [],
		not_match_customerNumber: [],
		not_match_bukkenName: [],
		not_exist_in_c_DX: [],
	};

	for (const mergeCm of mergeCmList) {
		const mergeCmNumber = mergeCm.customerNumber as string;
		const mergeCmName = mergeCm.bukkenName as string;

		// c-DXに登録されていない場合
		if (!mergeCm.GDrive) {
			if (allCmFolderList.some((item) => item.name.startsWith(mergeCmNumber))) {
				mergeCm.GDrive = `https://drive.google.com/drive/folders/${allCmFolderList.find((item) => item.name.startsWith(mergeCmNumber))?.id}`;
				differenceObj.not_exist_in_c_DX.push(mergeCm);
				continue;
			}
			differenceObj.not_registered_in_c_DX.push(mergeCm);
			continue;
		}

		// c-DX_GDriveをID化
		const cDX_GDriveId = mergeCm.GDrive.match(
			/https:\/\/drive\.google\.com\/drive\/folders\/([^/]+)/,
		)?.[1];

		// c-DX_GDriveIdをフォルダリストから探す
		const cDX_GDriveId_find_Folder = allCmFolderList.find(
			(item) => item.id === cDX_GDriveId,
		);

		// c-DXに登録されているが、GDriveにフォルダが存在しない場合
		if (!cDX_GDriveId_find_Folder) {
			differenceObj.not_exist_in_GDrive.push(mergeCm);
			continue;
		}

		// GDriveリストとマッチするものを探す
		const CmFolder = allCmFolderList.find((item) => {
			item.name.startsWith(mergeCmNumber);
		});

		// c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(お客様番号)が一致しない場合
		if (!cDX_GDriveId_find_Folder.name.startsWith(mergeCmNumber)) {
			differenceObj.not_match_customerNumber.push(mergeCm);
			continue;
		}

		// c-DXに登録されていて、GDriveにフォルダが存在するが、フォルダ名(物件名)が一致しない場合
		if (cDX_GDriveId_find_Folder.name !== `${mergeCmNumber}_${mergeCmName}`) {
			// differenceObj.not_match_bukkenName.push(mergeCm); // TODO:諸々実装後に
			continue;
		}

		// GDriveにフォルダが存在するが、c-DXに存在しない場合
		// TODO:どこに実装するべきか
		// if(!mergeCmList.some((item)=>item.GDrive === ))
		console.log(`ok : ${mergeCm.customerNumber} ${mergeCm.name}`);
	}

	startEndLog_And_timer();
	return differenceObj;
}
