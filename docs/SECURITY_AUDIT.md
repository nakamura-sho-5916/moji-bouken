# Security Audit

## Follow-up Audit Date

2026-07-26

## Follow-up Environment

- OS: Windows
- Node.js: v24.16.0
- npm: 11.13.0
- Branch: main
- App version: 0.6.2

## Follow-up Findings

`npm audit` detected high severity advisories after the dependency ecosystem
changed:

- `brace-expansion` through build/tooling paths, including PWA/Workbox tooling.
- `react-router` through the direct `react-router-dom` app dependency.

The `react-router` advisory was for React Router RSC/Action/Server Action
behavior. Mojibouken is a static client-side PWA and does not use React Router
RSC, server actions, SSR, or user-controlled redirects. The practical runtime
attack path was not present, but the direct dependency kept `npm audit` red.

## Follow-up Remediation

- Removed `react-router-dom`.
- Added `src/router.tsx`, a minimal internal SPA router covering the existing
  BrowserRouter, MemoryRouter, Link, NavLink, navigate, location, and search
  parameter usage.
- Added an `overrides` entry for `brace-expansion@5.0.8`, the patched version
  available in the current npm registry.
- Preserved the existing public route URLs and production debug-route gating.
- Re-ran dependency, unit, content, asset, audio, build, and E2E validation.

## Follow-up Result

`npm audit` reports `found 0 vulnerabilities`.

## Follow-up Residual Risk

The internal router intentionally supports only the route features this app
uses. Future route features should be added deliberately with tests rather than
reintroducing a broad routing dependency. The `brace-expansion` override should
be reviewed once upstream Workbox/PWA tooling adopts a patched dependency range.

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
