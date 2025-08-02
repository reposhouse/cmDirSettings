import { main } from "@/cmDir/GDriveCreateCmDir/main";

const targetYear = "";

cmd_createCmFolder(targetYear);
async function cmd_createCmFolder(targetYear: string) {
	console.log(`targetYear: ${targetYear}`);
	try {
		await main(targetYear);
		console.log("createCmFolder実行完了");
	} catch (error) {
		console.error("createCmFolder実行エラー:", error);
	}
}
