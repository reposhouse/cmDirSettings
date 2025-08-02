"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleWorkspaceList = getGoogleWorkspaceList;
exports.getSharedDriveName = getSharedDriveName;
const path = __importStar(require("node:path"));
const googleapis_1 = require("googleapis");
const ARCHITRENDdirList_1 = require("./ARCHITRENDdirList");
// サービスアカウント認証の設定
const prefix = ARCHITRENDdirList_1.isMainSV ? "E:Administration/" : "X:/";
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: path.join(prefix, "code", "GoogleWorkspace", "trapp-358710-09678f3e3acb.json"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
// https://developers.google.com/drive/api/reference/rest/v3?hl=ja
async function getGoogleWorkspaceList() {
    const filesList = [];
    let pageToken = null;
    let i = 0; // logのためだけなのでなしでもよい
    do {
        const response = await drive.files.list({
            corpora: "allDrives", // すべてのドライブから検索
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            q: "name contains '.mgdz' and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
            fields: "nextPageToken, files(id, name, parents, teamDriveId)",
            spaces: "drive",
            pageToken: pageToken ?? undefined,
        });
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
async function getSharedDriveName() {
    // 共有ドライブの一覧objを取得
    const drives = [];
    let pageToken = null;
    try {
        do {
            try {
                const res = await drive.drives.list({
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
            }
            catch (error) {
                console.error("Error fetching drives:", error);
                break;
            }
        } while (pageToken);
        const result = [];
        drives.map((l) => {
            if (!l.name.match(/^■/))
                result.push(l);
        });
        return result;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
            if ("errors" in err) {
                console.log(err.errors); // 型がわからない場合一時的に `any` を使う
            }
        }
        else {
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
