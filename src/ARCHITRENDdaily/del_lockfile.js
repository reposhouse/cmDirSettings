const fs = require("node:fs");
const path = require("node:path");

// お客様フォルダの専有を管理しているファイルを全て削除する

// フォルダのパスを指定
const folderPath = "Z:/ATDATA";
const targetFile = "Semaphore.dat";
const maxDepth = 3; // 3階層まで検索

function searchForFilesRecursive(folderPath, targetFile, maxDepth) {
	const foundFiles = [];

	function search(currentPath, currentDepth) {
		if (currentDepth > maxDepth) {
			return;
		}

		const files = fs.readdirSync(currentPath);
		for (const file of files) {
			const filePath = path.join(currentPath, file);
			const stats = fs.statSync(filePath);

			if (stats.isDirectory()) {
				search(filePath, currentDepth + 1);
			} else if (file === targetFile) {
				foundFiles.push(filePath);
			}
		}
	}

	search(folderPath, 0);
	return foundFiles;
}

// 指定フォルダ内および3階層まで再帰的にSemaphore.datを探し、配列に格納
const foundFiles = searchForFilesRecursive(folderPath, targetFile, maxDepth);

if (foundFiles.length > 0) {
	console.log("次の場所で Semaphore.dat ファイルが見つかりました:");
	for (const file of foundFiles) {
		console.log(file);
		fs.unlinkSync(file);
	}
} else {
	console.log(
		"Semaphore.dat ファイルは指定したフォルダ内および3階層までに見つかりませんでした。",
	);
}
