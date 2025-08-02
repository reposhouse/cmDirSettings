import fs from "fs";
import path from "path";

main();
async function main() {
	const baseDir = "Z:/ATDATA";
	const currentDir = fs
		.readdirSync(baseDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() && dirent.name !== "$Recycle")
		.map((dirent) => `${dirent.name}/$Recycle`);

	// 削除予定のフォルダを格納するリスト
	const targetDirs: string[] = [];

	for (const dir of currentDir) {
		const recycleDir = path.join(baseDir, dir);

		// $Recycleディレクトリが存在するかチェック
		if (!fs.existsSync(recycleDir)) {
			console.log(`スキップ: ${recycleDir} は存在しません`);
			continue;
		}

		const subDirs = fs
			.readdirSync(recycleDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => path.join(recycleDir, dirent.name));

		// 削除予定のフォルダをリストに追加
		targetDirs.push(...subDirs);
	}

	// `Promise.all` を使用して並列処理
	await Promise.all(
		targetDirs.map(async (dir) => {
			console.log(`対象: ${dir}`);
			await fs.promises.rm(dir, { recursive: true, force: true });
		}),
	);
}
