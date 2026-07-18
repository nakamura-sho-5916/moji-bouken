# ISSUES

## Phase 0：準備・開発基盤

- [x] Issue 001：開発環境の確認

- [x] Issue 002：Viteプロジェクトの作成
  - 目的：React＋TypeScriptのViteプロジェクトを初期化する
  - 完了条件：
    - React＋TypeScriptで起動できる
    - npm run devが成功する
    - npm run buildが成功する
  - 依存Issue：Issue 001

- [x] Issue 003：Git管理対象の整理
  - 目的：生成ファイルと除外ファイルを整理する
  - 完了条件：
    - .gitignoreが適切
    - git statusに不要な生成物が表示されない
  - 依存Issue：Issue 002

- [x] Issue 004：基本ディレクトリの作成
  - 目的：保守しやすいフォルダ構成を作る
  - 対象：
    - src/components
    - src/pages
    - src/features
    - src/data
    - src/types
    - src/hooks
    - src/services
    - src/utils
    - src/assets
    - tests
  - 依存Issue：Issue 002

- [x] Issue 005：TypeScript strict設定
  - 目的：型安全性を高める
  - 完了条件：
    - strictが有効
    - typecheckスクリプトがある
    - npm run typecheckが成功する
  - 依存Issue：Issue 002

- [x] Issue 006：ESLint設定
  - 目的：コード品質を一定に保つ
  - 完了条件：
    - npm run lintが成功する
  - 依存Issue：Issue 002

- [x] Issue 007：Prettier設定
  - 目的：コード整形を統一する
  - 完了条件：
    - formatスクリプトがある
    - format:checkスクリプトがある
  - 依存Issue：Issue 002

- [x] Issue 008：Tailwind CSS導入
  - 目的：UIスタイル基盤を作る
  - 完了条件：
    - Tailwindが有効
    - 動作確認用のスタイルが表示される
  - 依存Issue：Issue 002

- [x] Issue 009：Vitest導入
  - 目的：単体テスト環境を構築する
  - 完了条件：
    - npm run testが成功する
    - サンプルテストが1件以上ある
  - 依存Issue：Issue 002

- [x] Issue 010：Playwright導入
  - 目的：E2Eテスト環境を構築する
  - 完了条件：
    - Playwrightの設定ファイルがある
    - 基本的な起動確認テストがある
  - 依存Issue：Issue 002

## Phase 1：アプリ基盤

- [x] Issue 011：アプリシェルの作成
  - 目的：
    スマートフォン縦画面を前提とした共通レイアウトを作成する
  - 完了条件：
    - 画面幅は原則として最大480px
    - PC表示では中央寄せ
    - スマホでは画面幅いっぱいに表示
    - 上部ヘッダー、メイン領域、下部ナビゲーション領域を持つ
    - safe-area-insetへ対応する
    - 最低高さ100dvh
  - 依存Issue：Issue 008

- [x] Issue 012：ルーティング導入
  - 目的：
    主要画面をURL単位で管理する
  - 対象ルート：
    - /
    - /home
    - /world
    - /mission
    - /battle
    - /result
    - /collection
    - /parent
    - /settings
  - 完了条件：
    - React Routerを導入
    - 存在しないURL用の404画面を作成
    - ブラウザの戻る操作が動作する
  - 依存Issue：Issue 011

- [x] Issue 013：共通エラーバウンダリ
  - 目的：
    予期しないエラーで画面全体が停止することを防ぐ
  - 完了条件：
    - ErrorBoundaryコンポーネントを作成
    - 子ども向けのやさしいエラー表示
    - 再読み込みボタン
    - エラー詳細は子ども画面へ表示しない
    - 開発環境ではconsoleへ詳細を出力
  - 依存Issue：Issue 011

- [x] Issue 014：共通ローディング画面
  - 目的：
    データ読込中の共通表示を作成する
  - 完了条件：
    - LoadingScreenコンポーネント
    - 長い文章を使わない
    - キャラクターまたは本の簡単なアニメーション
    - aria-liveへ対応
  - 依存Issue：Issue 011

- [x] Issue 015：オフライン状態表示
  - 目的：
    オフラインでも使えることを分かりやすく知らせる
  - 完了条件：
    - online/offlineイベントを監視
    - オフライン時に小さな通知を表示
    - アプリの操作を妨げない
    - 通信が戻ったら通知を消す
  - 依存Issue：Issue 011

- [x] Issue 016：PWA基本設定
  - 目的：
    スマートフォンのホーム画面へ追加できるようにする
  - 完了条件：
    - manifest設定
    - アプリ名「もじぼうけん！」
    - short_name設定
    - theme_color設定
    - background_color設定
    - display standalone
    - portrait向け設定
    - 192x192と512x512の仮アイコン
  - 依存Issue：Issue 011

- [x] Issue 017：Service Worker設定
  - 目的：
    基本画面をオフラインで起動できるようにする
  - 完了条件：
    - Vite向けPWAプラグインを利用してよい
    - HTML、JS、CSS、主要静的アセットをキャッシュ
    - production buildでService Workerが生成される
    - 開発中の挙動と本番挙動を分離する
  - 依存Issue：Issue 016

- [x] Issue 018：アプリ更新通知
  - 目的：
    新しいバージョンが利用可能な場合に安全に更新できるようにする
  - 完了条件：
    - 更新可能時にUpdatePromptを表示
    - 「あたらしくする」ボタン
    - 「あとで」ボタン
    - 更新によって未保存データを失わない設計
  - 依存Issue：Issue 017

- [x] Issue 019：デザイントークン設定
  - 目的：
    UIの色・文字サイズ・余白・角丸を統一する
  - 完了条件：
    - CSS変数またはTailwindテーマで管理
    - 子ども向け基本色
    - 保護者画面用の落ち着いた色
    - 文字サイズ
    - 余白
    - 角丸
    - 影
    - タップ領域の最小サイズ
  - 依存Issue：Issue 008

- [x] Issue 020：共通アニメーション設定
  - 目的：
    アニメーションの速度と表現を統一する
  - 完了条件：
    - Framer Motion導入
    - ページ遷移
    - ボタンタップ
    - モーダル表示
    - 報酬表示
    - reduced-motion対応
    - 過度に速い点滅を使用しない
  - 依存Issue：Issue 019

## Phase 2：データ保存基盤

- [x] Issue 021：共通データ型の定義
  - 目的：
    ゲーム・学習・保存処理で使用するTypeScript型を定義する
  - 対象：
    - Player
    - Letter
    - Word
    - Mission
    - LearningLog
    - LetterProgress
    - ReviewSchedule
    - WorldProgress
    - Inventory
    - AppSettings
  - 完了条件：
    - anyを使用しない
    - IDはstringで統一
    - 保存する日時はISO 8601文字列で統一
    - 型を機能別ファイルへ分割
    - barrel exportを用意
  - 依存Issue：Issue 005

- [x] Issue 022：IndexedDB初期化
  - 目的：
    端末内データベースを作成する
  - 完了条件：
    - DB名：moji-bouken-db
    - 初期バージョン：1
    - DB名とバージョンを定数化
    - 必要なobject storeを作成
    - 初期化エラーを適切に通知
    - UIコンポーネントへDB処理を直接記述しない
  - 依存Issue：Issue 021

- [x] Issue 023：Playerストア
  - 目的：
    プレイヤーデータの作成・取得・更新を実装する
  - 完了条件：
    - 初期プレイヤー作成
    - IDによる取得
    - 部分更新
    - updatedAt更新
    - 存在しない場合の処理
  - 依存Issue：Issue 022

- [x] Issue 024：LearningLogストア
  - 目的：
    ミッションの回答履歴を保存する
  - 保存項目：
    - id
    - playerId
    - missionId
    - targetLetter
    - correct
    - responseTimeMs
    - answeredAt
  - 完了条件：
    - ログ追加
    - プレイヤー別取得
    - 文字別取得
    - 日付範囲による取得
  - 依存Issue：Issue 022

- [x] Issue 025：LetterProgressストア
  - 目的：
    文字ごとの習熟状況を保存する
  - 保存項目：
    - playerId
    - letterId
    - attempts
    - correctCount
    - incorrectCount
    - accuracy
    - averageResponseTimeMs
    - lastResponseTimeMs
    - consecutiveCorrect
    - weakFlag
    - masteredFlag
    - lastAnsweredAt
  - 完了条件：
    - 保存
    - 取得
    - 更新
    - 苦手文字一覧取得
    - 習得済み文字一覧取得
  - 依存Issue：Issue 022

- [x] Issue 026：ReviewScheduleストア
  - 目的：
    翌日・3日後・7日後の復習予定を保存する
  - 保存項目：
    - id
    - playerId
    - letterId
    - reviewStage
    - scheduledDate
    - completed
    - completedAt
  - 完了条件：
    - 予定追加
    - 日付以前の未完了予定取得
    - 完了更新
    - 同一段階の重複予定を作成しない
  - 依存Issue：Issue 022

- [x] Issue 027：WorldProgressストア
  - 目的：
    エリアの解放・復興状況を保存する
  - 保存項目：
    - playerId
    - areaId
    - unlocked
    - recoveryStage
    - unlockedEvents
    - updatedAt
  - 完了条件：
    - 保存
    - 取得
    - 復興段階更新
    - イベント解放
  - 依存Issue：Issue 022

- [x] Issue 028：Inventoryストア
  - 目的：
    所持金・アイテム・装備・仲間を保存する
  - 保存項目：
    - playerId
    - gold
    - items
    - equipment
    - companions
    - updatedAt
  - 完了条件：
    - 保存
    - 取得
    - 所持金増減
    - アイテム追加
    - 装備更新
    - 仲間追加
    - マイナスの所持金を許可しない
  - 依存Issue：Issue 022

- [x] Issue 029：初回起動データ作成
  - 目的：
    初回起動時に必要なデータを自動作成する
  - 初期値：
    Player
    - id：default-player
    - name：ぼうけんしゃ
    - level：1
    - experience：0
    - gold：0

    WorldProgress
    - areaId：starting-village
    - unlocked：true
    - recoveryStage：0
    - unlockedEvents：空配列

    Inventory
    - playerId：default-player
    - gold：0
    - items：空配列
    - equipment：空配列
    - companions：空配列

    AppSettings
    - bgmEnabled：true
    - soundEffectsEnabled：true
    - reducedMotion：false
    - parentPinConfigured：false

  - 完了条件：
    - 初回起動時に自動作成
    - 複数回実行しても重複しない
    - 既存データを上書きしない
  - 依存Issue：Issue 023、027、028

- [x] Issue 030：DBバージョン管理・移行基盤
  - 目的：
    将来のデータ構造変更に対応する
  - 完了条件：
    - DBバージョンを定数管理
    - upgrade処理をmigrationsへ分離
    - バージョンごとのmigration追加方法を明文化
    - 既存データを削除しない
    - migrationのテストを追加
  - 依存Issue：Issue 022
