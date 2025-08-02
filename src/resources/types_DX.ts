/**
 *APIのリクエストパラメータ
 * @type limit:取得する件数を1起算の整数または文字で指定する。指定がない場合、デフォルト値は100。最大は500。※取得数を制限しない場合は「-1」を指定
 * @type offset:何件目から取得するか？を0起算の整数で指定する。指定がない場合、デフォルト値は0
 * @type sort:フィールド名:asc or desc 昇順・降順の指定がない場合、「asc」として扱う。また、複数フィールドを指定する場合「,」で区切る。例）sort=createdAt:asc,lastupdatedAt:desc
 * @type q:検索条件をAPIの各機能のフィールド名で指定する。「フィールド名」「演算子(eq:等しい,ne:等しくない,contains:部分一致　等)」「値」は「:」で区切る。※複数の検索条件を指定する場合「,」で区切り、AND条件として扱う。
 */
export interface DXApiParamsType {
	limit?: number;
	offset?: number;
	sort?: string;
	q?: "" | string;
}

/**
 * APIのレスポンスの型
 */
export interface DXAPI_BaseType {
	// biome-ignore lint/suspicious/noExplicitAny: DXAPIのベースタイプとしてanyを使用する必要があるため
	[key: string]: any;
}

export interface DXAPI_ResponseType<T extends DXAPI_BaseType> {
	// レスポンスのパラメータの候補一覧の型
	errors: { [key: string]: string }[];
	data?: T[];
	count?: number;
	file?: number;
}

/**
 * 顧客見込み台帳
 */
export interface DXAPI_mikomiType extends DXAPI_BaseType {
	[key: string]: string | number | [];
	number: string; // 顧客番号
	series: string;
	resultMemo: string; // answer_idを変換
	name: string; // customer_nameを変換
	kana: string; // customer_name_rubyを変換
	dmType: string; // dm_requestを変換/DM可否
}

/**
 * 点検保守台帳
 */
export interface DXAPI_inspectionType extends DXAPI_BaseType {
	[key: string]: string | number | [];
	kyojyusyaId: number; // 居住者ID
	number: string; // 物件番号
	name: string; // 物件名
}


/**
 * 注文・契約台帳
 * @number 物件番号
 */
export interface DXAPI_keiyakuType extends DXAPI_BaseType {
	[key: string]:
		| string
		| number
		| []
		| undefined
		| DXAPI_tantoType[]
		| DXAPI_mikomiType;
	createdAt?: string; // 作成日時
	lastUpdatedAt?: string; // 更新日時
	id: number; // 台帳のID
	bukkenId?: number; // 物件ID
	number?: string; // 物件番号
	name?: string; // 物件名
	kana?: string; // 物件名(カナ)
	jukyoZipCode?: string; // 住居郵便番号(ハイフン無し)
	jukyoAddress1?: PrefectureCode; // 都道府県番号
	jukyoAddress2?: string; // 市区町村
	jukyoAddress3?: string; // 番地
	constructionType?: number; // 工事種別コード
	parentNumber?: string; // 本体物件番号(工事種別を新築系以外にした際の親物件の番号)
	note?: string; // 備考
	busyoId?: number; // 管理部門ID
	busyo?: string; // 管理部門名
	exp_contractAt?: string; // 予定契約日
	real_contractAt?: string; // 実際の契約日
	exp_deliveryAt?: string; // 予定引渡日
	real_deliveryAt?: string; // 実際の引渡日
	tantoInfo?: DXAPI_tantoType[];
	customerId?: number;
	customerNumber?: string; // お客様番号
	customerInfo?: DXAPI_mikomiType; // 顧客見込み台帳の情報
	buildingCertificationNumber?: string;
	result?: number; // 引渡結果
}

/**
 * 担当者：tantoInfo
 */
export interface DXAPI_tantoType {
	typeName: string;
	tanto: string;
}

/**
 * ユーザー追加項目
 * @createdAt YYYY-MM-dd'T'HH:mm:ssXXX
 * @lastUpdatedAt YYYY-MM-dd'T'HH:mm:ssXXX
 */
export interface DXAPI_ledgerType extends DXAPI_BaseType {
	createdAt: string;
	lastUpdatedAt: string;
	bukkenId: number;
	bukkenNumber: string;
	ledgerId: number;
	ledgerType: // 台帳種類コード
		| 1 // 顧客見込台帳
		| 2 // 点検保守台帳
		| 3 // 商談台帳
		| 4 // 契約台帳（注文・リフォーム）
		| 5
		| 6 // 土地台帳
		| 7
		| 8
		| 9
		| 10
		| 11
		| 12
		| 13; // 工事原価台帳（注文・リフォーム）
	id: number;
	name: string | "GDrive"; // GDriveはお客様がtagに付かない値なので、別途取得
	type: // 項目種類コード
		| 1 // テキスト1行
		| 2 // テキストエリア
		| 3 // 数値(少数)
		| 4 // 数値(整数)
		| 5 // 日付
		| 6 //コンボボックス
		| 7 // ラジオボタン
		| 8 //チェックボックス
		| 9 // 日数
		| 10
		| 11
		| 12
		| 13
		| 14 // ユーザー
		| 15
		| 16 // ファイル
		| 17;
	group1: string;
	group2: string;
	tag1: string;
	tag2: string;
	tag3: string;
	value: string;
}

export interface DXAPI_amountType {
	customerNumber: string;
	note: string;
	amountWithTax: number;
	contractAt: Date;
}

/** 都道府県番号型（1〜47）
 * 1:北海道, 2:青森県, 3:岩手県, 4:宮城県, 5:秋田県, 6:山形県, 7:福島県
 * 8:茨城県, 9:栃木県, 10:群馬県, 11:埼玉県, 12:千葉県, 13:東京都, 14:神奈川県
 * 15:新潟県, 16:富山県, 17:石川県, 18:福井県, 19:山梨県, 20:長野県
 * 21:岐阜県, 22:静岡県, 23:愛知県, 24:三重県, 25:滋賀県, 26:京都府, 27:大阪府, 28:兵庫県, 29:奈良県, 30:和歌山県
 * 31:鳥取県, 32:島根県, 33:岡山県, 34:広島県, 35:山口県
 * 36:徳島県, 37:香川県, 38:愛媛県, 39:高知県
 * 40:福岡県, 41:佐賀県, 42:長崎県, 43:熊本県, 44:大分県, 45:宮崎県, 46:鹿児島県, 47:沖縄県
 */
export type PrefectureCode =
	| 1 // 北海道
	| 2 // 青森県
	| 3 // 岩手県
	| 4 // 宮城県
	| 5 // 秋田県
	| 6 // 山形県
	| 7 // 福島県
	| 8 // 茨城県
	| 9 // 栃木県
	| 10 // 群馬県
	| 11 // 埼玉県
	| 12 // 千葉県
	| 13 // 東京都
	| 14 // 神奈川県
	| 15 // 新潟県
	| 16 // 富山県
	| 17 // 石川県
	| 18 // 福井県
	| 19 // 山梨県
	| 20 // 長野県
	| 21 // 岐阜県
	| 22 // 静岡県
	| 23 // 愛知県
	| 24 // 三重県
	| 25 // 滋賀県
	| 26 // 京都府
	| 27 // 大阪府
	| 28 // 兵庫県
	| 29 // 奈良県
	| 30 // 和歌山県
	| 31 // 鳥取県
	| 32 // 島根県
	| 33 // 岡山県
	| 34 // 広島県
	| 35 // 山口県
	| 36 // 徳島県
	| 37 // 香川県
	| 38 // 愛媛県
	| 39 // 高知県
	| 40 // 福岡県
	| 41 // 佐賀県
	| 42 // 長崎県
	| 43 // 熊本県
	| 44 // 大分県
	| 45 // 宮崎県
	| 46 // 鹿児島県
	| 47; // 沖縄県;
/**
 * 都道府県番号と都道府県名の対応表
 */
const PREF_CODE_NAME_MAP: { [key in PrefectureCode]: string } = {
	1: "北海道",
	2: "青森県",
	3: "岩手県",
	4: "宮城県",
	5: "秋田県",
	6: "山形県",
	7: "福島県",
	8: "茨城県",
	9: "栃木県",
	10: "群馬県",
	11: "埼玉県",
	12: "千葉県",
	13: "東京都",
	14: "神奈川県",
	15: "新潟県",
	16: "富山県",
	17: "石川県",
	18: "福井県",
	19: "山梨県",
	20: "長野県",
	21: "岐阜県",
	22: "静岡県",
	23: "愛知県",
	24: "三重県",
	25: "滋賀県",
	26: "京都府",
	27: "大阪府",
	28: "兵庫県",
	29: "奈良県",
	30: "和歌山県",
	31: "鳥取県",
	32: "島根県",
	33: "岡山県",
	34: "広島県",
	35: "山口県",
	36: "徳島県",
	37: "香川県",
	38: "愛媛県",
	39: "高知県",
	40: "福岡県",
	41: "佐賀県",
	42: "長崎県",
	43: "熊本県",
	44: "大分県",
	45: "宮崎県",
	46: "鹿児島県",
	47: "沖縄県",
};

/**
 * 都道府県番号から都道府県名へ変換
 */
export function prefCodeToName(code: PrefectureCode): string {
	return PREF_CODE_NAME_MAP[code];
}

/**
 * 都道府県名から都道府県番号へ変換
 */
export function prefNameToCode(name: string): PrefectureCode | undefined {
	const entry = Object.entries(PREF_CODE_NAME_MAP).find(([, n]) => n === name);
	return entry ? (Number(entry[0]) as PrefectureCode) : undefined;
}

export interface TantoType {
	eigyo?: string;
	sekkei?: string;
	ic?: string;
	kantoku?: string;
	gaiko?: string;
	bunzyoEigyo?: string;
}
/**
 * c-DXの担当データを各IDに割り当ててオブジェクトで返す。
 * すべての担当を一意の値で合成したallTantoも返す
 */
export function tantoReplace(tantoInfo: DXAPI_tantoType[] | undefined) {
	if (!tantoInfo) return "";
	const typeMap: Record<string, keyof typeof types> = {
		営業: "eigyo",
		設計士: "sekkei",
		コーディネーター: "ic",
		現場監督: "kantoku",
		外構: "gaiko",
		分譲地営業: "bunzyoEigyo",
		allTanto: "allTanto",
	};

	const types = tantoInfo.reduce(
		(acc, tanto) => {
			const key = typeMap[tanto.typeName];
			if (key) acc[key].add(tanto.tanto); // `Set` なので重複自動排除
			acc.allTanto.add(tanto.tanto); // 全体のSetにも追加
			return acc;
		},
		{
			eigyo: new Set<string>(),
			sekkei: new Set<string>(),
			ic: new Set<string>(),
			kantoku: new Set<string>(),
			gaiko: new Set<string>(),
			bunzyoEigyo: new Set<string>(),
			allTanto: new Set<string>(),
		},
	);

	// 結果を文字列に変換
	const result: TantoType = Object.fromEntries(
		Object.entries(types).map(([key, value]) => [
			key,
			Array.from(value).join(","),
		]),
	);

	return result;
}
