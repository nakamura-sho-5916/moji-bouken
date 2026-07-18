# もじぼうけん！

## プロジェクト概要

もじぼうけん！は、小学2年生を主対象とする、ひらがな・カタカナ学習RPGです。

## 教育目的

単なる文字暗記ではなく、形を知る、形を探す、意味と結び付ける、組み合わせる、表出する、文章や生活で活用する、他教科へ応用する、という学習過程を育てます。

## 技術構成

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- PWA
- IndexedDB
- localStorage
- Vitest
- React Testing Library
- Playwright

## 開発環境

- OS: Windows
- Shell: Windows PowerShell 5.1
- Node.js: v24.16.0
- npm: 11.13.0
- Git: 2.55.0.windows.3
- Git実行ファイル: `C:\Program Files\Git\cmd\git.exe`
- ブランチ: main
- TypeScript: プロジェクトローカルに導入予定
- VS Code: 必須としない
- PowerShell 7: 必須としない
- Bash: 必須としない

## 現在の進捗

- Issue 001：開発環境の確認 完了
- Issue 002：Viteプロジェクトの作成 完了
- Issue 003：Git管理対象の整理 完了
- Issue 004：基本ディレクトリの作成 完了
- Issue 005：TypeScript strict設定 完了
- Issue 006：ESLint設定 完了
- Issue 007：Prettier設定 完了
- Issue 008：Tailwind CSS導入 完了
- Issue 009：Vitest導入 完了
- Issue 010：Playwright導入 完了
- Issue 011：アプリシェルの作成 完了
- Issue 012：ルーティング導入 完了
- Issue 013：共通エラーバウンダリ 完了
- Issue 014：共通ローディング画面 完了
- Issue 015：オフライン状態表示 完了
- Issue 016：PWA基本設定 完了
- Issue 017：Service Worker設定 完了
- Issue 018：アプリ更新通知 完了
- Issue 019：デザイントークン設定 完了
- Issue 020：共通アニメーション設定 完了

## 現在実装済みの画面

現在の画面は、アプリ基盤を確認するための仮画面です。ゲーム本編の学習・バトル・報酬機能はまだ実装していません。

- タイトル: `/`
- ホーム: `/home`
- ぼうけん: `/world`
- ミッション: `/mission`
- バトル: `/battle`
- けっか: `/result`
- ずかん: `/collection`
- 保護者: `/parent`
- せってい: `/settings`
- 404: 存在しないURL

## 開発コマンド

- `npm install`: 依存関係をインストールする
- `npm run dev`: 開発サーバーを起動する
- `npm run build`: 型チェック後に本番ビルドを作成する
- `npm run preview`: 本番ビルドのプレビューサーバーを起動する
- `npm run lint`: ESLintでコードを確認する
- `npm run typecheck`: TypeScriptの型チェックを実行する
- `npm run format`: Prettierで整形する
- `npm run format:check`: Prettierの整形状態を確認する
- `npm run test:run`: 単体テストを1回実行する
- `npm run test:e2e`: PlaywrightのE2Eテストを実行する

## ブラウザで確認する手順

1. `npm install` を実行する
2. `npm run dev` を実行する
3. ターミナルに表示されたローカルURLをブラウザで開く
4. トップ画面に「もじぼうけん！」が表示されることを確認する
5. 「はじめる」を押してホーム画面へ移動することを確認する

## PWAビルド方法

1. `npm run build` を実行する
2. `dist/manifest.webmanifest` と `dist/sw.js` が生成されることを確認する
3. `npm run preview` を実行する
4. プレビューURLをブラウザで開き、ブラウザのインストール操作からPWAとして追加できることを確認する

## オフライン確認方法

1. `npm run build` を実行する
2. `npm run preview` を実行する
3. ブラウザでプレビューURLを一度開く
4. 開発者ツールなどでオフライン状態に切り替える
5. ページを再読み込みし、基本画面が開けることを確認する
6. アプリ上に「オフラインでも あそべるよ」が表示されることを確認する

## データ保存基盤

学習進捗、復習予定、世界の復興状況、所持品などの継続データは IndexedDB に保存します。IndexedDBを使う理由は、ログイン不要・サーバー不要・単一端末利用の方針に合い、学習履歴のような構造化データをオフラインで保持しやすいためです。

- DB名: `moji-bouken-db`
- DBバージョン: `1`
- データ保存場所: 利用端末のブラウザ内 IndexedDB
- DB操作: Reactコンポーネントへ直接書かず、`src/db/repositories` に集約

### Object Store

- `players`: keyPath `id`
- `learningLogs`: keyPath `id`
- `letterProgress`: keyPath `id`
- `reviewSchedules`: keyPath `id`
- `worldProgress`: keyPath `id`
- `inventories`: keyPath `playerId`
- `settings`: keyPath `playerId`

### Index

- `learningLogs`: `by-player`, `by-letter`, `by-mission`, `by-answered-at`
- `letterProgress`: `by-player`, `by-letter`, `by-weak-flag`, `by-mastered-flag`
- `reviewSchedules`: `by-player`, `by-letter`, `by-scheduled-date`, `by-completed`
- `worldProgress`: `by-player`, `by-area`

### 初期データ

- Player: `default-player`, 名前 `ぼうけんしゃ`, level `1`, experience `0`, gold `0`
- WorldProgress: `starting-village`, unlocked `true`, recoveryStage `0`, unlockedEvents `[]`
- Inventory: playerId `default-player`, gold `0`, items `[]`, equipment `[]`, companions `[]`
- AppSettings: bgmEnabled `true`, soundEffectsEnabled `true`, reducedMotion `false`, parentPinConfigured `false`

### 開発用確認画面

開発環境では `/debug/data` で DB名、DBバージョン、Object Store一覧、初期データを確認できます。通常の子ども向けナビゲーションには表示しません。本番ビルドではルートを有効化しません。

### Chrome DevToolsでの確認方法

1. `npm run dev` を実行する
2. ブラウザでアプリを開く
3. Chrome DevToolsを開く
4. Application タブを開く
5. Storage の IndexedDB から `moji-bouken-db` を確認する

### DB migration追加手順

1. `src/db/constants.ts` の `DB_VERSION` を上げる
2. `src/db/migrations/versionX.ts` を追加する
3. `src/db/migrations/index.ts` の `runMigrations` に `oldVersion < X` の条件で追加する
4. 既存Object Storeや既存データは削除しない
5. migrationのテストを追加する

### データ削除時の注意

IndexedDBには学習履歴と進行データが保存されます。削除すると復習予定や進捗が失われるため、保護者向けの明示操作なしに削除しない方針です。

### 採用ライブラリ

- `idb`: IndexedDBの非同期処理と型付けを軽く扱うために採用
- `fake-indexeddb`: Node.js上の単体テストでIndexedDBを再現するために採用

## テスト方法

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:run`
5. `npm run build`
6. `npm run test:e2e`

## Git利用上の注意

- GitがPATH未反映の場合は `C:\Program Files\Git\cmd\git.exe` を直接使用します。
- mainブランチを使用します。
- ユーザーの明示指示がない限りcommitしません。
- `reset --hard`、`clean -fd`、強制削除は禁止です。
- `.git` フォルダを削除・移動しません。
- `.git-empty-backup` は削除せず、`.gitignore` 対象のまま保持します。
