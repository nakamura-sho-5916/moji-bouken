# Changelog

## v0.6.1

- Audited dependency security and resolved the transitive `fast-uri` high severity advisory without `--force`.
- Kept the dependency tree valid after the lockfile update and documented remaining dependency update policy.
- Split the audio context and `useAudio` hook out of `AudioProvider.tsx` to remove the Fast Refresh warning.
- Re-ran audio and main gameplay regression checks for the public build.

## v0.6.0

- Replaced placeholder Web Audio tones with original procedural production BGM and SFX.
- Added nine BGM cues covering title, home, world, mission, battle, boss, result, world recovery, and victory fanfare.
- Added expanded SFX patches for battle, rewards, drops, shop, companion, area unlock, EXP, Gold, and boss appearance cues.
- Added BGM ducking for level up, victory, world recovery, companion joins, and rare reward moments.
- Expanded `/debug/audio` with AudioContext state, current BGM, BPM, current step, node count, SFX/BGM triggers, and ducking checks.
- Added audio validation tests for registries, BPM ranges, loop flags, duplicate BGM prevention, ducking, and node release.

## v0.5.0

- 敵を50体へ拡張し、各エリアに9体の通常敵と1体のボスを配置
- 敵ごとの経験値、Gold、ドロップテーブル、レアリティ、ボスセリフを追加
- 仲間スキル、ショップ販売品、図鑑完成率、ワールド復興表示、Lv1〜20向けバランスを拡張

## v0.4.0

- CSS AnimationとSVG主体の本番ゲーム演出を追加
- 正解・不正解、敵被弾、敵撃破、レベルアップ、宝箱、仲間、世界復興、ショップ購入、レア獲得の視覚フィードバックを強化
- reduced-motionとスマートフォン表示を前提に、軽量なtransform / opacity中心の演出へ統一

## v0.3.0

- Added original lightweight SVG game artwork for enemies, companions, area backgrounds, and items.
- Added a central asset registry, resolver, preloader, and reusable artwork components.
- Integrated production artwork into battle, world, companion, collection, equipment, shop, and result screens.
- Added development-only `/debug/assets` for asset audits and fallback checks.
- Added asset safety tests for registry metadata, file existence, SVG viewBox, script-free SVG, and size limits.

## v0.2.1

- Fixed dynamic mission sessions so letter candidates generate missions from the full learning content instead of falling back to the same small sample mission set.
- Added per-session and recent-history diversity guards for repeated targets, repeated answers, duplicate question signatures, and long runs of the same mission format.
- Raised early world recovery visibility so a few completed adventures show clearer area progress and unlock feedback.
- Added EXP, Gold, and next-level progress display to home and reward results.
- Added mission diversity diagnostics to `/debug/missions` for development-only audits.

## v0.2.0

- Added an accessible game audio system based on the Web Audio API.
- Added generated sound effects for UI, choices, correct answers, retry, battle, rewards, world recovery, companions, equipment, shop purchases, and area unlocks.
- Added route-based BGM switching with fade support and safe mobile unlock handling.
- Added child and parent audio settings for mute, BGM, sound effects, and volume.
- Added `/debug/audio` for development-only audio checks.
- Documented generated audio licensing and future audio asset requirements.

## v0.1.3

- Fixed a similar-letter mission target ID mismatch that could show a different target letter from the correct answer.
- Replaced the seeded shuffle random source so small consecutive seeds do not pin the correct answer to the same grid position.
- Stopped using a fixed production mission seed when starting missions from the UI.
- Added final MissionViewModel assertions for answer existence, duplicate choices, label/value consistency, and target/correct mismatches.
- Strengthened E2E and stress coverage for visible correct choices and correct option position distribution.

## v0.1.2

- Audited every mission format for answerability.
- Fixed word-completion view models so the blank is reconstructed from the target word.
- Fixed word-ordering missions to use tappable character cards with back/reset controls.
- Added mission content stress tests covering 1000 deterministic seeds.
- Added release validation for four-choice invariants, text-search targets, and boss-mixed fallback behavior.
