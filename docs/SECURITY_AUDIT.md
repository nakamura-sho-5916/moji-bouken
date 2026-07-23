# Security Audit

## Audit Date

2026-07-23

## Environment

- OS: Windows
- Node.js: v24.16.0
- npm: 11.13.0
- Branch: main
- App version: 0.6.1

## Audit Scope

- `npm audit`
- `npm audit --json`
- `npm ls`
- `npm outdated`
- Production build impact review
- AudioProvider Fast Refresh warning review

## Finding

`npm audit` detected one high severity advisory before the v0.6.1 fix:

- Package: `fast-uri`
- Version before fix: `3.1.3`
- Dependency type: transitive
- Parent path: `ajv -> fast-uri`
- Also present through: `vite-plugin-pwa -> workbox-build -> ajv -> fast-uri`
- Advisory: host confusion via literal backslash authority delimiter
- Severity: high
- CWE: CWE-436

## Production Impact

The vulnerable package is not imported directly by the app runtime code. It is
used through validation/build tooling dependencies. Because `ajv` is listed as a
production dependency and `vite-plugin-pwa` participates in build/PWA generation,
the advisory is treated as release-blocking until resolved.

## Remediation

Ran `npm audit fix` without `--force`. This changed one transitive package in
the lockfile and resulted in `found 0 vulnerabilities`.

No major package upgrade was required. No framework-wide upgrades were made.

## Residual Risk

`npm outdated` still reports newer patch/minor versions for some packages and
major versions for `@testing-library/jest-dom` and `typescript`. These were not
updated in v0.6.1 because they are not required to resolve the advisory and may
increase regression risk before the next formal compatibility pass.

## Future Policy

- Prefer `npm audit fix` without `--force`.
- Avoid broad dependency updates in stabilization releases.
- Review major updates only in a dedicated compatibility release.
- Keep `npm ls`, build, unit tests, content stress tests, asset tests, audio
  tests, and E2E green before release.
