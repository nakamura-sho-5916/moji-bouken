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
