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
