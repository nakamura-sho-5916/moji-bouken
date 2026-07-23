import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const windowsCommandShell = process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe';
const requiredFiles = [
  'AGENTS.md',
  'ISSUES.md',
  'README.md',
  'CHANGELOG.md',
  'docs/FINAL_ACCEPTANCE_TEST.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/SECURITY_AUDIT.md',
  'docs/AUDIO_GUIDE.md',
  'docs/AUDIO_ACCEPTANCE_CHECKLIST.md',
  'dist/manifest.webmanifest',
  'dist/sw.js',
];

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runNpm(args) {
  if (process.platform !== 'win32') {
    return run(npmCommand, args);
  }

  return run(windowsCommandShell, [
    '/d',
    '/s',
    '/c',
    `${npmCommand} ${args.join(' ')}`,
  ]);
}

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `Missing required release file: ${file}`);
}

const packageJson = readJson('package.json');
assert(
  packageJson.version === '0.6.2',
  `Expected package version 0.6.2, got ${packageJson.version}`,
);

const manifest = readJson('dist/manifest.webmanifest');
assert(manifest.display === 'standalone', 'PWA manifest display must be standalone');
assert(manifest.start_url === '/', 'PWA manifest start_url must be /');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'PWA icons missing');

const routeSource = readFileSync(join(root, 'src/routes/AppRouter.tsx'), 'utf8');
assert(
  routeSource.includes('import.meta.env.DEV'),
  'Debug routes must be gated by import.meta.env.DEV',
);
assert(routeSource.includes('/debug/release'), 'Debug release route missing');

const finalAcceptance = readFileSync(
  join(root, 'docs/FINAL_ACCEPTANCE_TEST.md'),
  'utf8',
);
assert(
  finalAcceptance.includes('Blocker: 0') &&
    finalAcceptance.includes('Critical: 0') &&
    finalAcceptance.includes('v1.0.0 Candidate: Yes'),
  'Final acceptance document must record Blocker/Critical 0 and v1 candidate status',
);

const audit = JSON.parse(runNpm(['audit', '--json']));
assert(
  audit.metadata.vulnerabilities.total === 0,
  `npm audit has ${audit.metadata.vulnerabilities.total} vulnerabilities`,
);

runNpm(['ls']);

console.log('release check passed');
