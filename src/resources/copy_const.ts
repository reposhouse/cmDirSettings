import * as os from "node:os";
import path from "node:path";
import dotenv from "dotenv";

export function envImport(envName: string, envPath?: string): string {
	dotenv.config({ path: envPath ?? path.resolve(__dirname, "../.env"), quiet: true, });
	const env = process.env[envName];
	if (env === undefined) {
		throw new Error(`環境変数 ${envName} が定義されていません。`);
	}
	return env;
}

// 環境設定
export const isMainSV = os.hostname() === "main-SV";

// パス設定
export const PATHS = {
	// 環境に応じて変わるパス
	ADMIN_CODE: isMainSV ? "E:/Administration/code/" : "X:/code",
	ESTIMATEMASTER: isMainSV ? "E:/Estimatemaster/nameList/" : "E:/nameList/",
} as const;

/**
 * 汎用タイマー関数
 */
type TimerData = {
	start: number | null;
	total: number;
};

const timers: Record<string, TimerData> = {};

/**
 * 実行間の経過時間と累計時間を、呼び出し関数ごとに記録・表示します。
 *
 * - 引数に `true` を渡すと、全てのタイマー記録を破棄し、合計実行時間のみを表示します。
 */
export function startEndLog_And_timer(resetAll: boolean = false): void {
	if (resetAll) {
		// 全リセット
		Object.keys(timers).forEach((key) => delete timers[key]);
		return;
	}

	const label = getCallerFunctionName();
	if (!timers[label]) {
		timers[label] = { start: null, total: 0 };
	}

	const now = Date.now();
	const timer = timers[label];

	if (timer.start === null) {
		timer.start = now;
		console.log(`[ Start ]  :  ${label}`);
	} else {
		const elapsed = now - timer.start;
		timer.total += elapsed;

		console.log(
			`[ End ]  :  ${label} :  ⏱️  ${(elapsed / 1000).toFixed(3)}s / ` +
				`${showTotalTime()}`,
		);

		timer.start = null;
	}
}

/**
 * 呼び出し元の関数名を取得
 */
function getCallerFunctionName(): string {
	const stack = new Error().stack;
	if (!stack) return "不明な関数";

	const lines = stack.split("\n").map((line) => line.trim());
	const callerLine = lines[3] ?? "";
	const match = callerLine.match(/at\s+(.*)\s+\(/);
	return match?.[1] ?? "匿名関数";
}

/**
 * その時点の累計時間を表示
 */
function showTotalTime(): string {
	const grandTotal = Object.values(timers).reduce((acc, timer) => {
		if (timer.start !== null) {
			return acc + (Date.now() - timer.start + timer.total);
		}
		return acc + timer.total;
	}, 0);
	return `⏱️ 累計 : ${(grandTotal / 1000).toFixed(3)}s`;
}
