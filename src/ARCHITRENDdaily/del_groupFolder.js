const fs = require("node:fs");
const path = require("node:path");

// 不要なグループフォルダを全て削除する
// フォルダのパスを指定
const folderPath = "z:ATDATA"; // ATDATAパスを指定
const folderNames = ["(グループ)A-1建築確認", "(グループ)A-4新築工事関係"];

function searchForEmptyFolders(folderPath, folderNames, maxDepth) {
	const emptyFolders = [];

	function search(currentPath, currentDepth) {
		if (currentDepth > maxDepth) {
			return;
		}

		const dirs = fs.readdirSync(currentPath);

		for (const dir of dirs) {
			const dirPath = path.join(currentPath, dir);
			const stats = fs.statSync(dirPath);

			if (stats.isDirectory()) {
				if (folderNames.includes(dir) && stats.size === 0) {
					emptyFolders.push(dirPath);
				}
				search(dirPath, currentDepth + 1);
			}
		}
	}

	search(folderPath, 0);
	return emptyFolders;
}

function deleteFolders(folders) {
	for (const folder of folders) {
		fs.rmdirSync(folder, { recursive: true });
		console.log(`フォルダを削除しました: ${folder}`);
	}
}

const maxDepth = 3; // 3階層まで検索

// "(グループ)A-1建築確認" および "(グループ)A-4新築工事関係" のフォルダを探し、空の場合に削除
const emptyFolders = searchForEmptyFolders(folderPath, folderNames, maxDepth);

if (emptyFolders.length > 0) {
	console.log("次の空のフォルダが見つかりました:");
	for (const folder of emptyFolders) {
		console.log(folder);
	}

	// 空のフォルダを削除
	deleteFolders(emptyFolders);
} else {
	console.log(
		"指定したフォルダ内および3階層までに空のフォルダは見つかりませんでした。",
	);
}
