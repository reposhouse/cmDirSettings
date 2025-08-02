@echo off
cd %~dp0

@REM 他のところで作成したコードをimportして流用出来るようにするもの
@REM 直接Path指定して見るようにするとtsエラーになるため

@REM 必要なもののみ残して実行する

@echo on

@REM const
copy /Y "X:\code\API\src\const\_const.ts" "copy_const.ts"

@REM LINEWORKS
@REM copy /Y "X:\code\LINEWORKS\src\resources\getAccessToken.ts" "getAccessToken.ts"
@REM copy /Y "X:\code\LINEWORKS\src\resources\LwAPI_axios_Administrator.ts" "copy_LwAPI_axios_Administrator.ts"
@REM copy /Y "X:\code\LINEWORKS\src\resources\LwAPI_axios_notificationBOT.ts" "copy_LwAPI_axios_notificationBOT.ts"
@REM copy /Y "X:\code\API\src\DXAPI\gas_LINEWORKS.d.ts" "copy_gas_LINEWORKS.d.ts"
@REM copy /Y "X:\code\API\src\DXAPI\gas_LINEWORKS_bot" "copy_gas_LINEWORKS_bot"


@REM DXAPI
copy /Y "X:\code\API\src\DXAPI\types_DX.ts" "types_DX.ts"
@REM copy /Y "X:\code\API\src\DXAPI\gas_DX_API.ts" "copy_gas_DX_API.ts"
copy /Y "X:\code\API\src\DXAPI\axios_DX_API.ts" "copy_axios_DX_API.ts"

@REM GCP_API
copy /Y "X:\code\API\src\GoogleAPI\GCP_API.ts" "copy_GCP_API.ts"

@echo off
@REM package.jsonのスクリプトをチェックして追加
@REM powershell -Command "try { $jsonText = Get-Content '..\..\package.json' -Raw; if ([string]::IsNullOrWhiteSpace($jsonText)) { Write-Warning 'package.jsonが空のため処理中止'; exit 0 }; $packageJson = $jsonText | ConvertFrom-Json } catch { Write-Warning 'package.jsonの読み込み失敗'; exit 0 }; $scripts = $packageJson.scripts; if ($null -eq $scripts) { $packageJson | Add-Member -MemberType NoteProperty -Name scripts -Value @{}; $scripts = $packageJson.scripts }; $requiredScripts = @{ 'check' = 'biome lint && tsc --noEmit'; 'nuc_minor' = 'ncu -u --target minor'; 'resource-import' = 'cmd /c \"src\\resources\\resourceImport.cmd\"' }; $needsUpdate = $false; foreach ($script in $requiredScripts.GetEnumerator()) { if (-not $scripts.PSObject.Properties.Name.Contains($script.Key)) { $scripts | Add-Member -NotePropertyName $script.Key -NotePropertyValue $script.Value -Force; $needsUpdate = $true } }; if ($needsUpdate) { try { $packageJson | ConvertTo-Json -Depth 10 | Out-File '..\..\package.json' -Encoding utf8 } catch { Write-Warning 'package.jsonの書き込み失敗' } } else { Write-Host 'package.jsonに変更なし' }"

npm run check
