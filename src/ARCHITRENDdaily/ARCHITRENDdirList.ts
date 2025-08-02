import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
	type driveData,
	getGoogleWorkspaceList,
	getSharedDriveName,
	type mgdzData,
} from "./googleWorkspace";

// 型定義
interface TreeNode {
	id: number;
	label: string;
	children?: TreeNode[];
	url?: string;
}

// 一意のIDを生成するカウンター
let counter = 0;
function getId(): number {
	return counter++;
}
export const isMainSV = os.hostname() === "main-SV";

// フォルダリストをツリーデータに変換する関数
async function getTreeData(rootDir: string, depth = 0): Promise<TreeNode> {
	const files = await fs.readdir(rootDir, { withFileTypes: true });
	const directories = files.filter(
		(file) =>
			file.isDirectory() &&
			file.name !== "$Recycle" &&
			file.name !== "ADMIN" &&
			!/^※.*※$/.test(file.name),
	);

	// ノードの生成
	const node: TreeNode = {
		id: getId(),
		label: path.basename(rootDir),
	};

	// 再帰的に子ノードを取得
	if (depth < 3) {
		const subdirectories = await Promise.all(
			directories.map((dir) =>
				getTreeData(path.join(rootDir, dir.name), depth + 1),
			),
		);
		node.children = subdirectories;
	}

	return node;
}

// JSONファイルへの書き込み
async function writeToJsonFile(
	data: TreeNode[],
	outputDirectory: string,
	fileName: string,
): Promise<void> {
	const output = JSON.stringify(data, null, 2);
	const outputPath = path.join(outputDirectory, `${fileName}.json`);
	await fs.writeFile(outputPath, output);
	console.log(`File has been written to ${outputPath}`);
}

// メイン処理
async function writeCustomerDirList(): Promise<void> {
	console.log("Processing...");
	const results: TreeNode[] = [];

	// 対象ディレクトリの設定
	const prefix = isMainSV ? "E:/share/" : "Z:/";
	const dir = "ATDATA";
	const targetDir = path.join(prefix, dir);

	// ディレクトリのデータ取得
	try {
		const result = await getTreeData(targetDir);
		result.label = dir;
		results.push(result);
	} catch (e) {
		console.error(`Error processing ${dir}:`, e);
	}

	// Google Workspace のデータ取得
	const gwTree: TreeNode = {
		id: getId(),
		label: "GoogleWorkspace",
		children: [],
	};

	const allGwData: mgdzData[] = await getGoogleWorkspaceList();
	const googleDirList: driveData[] | undefined = await getSharedDriveName();

	if (googleDirList) {
		for (const googleDir of googleDirList) {
			const children: TreeNode[] = [];

			// 各データを children に追加
			for (const l of allGwData) {
				if (l.teamDriveId === googleDir.teamDriveId) {
					children.push({ id: getId(), label: l.fileName, url: l.url });
				}
			}

			gwTree.children?.push({
				id: getId(),
				label: googleDir.name,
				children,
			});
		}
	}

	results.push(gwTree);

	// JSON ファイルへ出力
	const prefixResult = isMainSV ? "E:/Estimatemaster/" : "E:/";
	const outputDirectory = path.join(prefixResult, "TRapp", "ARCHITREND");
	await writeToJsonFile(results, outputDirectory, "customerDirList");
}

writeCustomerDirList()
	.then(() => console.log("All files have been written successfully"))
	.catch((err) => console.error("An error occurred:", err));
