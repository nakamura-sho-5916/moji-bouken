# Release Checklist

## v0.6.1 Public Stabilization

- Confirm `git status` before edits.
- Confirm `npm audit` result.
- Confirm `npm audit --json` result.
- Confirm `npm outdated` result.
- Confirm `npm ls` has no invalid or extraneous dependencies.
- Resolve release-blocking vulnerabilities without `--force` when possible.
- Remove lint warnings without suppressing rules.
- Preserve existing IndexedDB data and migrations.
- Preserve existing game content, enemies, areas, items, and audio behavior.
- Run `npm install`.
- Run `npm audit`.
- Run `npm ls`.
- Run `npm run format`.
- Run `npm run format:check`.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run test:run`.
- Run `npm run test:content:stress`.
- Run `npm run test:assets`.
- Run `npm run test:audio`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Confirm production debug routes remain inaccessible in production behavior.
- Confirm app version is updated.
- Commit, tag, and push only after all checks pass.
