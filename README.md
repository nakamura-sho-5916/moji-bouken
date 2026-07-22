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
- Issue 021〜030：データ保存基盤 完了
- Issue 031〜040：教材データ基盤 完了
- Issue 041〜050：学習エンジン 完了
- Issue 051〜060：ミッションエンジン 完了
- Issue 061〜070：バトル・成長・報酬システム 完了
- Issue 071〜080：世界マップ・復興演出 実装済み
- Issue 081〜090：仲間・装備・ショップ・図鑑 実装済み

## 現在実装済みの画面

- タイトル: `/`
- ホーム: `/home`
- ぼうけん: `/world` 世界マップ、ロック中エリア、復興段階、NPC、エリア別敵選択
- ミッション: `/mission` 10問セッション
- バトル: `/battle` 通常敵・ボス・コンボ・必殺技
- けっか: `/result` 報酬表示、レベルアップ、復興イベント表示
- ずかん: `/collection`
- 保護者: `/parent`
- せってい: `/settings`
- 404: 存在しないURL
- 開発確認: `/debug/data`, `/debug/content`, `/debug/learning`, `/debug/missions`, `/debug/battle`, `/debug/world`
- 仲間: `/companions`
- 装備: `/equipment`
- ショップ: `/shop`
- 開発確認: `/debug/collection`

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

## バトル・成長・報酬

`src/features/battle` に、ミッション結果を戦闘表現へ変換するBattleEngineを配置しています。BattleEngineは敵HP、コンボ、必殺技ゲージ、与ダメージ、勝利状態を管理します。誤答時は敵HPを減らさず、子どもを責める演出やゲームオーバーは実装していません。

### 敵データ

敵データは `src/features/battle/enemies.ts` のTypeScript定数で管理しています。主な項目は `id`、`name`、`type`、`maxHp`、`defense`、`rewardExperience`、`rewardGold`、`imageId`、`areaId`、`active` です。初期版では通常敵とボスを用意し、画像は外部取得せず単純な記号表現を使います。

### ダメージ・コンボ・必殺技

通常攻撃は `baseDamage * comboMultiplier - enemyDefense` をもとに計算し、最小ダメージは1です。初期定数は `BASE_ATTACK_DAMAGE = 10`、`COMBO_BONUS_PER_STEP = 0.05`、`MAX_COMBO_DAMAGE_BONUS = 0.50`、`SPECIAL_ATTACK_MULTIPLIER = 3` です。コンボは連続正解で増え、誤答で終了します。必殺技ゲージは正解で増え、満タン時だけ任意で使えます。誤答ではゲージを減らしません。

`boss-mixed` はボス戦として正式に扱います。通常敵より高いHPを持ち、複数形式の問題と組み合わせて使える前提です。ただしゲームオーバーは実装せず、最後まで続ければ勝利できる方針です。

### RewardEngine

`src/features/rewards` にRewardEngineを配置しています。報酬理由から経験値とゴールドを計算し、PlayerとInventoryへ保存します。同じ `battleId` への報酬はlocalStorageの `rewardedBattleIds` で二重付与を防止します。

経験値は通常正解、セッション完了、回答時間改善、苦手文字進歩、苦手克服、最終復習完了、ボス撃破を反映します。同じbonusReasonは重複計上しません。レベルは累積経験値から計算し、最大レベルは100です。レベルアップ時はResultPageで控えめな演出を表示します。

ゴールドの正本は `Inventory.gold` です。互換性のため現時点では `Player.gold` も同期更新しますが、今後の整理ではInventoryを優先します。マイナス値は許可しません。

### ResultPage統合

ResultPageでは、戦闘後の経験値、ゴールド、レベルアップ、世界復興の予告を表示します。子ども画面では数字だけを中心にせず、宝箱、光、世界の変化といった視覚要素で成長を伝える方針です。詳細な数値分析は将来の保護者画面へ分離します。

### 開発用バトル確認画面

開発環境では `/debug/battle` を利用できます。敵選択、正解攻撃、誤答、コンボ、必殺技、敵HP、報酬計算、二重付与防止を確認できます。本番ビルドでは利用できません。

### chunk size warning

WorldPage、Collection、Shop、Equipment、Companions、開発用debug画面はReact.lazyでルート単位に分割しています。Issue 081〜090完了時点の `npm run build` ではchunk size warningは出ていません。今後さらに機能が増えてchunk size warningが再発する場合は、ミッション・バトル・保護者画面も同じ方針で分割します。

## 世界マップ・復興演出

`/world` では、5つのエリアを縦画面向けのマップとして表示します。最初は「はじまりの まち」だけが解放され、復興段階に応じて草木、ショップ、橋、NPCが表示されます。未解放エリアはロック表示になり、タップしてもバトルへ進みません。

復興処理は `src/features/world` に分離しています。戦闘報酬から復興ポイントを計算し、段階0〜4へ変換します。復興段階、解放イベント、エリア解放状態はIndexedDBの `worldProgress` へ保存し、復興ポイントは単一端末利用の補助データとしてlocalStorageへ保存します。同じ戦闘IDは二重反映しません。

### 復興イベント

- 段階1: 草木・自然が戻る
- 段階2: ショップが開く
- 段階3: 橋が修復され、次のエリアへ進める
- 段階4: NPCや仲間の表示が増える

### エリアと敵

- はじまりの まち: もじスライム、まよいキノコ
- ことばの もり: かくれモジ、ぐるぐるバット
- えあわせの おか: もやもやゴースト、かくれモジ
- ならべの どうくつ: まよいキノコ、ぐるぐるバット
- もじの おしろ: 通常敵候補とボス「モジナクス」

### 開発用世界確認画面

開発環境では `/debug/world` を利用できます。通常勝利または大きな復興を擬似的に反映し、復興段階、ロック解除、橋・自然・ショップ・NPC表示、再読み込み後の永続化を確認できます。本番ビルドでは子ども向けナビゲーションには表示しません。

## 仲間・装備・ショップ・図鑑

仲間データは `src/features/collection/companionData.ts` に集約しています。各仲間は `id`、`name`、`species`、`description`、`skillId`、`skillName`、`skillDescription`、`preferredMissionTypes`、`unlockCondition`、`imageId`、`active` を持ちます。初期版では、うさぎ、きつね、くま、ふくろう、りすの5体を登録しています。

仲間加入条件は、はじまりのまちstage 1、word-forest解放、picture-hill解放、苦手文字克服、通常戦勝利数を利用します。加入済み仲間は `Inventory.companions` へ保存し、初加入は `collectionProgress` に記録して二重表示を防ぎます。同行仲間は `collectionProgress` の `selected-companion` として1体だけ保存します。

仲間スキルは学習結果を不正に変えません。誤答を正解扱いにしたり、正答率や苦手判定を書き換えたり、自動で正解を選んだりしません。初期スキルは、選択肢を1つ減らす、イラストヒント、候補整理、やさしい復習、追加ゴールドの5種類です。スキルは1セッションあたりの発動回数上限を持てる純粋関数として `applyCompanionSkill` で判定します。

装備データは `src/features/collection/equipmentData.ts` に集約しています。武器、防具、アクセサリーを各3種類登録し、各装備は価格、解放条件、見た目用 `imageId`、`cosmeticStyle`、`attackBonus`、`rewardBonus` を持ちます。能力差を大きくしすぎないため、`attackBonus` は最大5、`rewardBonus` は最大3に制限します。

ショップは、はじまりのまちstage 3以上で開店します。未開店時は「おみせは まだ じゅんびちゅうだよ」と表示します。購入時は確認を挟み、所持金が十分なら `Inventory.equipment` へ保存し、購入済みは再購入できません。所持金不足時は「もうすこし ぼうけんすると てにいれられるよ」と案内し、所持金がマイナスにならないようにします。

ことば図鑑は、ミッションで出題されたひらがな・カタカナ、完了した単語ミッションの単語を `collectionProgress` に記録して発見済みにします。未発見項目は `？` と鍵表示で示し、正答率や回数を中心にしません。

仲間・敵図鑑は、仲間加入時と敵遭遇・撃破時に `collectionProgress` へ記録します。未発見項目はシルエット表示、発見済みは名前、見た目、短い説明を表示します。敵説明は怖すぎない表現にします。

復興アルバムは `albumEntries` に保存します。橋修復、花・木の復活、店舗開店、NPC追加、エリア復興などを `eventId` で重複防止し、before/afterを絵文字や短い場面で表示します。

### IndexedDB migration

DBバージョンは `2` です。v2 migrationで `collectionProgress` と `albumEntries` を追加しました。既存のPlayer、学習、世界、Inventoryデータは削除しません。装備所持・装備中・仲間加入は既存Inventoryを使い、図鑑とアルバムだけ新ストアへ分離します。

### 開発用コレクション確認画面

開発環境では `/debug/collection` を利用できます。仲間一覧確認、強制加入、同行仲間変更、スキル模擬、装備確認、ゴールド追加、ショップ購入、装備変更、文字・単語発見、敵遭遇記録、アルバム追加、重複確認、テストデータリセットを確認できます。リセットには確認ダイアログを表示します。本番ビルドでは有効化しません。

### 課金・広告・ガチャ方針

課金、広告、ガチャは実装しません。ランダム報酬を使う場合も、すべて無料で取得可能な範囲に限定します。

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

## MVP 0.1.0 リリース情報

### 1. もじぼうけん！とは

もじぼうけん！は、ひらがな・カタカナを冒険、バトル、復興、仲間、装備、図鑑と結び付けて学ぶ、単一端末向けPWAです。MVP 0.1.0では、初回起動から学習、保存、保護者確認、バックアップまで一通り利用できます。

### 2. 教育目的

文字の形を知り、探し、意味と結び付け、言葉として組み合わせ、生活や文章で使う力につなげます。制限時間や競争ではなく、安心して繰り返せる学習を重視します。

### 3. 対象

主対象は小学2年生です。スマートフォン縦画面で、子どもが一人でも基本操作できる大きなボタンと短い表示を優先しています。

### 4. 現在実装済みの機能

タイトル、ホーム、世界マップ、ミッション、バトル、結果、復興、仲間、装備、ショップ、ことば図鑑、保護者画面、子ども向け設定、PWA、オフライン基本動作、IndexedDB保存、JSONバックアップ、JSON復元を実装済みです。

MVP後の修正として、本番のBattlePageから手動デバッグ用の「せいかい」「ちがう」ボタンを削除しました。現在はMissionRunnerの問題カードで子どもが回答した時だけ、学習記録とBattleEngineの攻撃判定が進みます。デバッグ用の手動操作は開発環境限定のDebugBattlePageに残しています。

### 5. 未実装・将来予定

音声問題、クラウド同期、アカウント登録、サーバー連携、他教科、漢字、算数、英語、ランキング、課金、広告、SNSはMVPでは実装しません。

### 6. 技術構成

React、TypeScript、Vite、Tailwind CSS、Framer Motion、PWA、IndexedDB、localStorage、Vitest、React Testing Library、Playwrightを使用します。

### 7. 開発環境

Windows、Windows PowerShell 5.1、Node.js v24.16.0、npm 11.13.0、Git 2.55.0.windows.3、mainブランチで確認しています。GitがPATHにない場合は `C:\Program Files\Git\cmd\git.exe` を使います。

### 8. インストール

```powershell
npm install
```

### 9. 開発サーバー起動

```powershell
npm run dev
```

表示されたローカルURLをブラウザで開きます。

### 10. production build

```powershell
npm run build
```

ビルド結果は `dist/` に生成されます。

### 11. テスト

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

### 12. スマートフォンでの確認

同じネットワーク内で開発サーバーまたはプレビューサーバーを起動し、スマートフォンのChromeでURLを開きます。公開URLは未作成のため、公開後は `docs/INSTALL_ANDROID.md` のURL欄を差し替えます。

### 13. PWAインストール

Android Chromeで公開URLを開き、メニューから「ホーム画面に追加」または「アプリをインストール」を選びます。詳しい手順は `docs/INSTALL_ANDROID.md` にあります。

### 14. オフライン利用

一度オンラインで開くと、基本画面とアプリ資産はService Workerで保持されます。学習データは端末内のIndexedDBに保存されます。ブラウザデータを削除すると消える可能性があるため、定期バックアップを推奨します。

### 15. 保護者PIN

保護者画面では4桁PINを設定できます。PINは子どもの誤操作を防ぐための簡易機能であり、強固な認証基盤ではありません。PIN本体は保存せず、Web Crypto APIで作成したsaltとhashのみ保存します。

### 16. バックアップ

保護者画面の「バックアップ」からJSONファイルを出力できます。Player、学習ログ、文字進捗、復習予定、世界進捗、もちもの、設定、図鑑、アルバムを含みます。PIN本体や一時セッション、Service Workerキャッシュは含めません。

### 17. 復元

保護者画面でJSONファイルを選択し、形式、バージョン、必須データ、ファイルサイズを確認してから復元します。復元前の現在データは自動バックアップとして出力されます。

### 18. IndexedDB

DB名は `moji-bouken-db`、現在のDBバージョンは `2` です。既存データを消さないmigration方針を採用しています。

### 19. Debugページ

開発環境では `/debug/release` で最終確認を実行できます。production buildではDebugルートは無効です。

### 20. Git

mainブランチを使用します。ユーザーの明示指示がない限りcommitしません。`reset --hard`、`clean -fd`、`.git` の削除・移動は禁止です。

### 21. 既知の問題

公開URLはまだありません。PWAインストール確認は公開後に実端末で最終確認します。音量設定は保存済みですが、MVP時点では実音源が限られます。

### 22. 安全上・教育上の方針

子ども向け画面では、責める表現、制限時間、カウントダウン、数値達成率中心の表示を避けます。正解・再挑戦は色だけでなく文字や形でも伝えます。

### 23. ライセンス

現時点では未設定です。公開前にライセンス方針を決めてください。

### 24. バージョン

MVPバージョンは `0.3.0` です。

### 25. 公開URL

本番URL：

https://moji-bouken.vercel.app

mainブランチへのpush後、Vercelで自動デプロイされます。

### 26. ミッション品質監査

v0.1.2では、全ミッション形式の回答可能性を監査しました。

- letter-introduction
- letter-search
- similar-letter-choice
- illustration-letter-choice
- illustration-word-choice
- word-completion
- word-ordering
- vertical-reading
- horizontal-reading
- text-search
- boss-mixed

4択形式では、正解1件、重複しない誤答3件、合計4件であることを検証しています。word-completionは対象単語から空欄を再構成し、word-orderingは文字カードを並べて回答します。

追加の監査コマンド：

```powershell
npm run test:content:stress
```

v0.1.3では、選択式ミッションの最終ViewModelで以下を保証しています。

- 4択形式では、正解1件と重複しない誤答3件だけを表示する
- 表示文字列と判定値が一致する
- targetIdsで解決した表示対象とcorrectAnswerの不一致を検出する
- 小さい連番seedでも正解位置が固定されないshuffleを使う
- 本番UIからミッションを開始する場合は固定seedを使わない
- 新しいbuildでService Workerのprecache対象が更新され、既存の更新通知で新しいアセットへ切り替えられる

### 27. 音響システム

v0.2.0では、Web Audio APIによる音響基盤を追加しました。外部音源ファイルは同梱せず、短い効果音と仮BGMをアプリ内で生成します。音が再生できない環境でも、ゲームは無音で継続します。

効果音ID：

- `ui-tap`
- `choice-select`
- `correct`
- `retry`
- `attack`
- `special-attack`
- `enemy-defeated`
- `reward`
- `level-up`
- `world-recovery`
- `companion-joined`
- `equipment-acquired`
- `shop-purchase`
- `area-unlocked`

BGM ID：

- `title`
- `home`
- `world`
- `mission`
- `battle`
- `boss`
- `result`

スマートフォンでは、最初のユーザー操作後に音声を有効化します。子ども向け設定では音のオン/オフ、BGM、効果音、音量を変更できます。保護者設定ではマスター音量、BGM音量、効果音音量を個別に調整できます。

音源管理：

- 現在の音源は `generated-web-audio` として実行時生成します
- 外部音源は自動ダウンロードしません
- 将来ファイルを追加する場合は `public/assets/audio/LICENSES.md` へライセンスを記録します
- 詳細は `docs/AUDIO_GUIDE.md` を参照してください

開発時は `/debug/audio` でAudioContext、unlock、SFX、BGM、設定反映を確認できます。本番buildではdebugルートへ到達できません。

### 28. ミッション多様性と進捗表示

v0.2.1では、ミッション開始時に教材データ全体から動的ミッションを生成し、固定サンプルミッションだけが繰り返されないようにしました。同一セッション内では、同じ問題署名、同じ対象、同じ正解、同じ形式の連続が偏りすぎないように制御します。seedを指定したテストでは再現性を保ち、通常プレイでは直近の出題履歴をlocalStorageに保持して、前回と同じ問題が続きにくいようにします。

報酬と進捗は、結果画面とホーム画面でEXP、Gold、次のレベルまでの目安を表示します。世界マップでは復興段階と次の変化までの進み具合を確認できます。開発時は `/debug/missions` で生成セッションの形式、対象、正解、重複数を確認できます。本番buildではdebugルートへ到達できません。

### 29. 本番ビジュアル素材

v0.3.0では、敵10点、仲間5点、背景6点、アイテム30点のオリジナルSVG素材を `public/assets/game` に追加しました。外部画像、外部URL、script、foreignObjectは使用していません。素材は `src/features/assets/assetRegistry.ts` に集約し、画面から直接パスを参照しない方針です。

画面表示には `GameAssetImage`、`EnemyArtwork`、`CompanionArtwork`、`ItemArtwork`、`AreaBackground` を使います。読み込み失敗時や未登録IDではfallback表示に切り替わるため、画像だけで画面が操作不能になることはありません。素材追加手順と安全方針は `docs/ASSET_GUIDE.md` を参照してください。

開発環境では `/debug/assets` で全素材、種類別フィルタ、fallback、320px幅での表示を確認できます。本番buildではdebugルートへ到達できません。素材変更後は `npm run build` により `sw.js` のprecache対象が更新され、IndexedDB学習データは削除されません。
