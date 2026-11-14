import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Package the output of `pnpm build`; do not compile anything here or in deploy.
const root = resolve(import.meta.dirname, '..');
const revision =
  process.env.GITHUB_SHA ??
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Expected a full Git commit SHA');
const staging = mkdtempSync(join(tmpdir(), 'leftover-package-'));
const backend = join(staging, 'backend');
const frontend = join(staging, 'frontend');

execFileSync(
  'pnpm',
  ['--filter', 'backend', 'deploy', '--prod', '--legacy', '--offline', backend],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
writeFileSync(join(backend, 'revision.txt'), `${revision}\n`);
writeFileSync(
  join(backend, 'start.mjs'),
  `import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
process.env.APP_REVISION = readFileSync(new URL('./revision.txt', import.meta.url), 'utf8').trim();
execFileSync(process.execPath, ['node_modules/typeorm/cli.js', 'migration:run', '-d', 'dist/libs/db/data-source.js'], { stdio: 'inherit' });
await import('./dist/src/main.js');
`,
);

mkdirSync(frontend);
cpSync(join(root, 'frontend/build'), join(frontend, 'build'), { recursive: true });
writeFileSync(join(frontend, 'package.json'), JSON.stringify({ private: true, type: 'module' }));

for (const [name, directory] of [
  ['backend', backend],
  ['frontend', frontend],
]) {
  const output = join(root, '.artifacts', name);
  mkdirSync(output, { recursive: true });
  cpSync(join(root, 'deploy', name, 'Dockerfile'), join(output, 'Dockerfile'));
  // tar preserves pnpm's symlinks and dot directories, including node_modules/.pnpm.
  execFileSync('tar', ['-czf', join(output, `${name}.tar.gz`), '-C', directory, '.'], {
    stdio: 'inherit',
  });
}
console.log(`Deployment artifacts ready for ${revision}`);
