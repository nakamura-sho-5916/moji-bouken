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

## 教材データ基盤

教材データは `src/content` にJSONとして保存します。UIからJSONを直接参照せず、`src/content/loaders/contentLoader.ts` を通して検証済みデータだけを利用します。

初期版では音声問題を実装しません。書字認識も将来拡張とし、現時点ではタップ・選択・並べ替えを中心にします。

### 各JSONの役割

- `hiragana.json`: 基本ひらがな46文字と行・表示順・対応カタカナ
- `katakana.json`: 基本カタカナ46文字と対応ひらがな、拡張候補
- `words.json`: 小学2年生向けの身近な単語
- `illustrations.json`: 単語とイラスト資産の参照情報
- `similarLetters.json`: 視覚的に混同しやすい文字グループ
- `missions/*.json`: 学習形式ごとのサンプルミッション
- `schemas/mission.schema.json`: ミッションJSON Schema

### 教材の追加方法

新しい文字を追加する場合は、`hiragana.json` または `katakana.json` に一意な `id`、`character`、`scriptType`、`row`、`order`、`active`、`variants`、`relatedLetterId` を追加します。基本46文字に含めない拡張文字は `active: false` から始めます。

新しい単語を追加する場合は、`words.json` に `id`、`display`、`reading`、`letterIds`、`category`、`difficulty`、`illustrationId` を追加し、参照する文字IDとイラストIDが存在することを確認します。

イラストを差し替える場合は、`public/assets/illustrations/placeholders` 配下のSVGを置き換え、`illustrations.json` の `assetPath`、`altText`、`fallbackText` を確認します。外部URLには依存しません。

ミッションを追加する場合は、該当する `src/content/missions/*.json` に追加し、`mission.schema.json` に適合させます。`correctAnswer` は必ず `choices` 内に含め、`choices` の重複を避けます。

### JSON Schema検証

ミッションSchema検証には `Ajv` を採用しています。採用理由は、JSON Schemaに基づく検証を実行時とテストで共通化し、不正データだけを除外して正常データの利用を継続できるためです。

教材品質テストは `npm run test:run` で実行され、重複ID、空文字、存在しない文字ID・イラストID、choices重複、正解不在、Schema不一致を検出します。

### 開発用教材確認画面

開発環境では `/debug/content` で以下を確認できます。

- ひらがな件数
- カタカナ件数
- 単語件数
- イラスト件数
- 似た文字グループ件数
- ミッション件数
- 検証エラー件数
- 先頭データ

本番ビルドでは `/debug/content` は有効化しません。

## 学習エンジン

学習エンジンは `src/features/learning` に配置し、UIからは `src/services/learningService.ts` を通して利用します。React UIからIndexedDBの集計や判定ロジックを直接実行せず、純粋関数と `LearningEngine` の公開APIに分離しています。

### LearningEngine API

- `LearningEngine.recordAnswer(input)`: 1回答を `LearningLog` と `LetterProgress` に反映します。同じ `answerId` は二重保存しません。
- `LearningEngine.getDueReviews(options)`: 当日以前の未完了復習予定を古い順で取得します。同じ文字の重複は整理します。
- `LearningEngine.createQuestionCandidates(options)`: 復習、苦手、通常、新規を混ぜて出題候補を作成します。
- `LearningEngine.getLearningDebugState()`: 開発確認用に学習ログ、文字進捗、復習予定を取得します。
- `LearningEngine.resetDebugLearningData()`: 開発確認用に学習関連データを初期化します。

### 判定ルール

- 正答率は `correctCount / attempts` で計算し、0除算時は `0` とします。保存値は0〜1のnumberです。
- 苦手文字は、出題3回以上かつ正答率70%以下で判定します。
- 習得済みは、直近5回中4回以上正解、現在の正答率80%以上、7日後復習を正解した場合に判定します。
- 苦手文字の復習予定は、回答日の翌日、3日後、7日後に作成します。日付計算は端末のローカル日付で行います。
- 回答時間は100ms未満を100ms、300000ms超を300000msに補正します。制限時間やカウントダウンは子ども画面に表示しません。
- 前回正解時より5%以上かつ50ms以上短く正解した場合に、回答時間改善と判定します。

### 出題候補

標準セッションは10問です。初期比率は復習40%、苦手30%、通常20%、新規10%を目安にし、候補不足時は他カテゴリで補います。新規文字は1セッション最大2種類までに制限し、同じ文字や同じミッション形式が連続しすぎないように調整します。乱数seedを指定すると、テスト可能な再現性を持つ候補列を作れます。

### 報酬ボーナス理由

`recordAnswer` は以下のボーナス理由を返します。

- `normal-correct`
- `speed-improvement`
- `weak-letter-progress`
- `weak-letter-mastered`
- `final-review-completed`

### 開発用学習確認画面

開発環境では `/debug/learning` で学習エンジンの動作を確認できます。回答保存、苦手判定、復習予定、出題候補生成、リロード後の永続化確認、デバッグデータ初期化を行えます。本番ビルドでは `/debug/learning` は有効化しません。

### アルゴリズム変更時の注意

苦手判定、習得判定、復習間隔、出題比率、回答時間補正、報酬理由を変更する場合は、`tests/unit/learning/learningEngine.test.ts` の単体・統合テストを更新し、既存データを消さない方針を守ります。子ども画面では達成率や制限時間を中心にせず、成長表現は世界の復興、仲間、装備、新エリアで見せます。

## ミッションエンジン

`src/features/missions` に、教材ミッションを表示して回答結果を保存する基盤を配置しています。`MissionRunner` は現在のミッションを読み込み、`missionType` に応じた表示コンポーネントへ切り替えます。回答判定、回答時間計測、二重送信防止、`LearningEngine.recordAnswer` への保存は共通処理に集約しています。

### 対応済みミッション形式

- `letter-introduction`
- `letter-search`
- `similar-letter-choice`
- `illustration-letter-choice`
- `illustration-word-choice`
- `word-completion`
- `word-ordering`
- `vertical-reading`
- `horizontal-reading`
- `text-search`

`boss-mixed` は未対応です。現在は安全な代替画面を表示し、アプリ全体が停止しないようにしています。将来のバトル・報酬システムと連携する予定です。

### 回答記録方針

回答時間は、ミッション表示開始から回答確定操作までを計測します。正解演出、次画面への遷移、保存処理の時間は回答時間へ含めません。`letter-introduction` は正誤を伴わない導入ミッションのため、正答率計算には含めません。

誤答後の再挑戦は練習扱いです。最初の回答だけを学習記録として保存し、その後は正しい答えを選べるまで進行できます。保存失敗時は次へ進まず、再送信できる状態にします。子ども画面には技術的なエラー詳細を表示しません。

### セッション構造

標準セッションは10問です。`LearningEngine.createQuestionCandidates` の出題候補を利用し、教材ミッションが不足・偏りそうな場合は既存のサンプルミッションで補完します。セッション状態は `sessionId`、`missions`、`currentIndex`、`results`、`startedAt`、`completedAt`、`status`、`seed` を持ちます。状態はlocalStorageへ保存し、完了後は `/result` で簡単な達成表示を行います。

`word-ordering` は初期版ではドラッグではなくタップ式です。スマートフォンで操作しやすく、誤操作を減らし、テストしやすい構造にするためです。`vertical-reading` はCSSの `writing-mode: vertical-rl` を使い、日本語文字そのものを不自然に回転させません。`text-search` は文章理解ではなく、初期版では文字・単語の探索を中心にしています。

### 動的ミッション追加方針

教材ミッションを動的生成する場合は、元教材IDを保持し、`missionId` を一意にし、`correctAnswer` を必ず含めます。選択肢の重複を避け、同一セッション内で完全に同じ問題を重複させない方針です。seedを使ってテスト可能な生成にします。将来の書字認識・音声問題は未実装です。

### 開発用ミッション確認画面

開発環境では `/debug/missions` を利用できます。ミッション形式の選択、サンプルミッション表示、10問セッション生成、seed指定、保存結果確認、テストデータリセットを行えます。本番ビルドでは子ども向けナビゲーションには表示しません。

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
