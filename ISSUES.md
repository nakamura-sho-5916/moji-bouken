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

## Phase 3：教材データ基盤

- [x] Issue 031：ひらがなマスターデータ
  - 目的：
    初期学習で使用するひらがなデータをJSONで管理する
  - 完了条件：
    - 基本46文字を収録
    - 文字IDを一意にする
    - あ行〜わ行・んのグループ情報を持つ
    - 表示順を持つ
    - 将来、濁音・半濁音・拗音を追加できる構造
  - 依存Issue：Issue 021

- [x] Issue 032：カタカナマスターデータ
  - 目的：
    初期学習で使用するカタカナデータをJSONで管理する
  - 完了条件：
    - 基本46文字を収録
    - 対応するひらがなIDを持つ
    - 表示順を持つ
    - 将来、濁音・半濁音・拗音を追加できる構造
  - 依存Issue：Issue 021

- [x] Issue 033：単語マスターデータ
  - 目的：
    小学2年生が理解しやすい身近な単語をJSONで管理する
  - 完了条件：
    - 初期版として最低80語
    - 2〜5文字程度を中心にする
    - 名詞を中心にする
    - 動物、食べ物、学校、生活、自然などのカテゴリを持つ
    - 対応文字IDを持つ
    - イラスト参照IDを持てる
    - 不適切・難解・曖昧な単語を避ける
  - 依存Issue：Issue 031、032

- [x] Issue 034：イラスト参照データ
  - 目的：
    単語とイラスト資産を分離して関連付ける
  - 完了条件：
    - illustrationId
    - assetPath
    - altText
    - category
    - fallbackText
      を定義する
    - 外部URLへ依存しない
    - 初期版では自作SVGまたはプレースホルダーを使用可能
  - 依存Issue：Issue 033

- [x] Issue 035：似た文字グループ
  - 目的：
    視覚的に混同しやすい文字を学習に利用する
  - 完了条件：
    - ひらがな・カタカナの類似文字グループをJSON化
    - グループIDを一意にする
    - 対象文字IDを持つ
    - 誤答候補生成に利用できる
    - 根拠が弱い組み合わせを増やしすぎない
  - 依存Issue：Issue 031、032

- [x] Issue 036：ミッションJSON Schema
  - 目的：
    ミッションデータの形式を検証できるようにする
  - 完了条件：
    - Mission型と整合するJSON Schemaを作成
    - missionId
    - missionType
    - targetIds
    - prompt
    - choices
    - correctAnswer
    - difficulty
    - orientation
    - reward
    - unlockCondition
      を検証できる
  - 依存Issue：Issue 021

- [x] Issue 037：教材データローダー
  - 目的：
    JSON教材を読み込み、型安全に利用できるようにする
  - 完了条件：
    - ひらがな
    - カタカナ
    - 単語
    - イラスト
    - 似た文字
    - ミッション
      を読み込める
    - 起動時に検証する
    - UIから直接JSONを参照しない
  - 依存Issue：Issue 031〜036

- [x] Issue 038：教材データエラー処理
  - 目的：
    一部の教材データが不正でもアプリ全体を停止させない
  - 完了条件：
    - 不正データを除外
    - 開発環境では詳細を記録
    - 本番では安全な代替表示
    - 有効データだけで継続動作
  - 依存Issue：Issue 037

- [x] Issue 039：サンプルミッション作成
  - 目的：
    各学習形式の実装に使えるサンプルデータを作る
  - 対象：
    - 文字を見る
    - 文字を探す
    - 似た文字を見分ける
    - イラストから文字を選ぶ
    - 単語穴埋め
    - 文字並べ替え
    - 縦書き
    - 横書き
    - 文章から探す
    - ボスミッション
  - 完了条件：
    - 各形式最低2件
    - 合計20件以上
    - Schema検証に成功
  - 依存Issue：Issue 036、037

- [x] Issue 040：教材データ品質テスト
  - 目的：
    教材データの誤りを自動検出する
  - 完了条件：
    - 重複ID検出
    - 空文字検出
    - 存在しない文字ID参照検出
    - 存在しないイラストID参照検出
    - 正解不在検出
    - choices内の重複検出
    - correctAnswerがchoices内にない問題を検出
    - 全JSONが型・Schemaに適合
  - 依存Issue：Issue 031〜039

## Phase 4：学習エンジン

- [x] Issue 041：回答記録処理
  - 目的：
    ミッションの回答結果を学習ログと文字別進捗へ反映する
  - 完了条件：
    - 正誤を記録できる
    - 回答時間を記録できる
    - 対象文字を記録できる
    - LearningLogを保存できる
    - LetterProgressを更新できる
    - 1回答を二重保存しない
  - 依存Issue：Issue 024、025、037

- [x] Issue 042：文字別正答率計算
  - 目的：
    文字ごとの理解度を算出する
  - 完了条件：
    - attempts
    - correctCount
    - incorrectCount
    - accuracy
      を正しく更新する
    - 0除算を防ぐ
    - 正答率は0〜1のnumberで保持する
  - 依存Issue：Issue 041

- [x] Issue 043：平均回答時間計算
  - 目的：
    文字ごとの回答速度の変化を記録する
  - 完了条件：
    - averageResponseTimeMsを更新する
    - lastResponseTimeMsを更新する
    - 異常値を除外または補正する
    - 0ms以下の値を許可しない
  - 依存Issue：Issue 041

- [x] Issue 044：苦手文字判定
  - 目的：
    復習を優先すべき文字を自動判定する
  - 判定基準：
    - attemptsが3回以上
    - accuracyが0.70以下
  - 完了条件：
    - weakFlagを自動更新する
    - attemptsが3回未満では苦手判定しない
    - 判定基準を定数化する
  - 依存Issue：Issue 042

- [x] Issue 045：苦手解除・習得判定
  - 目的：
    苦手文字の克服と習得状態を判定する
  - 初期判定基準：
    - 直近5回中4回以上正解
    - 現在のaccuracyが0.80以上
    - 7日後復習を正解
  - 完了条件：
    - weakFlagを解除できる
    - masteredFlagを更新できる
    - 判定理由を結果として返せる
    - 判定基準を定数化する
  - 依存Issue：Issue 044、046

- [x] Issue 046：復習予定生成
  - 目的：
    苦手文字に翌日・3日後・7日後の復習予定を作る
  - 完了条件：
    - stage 1：翌日
    - stage 2：3日後
    - stage 3：7日後
    - 同じ文字・同じ段階の未完了予定を重複作成しない
    - 日付計算を純粋関数へ分離する
  - 依存Issue：Issue 044、026

- [x] Issue 047：復習対象抽出
  - 目的：
    当日実施すべき復習対象を取得する
  - 完了条件：
    - scheduledDateが当日以前
    - completed=false
    - 古い予定を優先
    - 同じ文字の重複を整理
    - 最大取得件数を指定できる
  - 依存Issue：Issue 046

- [x] Issue 048：出題優先度計算
  - 目的：
    新規・通常・苦手・復習対象を適切に混ぜる
  - 初期比率：
    - 復習対象：40%
    - 苦手文字：30%
    - 通常文字：20%
    - 新規文字：10%
  - 完了条件：
    - 対象不足時は他カテゴリへ再配分する
    - 同じ文字の連続出題を避ける
    - 同じミッション形式の連続を避ける
    - シード指定可能な乱数を利用できる
    - 結果がテスト可能である
  - 依存Issue：Issue 044、047、037

- [x] Issue 049：回答時間改善判定
  - 目的：
    前回より短時間で正解できた場合に改善を判定する
  - 完了条件：
    - 正解時のみ判定
    - 前回記録がある場合のみ判定
    - 5%以上短縮した場合を改善とする
    - 50ms未満の差は誤差として扱う
    - 子ども画面に制限時間を表示しない
  - 依存Issue：Issue 043

- [x] Issue 050：学習エンジン統合・テスト
  - 目的：
    回答記録から復習・出題選択までを一連で利用できるようにする
  - 完了条件：
    - LearningEngineの公開APIを定義
    - 回答記録
    - 苦手判定
    - 復習生成
    - 復習抽出
    - 出題候補作成
    - 改善ボーナス判定
      を呼び出せる
    - React UIから直接DB計算処理を行わない
    - 単体・統合テストを追加する
  - 依存Issue：Issue 041〜049

## Phase 5：ミッションエンジン

- [x] Issue 051：共通ミッション実行基盤
  - 目的：教材JSONからミッションを読み込み、画面表示、回答判定、回答時間計測、LearningEngineへの保存を行う共通基盤を作る
  - 完了条件：
    - MissionRunnerを実装する
    - missionTypeごとに表示コンポーネントを切り替える
    - 回答開始時刻と回答時間を扱う
    - 正誤判定を行う
    - LearningEngineへ回答結果を送信する
    - 同一回答を二重送信しない
  - 依存Issue：Issue 037、041、050

- [x] Issue 052：文字を見るミッション
  - 目的：新しい文字の形に慣れる導入ミッションを実装する
  - 完了条件：
    - 対象文字を大きく表示する
    - ひらがな・カタカナを区別する
    - 短い案内文を表示する
    - 「おぼえた」ボタンで完了できる
    - 正誤判定を伴わない導入ミッションとして記録する
  - 依存Issue：Issue 051

- [x] Issue 053：文字探索ミッション
  - 目的：複数文字の中から指定文字を探すミッションを実装する
  - 完了条件：
    - 4〜12個の選択肢を表示できる
    - 難易度に応じた選択肢数に対応できる
    - 選択肢位置をseed付きでシャッフルできる
    - 正しい文字をタップすると成功
    - 誤答時は責めずに再挑戦できる
    - 選択肢の重複を避ける
  - 依存Issue：Issue 051

- [x] Issue 054：類似文字判別ミッション
  - 目的：形の似た文字を見分けるミッションを実装する
  - 完了条件：
    - similarLetters.jsonを利用する
    - 2〜4個の選択肢を表示できる
    - 対象文字を明確に提示する
    - 正答後に対象文字を強調する
    - 同じ類似グループばかり連続させない
  - 依存Issue：Issue 051、035

- [x] Issue 055：イラスト選択ミッション
  - 目的：イラストと文字・単語を結び付けるミッションを実装する
  - 対象：
    - illustration-letter-choice
    - illustration-word-choice
  - 完了条件：
    - イラストまたはfallbackTextを表示する
    - 対応する文字・単語を選択できる
    - altTextを設定する
    - 画像読み込み失敗時にも継続できる
    - 正解時にイラストと単語を一緒に表示する
  - 依存Issue：Issue 051、034

- [x] Issue 056：単語穴埋めミッション
  - 目的：欠けた文字を選び、単語を完成させる
  - 完了条件：
    - 欠けた場所を視覚的に表示する
    - 選択肢から文字を選べる
    - 正解後に完成単語を表示できる
    - 縦書き・横書きへ拡張可能な構造にする
    - 複数の空欄へ将来拡張できる
  - 依存Issue：Issue 051、033

- [x] Issue 057：文字並べ替えミッション
  - 目的：文字を正しい順番に並べて単語を完成させる
  - 完了条件：
    - 初期版はタップ式並べ替えにする
    - 文字カードを順番に選択できる
    - 選択解除ができる構造を持つ
    - 「こたえる」ボタンで判定する
    - 「やりなおす」導線を持てる構造にする
    - 将来のドラッグ操作へ拡張できる
  - 依存Issue：Issue 051、033

- [x] Issue 058：縦書き・横書きミッション
  - 目的：同じ文字や単語を縦書き・横書きの両方で理解できるようにする
  - 対象：
    - vertical-reading
    - horizontal-reading
  - 完了条件：
    - CSS writing-modeを適切に使用する
    - 縦書き表示が崩れない
    - 横書き表示が崩れない
    - 読む方向を理解できる視覚的案内を行う
    - 文字を不自然に回転させない
  - 依存Issue：Issue 051

- [x] Issue 059：文章探索ミッション
  - 目的：短い文章から指定文字・単語を探す
  - 完了条件：
    - 小学2年生向けの短文を表示する
    - 文章内の文字または単語をタップできる
    - 指定対象を複数候補から探せる
    - 縦書き・横書きへ拡張可能
    - 初期版は探索中心で、読解問題にしない
  - 依存Issue：Issue 051、033

- [x] Issue 060：ミッションセッション統合
  - 目的：複数形式のミッションを10問の連続実行として扱う
  - 完了条件：
    - 標準10問のセッションを生成する
    - LearningEngineの出題候補を利用する
    - 1問ずつ表示する
    - 現在位置を視覚的に表示する
    - 回答後に次へ進む
    - セッション状態を管理する
    - 全問終了後にResultPageへ遷移する
    - ページ再読み込み時に安全に処理する
  - 依存Issue：Issue 051〜059、048、050
