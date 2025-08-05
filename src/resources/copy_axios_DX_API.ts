import * as os from "node:os";
import * as path from "node:path";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import * as dotenv from "dotenv";
import type {
	DXAPI_BaseType,
	DXAPI_inspectionType,
	DXAPI_keiyakuType,
	DXAPI_mikomiType,
	DXAPI_ResponseType,
	DXApiParamsType,
} from "./types_DX";

const isMainSV = os.hostname() === "main-SV";
const cDX_envPath = isMainSV
	? "E:/Administration/code/API/src/DXAPI" // サーバーの場合
	: "X:/code/API/src/DXAPI"; // NOTE:XドライブにAdministration$を入れている場合
dotenv.config({ path: path.join(cDX_envPath, ".env"), quiet: true, });

/** 環境変数が未定義の場合にエラーをスローするヘルパーメソッド */
const envImport = (envName: string): string => {
	const env = process.env[envName];
	if (!env) throw new Error(`環境変数 ${envName} が定義されていません。`);
	return env;
};

export const keiyakuURL = (cmDataObj: { id: string }) =>
	`${envImport("DX_keiyakuURL")}?ledgerId=${cmDataObj.id}&tabName=LEDGER_COMMON_BASIC_TAB`;

const reqURL = envImport("DX_API_URL");
let repeat_count = 0;
let set_cookie: string[];

const handleAxiosError = (err: unknown) => {
	if (axios.isAxiosError(err)) {
		// AxiosErrorの場合の処理
		console.error("Axiosエラー:", err.message);
		if (err.response) {
			// レスポンスがある場合
			console.error("レスポンスデータ:", err.response.data);
			console.error("ステータスコード:", err.response.status);
			return JSON.stringify(err.response.data);
		}
	}
	// それ以外のエラーの場合
	console.log("エラー全文 : ", err);
	if (err instanceof Error) console.error("エラーstack : ", err.stack);
	return err;
};

async function get_TOKEN() {
	if (repeat_count > 2) throw new Error("リダイレクトのエラー");
	try {
		const response: AxiosResponse = await axios({
			withCredentials: true,
			maxRedirects: 0,
			method: "POST",
			headers: { "Content-Type": "application/json", Cookie: set_cookie },
			url: `${reqURL}/auth/token`,
			data: JSON.stringify({
				userId: envImport("DX_USER"),
				password: envImport("DX_PASSWORD"),
			}),
		});
		return response.data.token;
	} catch (err: unknown) {
		const isAxiosError = (error: unknown): error is AxiosError =>
			typeof error === "object" &&
			error !== null &&
			"isAxiosError" in error &&
			(error as AxiosError).isAxiosError === true;

		if (isAxiosError(err)) {
			// AxiosErrorの場合
			if (err.response) {
				if (err.response?.status >= 302) {
					console.log("redirect:302");
					if (err.response.headers["set-cookie"]) {
						set_cookie = err.response.headers["set-cookie"];
						repeat_count++;
						const response: string = await get_TOKEN();
						return response;
					}
				}
			}
		} else {
			// AxiosErrorではない場合
			console.error("AxiosError以外のエラーが発生:", err);
		}

		// 共通エラーハンドリング
		await handleAxiosError(err);
		// throw err; // 必要に応じて再スロー
	}
}

/**
 * DXのAPI実行を行う
 * @param API : { API Root } 以降のURL  "/v1/common/customer/list"
 * @param params : { q: 'number:starts:"REH-2022-"' } 「フィールド名」「演算子」「値」値部分はURLエンコードが必要
 * @param data : object (JSONパース は不要)
 */
export async function DX_API<T extends DXAPI_BaseType>(
	method: "GET" | "POST",
	API: `/${string}`,
	params?: DXApiParamsType | "",
	data?: DXAPI_mikomiType | DXAPI_keiyakuType | DXAPI_inspectionType | "",
): Promise<DXAPI_ResponseType<T> | undefined> {
	console.log("[ Start ]  :  DX_TOKEN");
	const accessToken = await get_TOKEN();
	if (!accessToken) throw new Error("DX_API : Token not found");
	const headers = {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
		Cookie: set_cookie,
	};

	console.log("[ Start ]  :  DX_API");
	try {
		const response: AxiosResponse = await axios({
			withCredentials: true,
			method: method,
			maxRedirects: 0,
			headers: headers,
			url: reqURL + API,
			params: params || null,
			data: data ? JSON.stringify(data) : null,
		});
		if (response === undefined) {
			throw new Error("DX_API : Response not found");
		}

		return response.data as DXAPI_ResponseType<T>;
	} catch (err: unknown) {
		await handleAxiosError(err);
	}
}
