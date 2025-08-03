import path from "node:path";
import { google } from "googleapis";
import { envImport, PATHS } from "@/resources/copy_const";

/**
 * Google Sheets APIクライアントを取得する
 * ※_constが必要
 * https://developers.google.com/workspace/drive/api/reference/rest/v3?hl=ja
 */
export type ApiName = "sheets" | "drive";
type ApiClientMap = {
	sheets: ReturnType<typeof google.sheets>;
	drive: ReturnType<typeof google.drive>;
};
export async function get_GCP_API<T extends ApiName>(
	api_name: T,
): Promise<ApiClientMap[T]> {
	console.log("[ Start ]  :  GCP_API");
	const GWS_envPath = path.join(PATHS.ADMIN_CODE, "API", "src", "GoogleAPI");
	const envPath = path.join(GWS_envPath, ".env");

	const SERVICE_ACCOUNT_FILE: string = path.join(
		GWS_envPath,
		envImport("GCP_KEY", envPath),
	);

	// スコープ設定
	const scopesMap: Record<ApiName, string[]> = {
		sheets: ["https://www.googleapis.com/auth/spreadsheets"],
		drive: ["https://www.googleapis.com/auth/drive"],
	};

	// サービスアカウント認証のセットアップ
	const auth = new google.auth.GoogleAuth({
		keyFile: path.join(SERVICE_ACCOUNT_FILE),
		scopes: scopesMap[api_name],
	});

	// Google APIの初期化
	switch (api_name) {
		case "sheets": {
			const sheets = google.sheets({ version: "v4", auth }) as ApiClientMap[T];
			return sheets;
		}
		case "drive": {
			const drive = google.drive({ version: "v3", auth }) as ApiClientMap[T];
			return drive;
		}

		default:
			throw new Error(`${api_name}は未対応です。`);
	}
}
