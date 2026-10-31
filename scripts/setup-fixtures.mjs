import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(execFile);

async function runGit(repoPath, args) {
  return execAsync('git', args, { cwd: repoPath, windowsHide: true });
}

async function setup() {
  const root = path.resolve('fixtures');

  // 1. sample-abandoned-repo
  const abandonedPath = path.join(root, 'sample-abandoned-repo');
  await fs.mkdir(path.join(abandonedPath, 'src'), { recursive: true });
  await runGit(abandonedPath, ['init', '-b', 'main']);
  await runGit(abandonedPath, ['config', 'user.name', 'Forgotten Dev']);
  await runGit(abandonedPath, ['config', 'user.email', 'dev@abandoned.local']);

  await fs.writeFile(
    path.join(abandonedPath, 'README.md'),
    `# QuantumTask
A minimal task orchestration daemon.

## Status
WIP - Work In Progress. Abandoned mid-refactor.
`
  );

  await fs.writeFile(
    path.join(abandonedPath, 'src', 'auth.ts'),
    `export class AuthService {
  // TODO: Implement OAuth2 refresh token rotation
  login(token: string) {
    // FIXME: Token expiration check leaks memory
    return true;
  }

  // NOT IMPLEMENTED: Two-factor biometric verification
  verify2FA() {
    throw new Error('Not implemented');
  }
}
`
  );

  await fs.writeFile(
    path.join(abandonedPath, 'src', 'worker.ts'),
    `export function dispatchJob() {
  // HACK: Bypass queue deadlock by force flushing buffer
  console.log('Dispatching...');
}
`
  );

  await runGit(abandonedPath, ['add', '.']);
  await runGit(abandonedPath, ['commit', '-m', 'feat: initial auth module and worker dispatch']);

  await fs.writeFile(
    path.join(abandonedPath, 'src', 'notes.txt'),
    `Leaving for the weekend. Need to fix the auth memory leak before deploying.`
  );
  await runGit(abandonedPath, ['add', '.']);
  await runGit(abandonedPath, ['commit', '-m', 'docs: update notes for weekend handover']);

  // 2. no-git-dir
  const noGitPath = path.join(root, 'no-git-dir');
  await fs.mkdir(noGitPath, { recursive: true });
  await fs.writeFile(path.join(noGitPath, 'file.txt'), 'Just a regular folder, not a git repository');

  // 3. clean-repo (Zero TODOs)
  const cleanPath = path.join(root, 'clean-repo');
  await fs.mkdir(path.join(cleanPath, 'src'), { recursive: true });
  await runGit(cleanPath, ['init', '-b', 'main']);
  await runGit(cleanPath, ['config', 'user.name', 'Clean Dev']);
  await runGit(cleanPath, ['config', 'user.email', 'clean@dev.local']);
  await fs.writeFile(path.join(cleanPath, 'README.md'), '# Clean Repo\nFully documented without any pending markers.');
  await fs.writeFile(path.join(cleanPath, 'src', 'index.ts'), 'export const sum = (a: number, b: number) => a + b;\n');
  await runGit(cleanPath, ['add', '.']);
  await runGit(cleanPath, ['commit', '-m', 'feat: production ready clean utility library']);

  // 4. large-repo (Over 500 files to test bounding)
  const largePath = path.join(root, 'large-repo');
  const largeSrc = path.join(largePath, 'modules');
  await fs.mkdir(largeSrc, { recursive: true });
  await runGit(largePath, ['init', '-b', 'main']);
  await runGit(largePath, ['config', 'user.name', 'Bulk Dev']);
  await runGit(largePath, ['config', 'user.email', 'bulk@dev.local']);
  await fs.writeFile(path.join(largePath, 'README.md'), '# Large Repo\nContains 550 generated files to test scan bounding limits.');

  const filePromises = [];
  for (let i = 1; i <= 550; i++) {
    filePromises.push(fs.writeFile(path.join(largeSrc, `module_${i}.ts`), `export const id_${i} = ${i};\n`));
  }
  await Promise.all(filePromises);
  await runGit(largePath, ['add', '.']);
  await runGit(largePath, ['commit', '-m', 'chore: generate 550 modular test components']);

  console.log('All test fixtures initialized successfully.');
}

setup().catch(console.error);

