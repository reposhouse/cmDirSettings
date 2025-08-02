@echo off
setlocal
echo ※このコードはseverでのみ実行可能
echo 毎日23時にARCHITRENDのログインデータを消去します。

:: PC名を取得
for /f "delims=" %%a in ('hostname') do set PC_NAME=%%a

:: PC名が"main-SV"でない場合、スクリプトを終了
echo PC名：%PC_NAME%
if not "%PC_NAME%"=="main-SV" (
    echo このスクリプトはこのPCでは実行できません。
    exit /b
)

@REM AT21_ini.###を初期化
type nul > "E:\share\AT21_ini.###"
timeout 1

set powershell="%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe"
pushd "E:\Administration\code\cmDirSettings\src\ARCHITRENDdaily"

echo グループフォルダとロックファイルも削除
start /wait %powershell% "del_groupFolder.js" > C:\codeLogs\ARCHITRENDdirList_taskScheduler.log
timeout 1

start /wait %powershell% "del_lockfile.js" >> C:\codeLogs\ARCHITRENDdirList_taskScheduler.log
timeout 1

echo ローカルフォルダリストの作成
tsx "ARCHITRENDdirList.ts" >> C:\codeLogs\ARCHITRENDdirList_taskScheduler.log

endlocal

