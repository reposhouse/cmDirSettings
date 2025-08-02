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
exports.isMainSV = void 0;
const node_fs_1 = require("node:fs");
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const googleWorkspace_1 = require("./googleWorkspace");
// 一意のIDを生成するカウンター
let counter = 0;
function getId() {
    return counter++;
}
exports.isMainSV = os.hostname() === "main-SV";
// フォルダリストをツリーデータに変換する関数
async function getTreeData(rootDir, depth = 0) {
    const files = await node_fs_1.promises.readdir(rootDir, { withFileTypes: true });
    const directories = files.filter((file) => file.isDirectory() &&
        file.name !== "$Recycle" &&
        file.name !== "ADMIN" &&
        !/^※.*※$/.test(file.name));
    // ノードの生成
    const node = {
        id: getId(),
        label: path.basename(rootDir),
    };
    // 再帰的に子ノードを取得
    if (depth < 3) {
        const subdirectories = await Promise.all(directories.map((dir) => getTreeData(path.join(rootDir, dir.name), depth + 1)));
        node.children = subdirectories;
    }
    return node;
}
// JSONファイルへの書き込み
async function writeToJsonFile(data, outputDirectory, fileName) {
    const output = JSON.stringify(data, null, 2);
    const outputPath = path.join(outputDirectory, `${fileName}.json`);
    await node_fs_1.promises.writeFile(outputPath, output);
    console.log(`File has been written to ${outputPath}`);
}
// メイン処理
async function writeCustomerDirList() {
    console.log("Processing...");
    const results = [];
    // 対象ディレクトリの設定
    const prefix = exports.isMainSV ? "E:/share/" : "Z:/";
    const dir = "ATDATA";
    const targetDir = path.join(prefix, dir);
    // ディレクトリのデータ取得
    try {
        const result = await getTreeData(targetDir);
        result.label = dir;
        results.push(result);
    }
    catch (e) {
        console.error(`Error processing ${dir}:`, e);
    }
    // Google Workspace のデータ取得
    const gwTree = {
        id: getId(),
        label: "GoogleWorkspace",
        children: [],
    };
    const allGwData = await (0, googleWorkspace_1.getGoogleWorkspaceList)();
    const googleDirList = await (0, googleWorkspace_1.getSharedDriveName)();
    if (googleDirList) {
        for (const googleDir of googleDirList) {
            const children = [];
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
    const prefixResult = exports.isMainSV ? "E:/Estimatemaster/" : "E:/";
    const outputDirectory = path.join(prefixResult, "TRapp", "ARCHITREND");
    await writeToJsonFile(results, outputDirectory, "customerDirList");
}
writeCustomerDirList()
    .then(() => console.log("All files have been written successfully"))
    .catch((err) => console.error("An error occurred:", err));
