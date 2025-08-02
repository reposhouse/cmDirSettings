"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
main();
async function main() {
    const baseDir = "Z:/ATDATA";
    const currentDir = fs_1.default
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name !== "$Recycle")
        .map((dirent) => `${dirent.name}/$Recycle`);
    // 削除予定のフォルダを格納するリスト
    const targetDirs = [];
    for (const dir of currentDir) {
        const recycleDir = path_1.default.join(baseDir, dir);
        // $Recycleディレクトリが存在するかチェック
        if (!fs_1.default.existsSync(recycleDir)) {
            console.log(`スキップ: ${recycleDir} は存在しません`);
            continue;
        }
        const subDirs = fs_1.default
            .readdirSync(recycleDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => path_1.default.join(recycleDir, dirent.name));
        // 削除予定のフォルダをリストに追加
        targetDirs.push(...subDirs);
    }
    // `Promise.all` を使用して並列処理
    await Promise.all(targetDirs.map(async (dir) => {
        console.log(`対象: ${dir}`);
        await fs_1.default.promises.rm(dir, { recursive: true, force: true });
    }));
}
