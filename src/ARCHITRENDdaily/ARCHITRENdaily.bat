@echo off
setlocal
echo �����̃R�[�h��sever�ł̂ݎ��s�\
echo ����23����ARCHITREND�̃��O�C���f�[�^���������܂��B

:: PC�����擾
for /f "delims=" %%a in ('hostname') do set PC_NAME=%%a

:: PC����"main-SV"�łȂ��ꍇ�A�X�N���v�g���I��
echo PC���F%PC_NAME%
if not "%PC_NAME%"=="main-SV" (
    echo ���̃X�N���v�g�͂���PC�ł͎��s�ł��܂���B
    exit /b
)

@REM AT21_ini.###��������
type nul > "E:\share\AT21_ini.###"
timeout 1

set powershell="%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe"
pushd "E:\Administration\code\cmDirSettings\src\ARCHITRENDdaily"

echo �O���[�v�t�H���_�ƃ��b�N�t�@�C�����폜
start /wait %powershell% "del_groupFolder.js" > C:\codeLogs\ARCHITRENDdirList_taskScheduler.log
timeout 1

start /wait %powershell% "del_lockfile.js" >> C:\codeLogs\ARCHITRENDdirList_taskScheduler.log
timeout 1

echo ���[�J���t�H���_���X�g�̍쐬
tsx "ARCHITRENDdirList.ts" >> C:\codeLogs\ARCHITRENDdirList_taskScheduler.log

endlocal

