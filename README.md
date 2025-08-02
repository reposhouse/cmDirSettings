**Google Drive** 自動フォルダ作成

#### `src/googleWorkspaceCreateCmDir/main.ts`

**Google Drive フォルダの自動作成・管理**

-   **機能**: c-DX の契約台帳と Google Drive の同期管理
-   **処理フロー**:
    1. c-DX から引渡済み契約台帳一覧を取得
    2. Google Drive の年別フォルダ一覧を取得
    3. 差分を分析（新規作成・更新・削除対象を特定）
    4. 不足しているフォルダを自動作成
    5. 更新用 Excel ファイルを出力
-   **実行方法**: `tsx src/googleWorkspaceCreateCmDir/main.ts`
-   **パラメータ**: 年指定可能（例: `tsx main.ts 2024`）
