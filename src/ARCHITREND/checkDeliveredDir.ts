import fs from "fs";
import path from "path";
import iconv from "iconv-lite";

console.log("start: checkDeliveredDir.ts");

// CSV出力用のファイルパス
const outputCsvPath = "Z:/admin/output/workspaceOutput.csv";

// "■引渡済(3年内)" で終わるフォルダのみを取得
const targetFolder = "Z:/ATDATA";
const targetFolders = fs
	.readdirSync(targetFolder, { withFileTypes: true })
	.filter(
		(dirent) =>
			dirent.isDirectory() &&
			/■引渡済\(3年内\)$/.test(dirent.name) &&
			dirent.name !== "$Recycle.Bin",
	)
	.map((dirent) => dirent.name);

// 今年の年数を取得
const currentYear = new Date().getFullYear();
const excludeYears = [
	`${currentYear}年`,
	`${currentYear - 1}年`,
	`${currentYear - 2}年`,
];

console.log("対象フォルダ：階層1", targetFolders);
console.log("対象外：階層2", excludeYears);

// CSVデータを格納する配列
const csvData: string[] = ["count,currentDir,yearDir,cmDir"];
let totalFolderCount = 0;
for (const folder of targetFolders) {
	console.log(`-----${folder}-----`);
	const countFolders = fs
		.readdirSync(path.join(targetFolder, folder), { withFileTypes: true })
		.filter(
			(dirent) =>
				dirent.isDirectory() &&
				!excludeYears.includes(dirent.name) &&
				!dirent.name.startsWith("※") &&
				dirent.name !== "$Recycle",
		)
		.map((dirent) => dirent.name);

	for (const countFolder of countFolders) {
		const cmDir = fs
			.readdirSync(path.join(targetFolder, folder, countFolder), {
				withFileTypes: true,
			})
			.filter((dirent) => dirent.isDirectory() && dirent.name !== "$Recycle");
		for (const dir of cmDir) {
			totalFolderCount++;
			console.log(totalFolderCount, dir.name);
			// CSVデータとして追加
			csvData.push(`${totalFolderCount},${folder},${countFolder},${dir.name}`);
		}
	}
}

// CSVデータをShift-JISエンコードに変換
const csvBuffer = iconv.encode(csvData.join("\n"), "shift_jis");

// Shift-JISでファイルに書き出し
try {
	fs.writeFileSync(outputCsvPath, csvBuffer);
	console.log(`CSV出力: ${outputCsvPath}`);
} catch (e) {
	console.error(e);
}
