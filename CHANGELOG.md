# Changelog

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
