# Final Acceptance Test

## A. Test Preparation

- Date: 2026-07-23
- Branch: main
- Public URL: https://moji-bouken.vercel.app
- App version under test: 0.6.2
- Previous release tag: v0.6.1
- v1.0.0 tag: not created in this phase

## B. Device, OS, And Browser Log

- Development OS: Windows
- Node.js: v24.16.0
- npm: 11.13.0
- Automated browser: Playwright Chromium
- Human device checks still required on Android/iOS smartphone browsers before creating v1.0.0.

## C. 30 Minute Play Test

Automated E2E covers the core journey from first launch through mission,
answers, battle, result, world, collection, parent tools, backup, assets, and
debug gating. A human 30 minute child/parent observation should still be run on
the public URL before the v1.0.0 tag.

## D. Learning Question Checks

- Initial launch can generate 10 questions.
- Every selectable mission keeps a visible correct answer.
- The displayed prompt and answer value are aligned.
- Wrong answers allow retry.
- First-attempt learning logs are persisted.
- Weak-letter and review logic are covered by unit tests.
- Standard question counts 5, 10, and 15 are reflected through settings tests.

Stress test coverage:

- Unanswerable questions: 0
- Missing correct answers: 0
- Duplicate completed sessions: 0
- Fixed first material in 10 sessions: 0
- Extreme same-letter or same-format bias: not detected by current stress tests

## E. Battle Checks

- Correct answers apply battle damage.
- Wrong answers do not attack.
- Enemy HP, combo, special gauge, defeated state, EXP, Gold, and rewards are
  covered by unit/E2E tests.
- Boss data exists for each area.

## F. World Progress Checks

- First visible recovery change target: 2 to 3 sessions.
- Next area unlock target: around 3 sessions.
- World progression, recovery events, and unlocks are covered by E2E and unit
  tests.

## G. Audio Checks

- First tap unlock behavior is covered.
- BGM and SFX registries are complete.
- Correct sound then attack sound sequence is covered.
- Retry sound does not attack.
- BGM ducking, cooldowns, mute settings, and setting persistence are covered.
- Manual listening checklist remains required on smartphone speakers.

## H. PWA And Offline Checks

- `dist/manifest.webmanifest` is generated.
- `dist/sw.js` is generated.
- SVG assets are included in precache output.
- Procedural BGM/SFX do not require network audio assets.
- IndexedDB is not deleted by PWA updates.
- Manual offline launch should be checked on the installed PWA.

## I. Save, Restore, And Backup Checks

- IndexedDB initializes required stores.
- Player, learning logs, letter progress, review schedules, world progress,
  inventory, settings, collection progress, and album entries are backed up.
- Backup JSON excludes localStorage sessions and plaintext PINs.
- Invalid JSON restore is rejected.
- Restore keeps existing data safe on failure.

## J. Child Response Observation

Human observation checklist:

- Can the child start without explanation?
- Where does the child hesitate?
- Are any buttons hard to press?
- Which effects feel enjoyable?
- Does repeated play feel varied enough?
- Is audio pleasant rather than tiring?
- Does the child continue voluntarily?
- How long do they continue?
- Do they ask to play again?
- Are fatigue or frustration signs visible?

## K. Parent Evaluation

Human parent checklist:

- Can parent mode be found?
- Is PIN setup understandable?
- Are weak letters and history useful?
- Is backup/restore understandable?
- Are data reset actions guarded enough?

## L. Defect Log

- Blocker: 0
- Critical: 0
- Major: 1
- Minor: 2

Major:

- Human smartphone acceptance has not yet been completed in this automated
  environment.

Minor:

- Some source text and legacy docs render as mojibake in terminal output because
  the project content was authored under mixed encoding display conditions.
- Illustration learning assets still use the existing `placeholders` directory
  name, although the SVG files are bundled locally and validated.

## M. v1.0.0 Decision

v1.0.0 Candidate: Yes

The codebase meets automated release gates: audit 0, format, lint, typecheck,
unit, stress, asset, audio, build, E2E, PWA generation, production debug gating,
and backup checks. Create v1.0.0 only after human smartphone and parent/child
acceptance on the public URL is complete.
