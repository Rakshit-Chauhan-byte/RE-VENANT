import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { ContributorInfo, GitActivity, GitCommitRecord, RepositoryMetadata } from './types';

const execFileAsync = promisify(execFile);

const GIT_TIMEOUT_MS = 8000;
const GIT_MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface GitExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Safely executes a read-only git command using argument arrays (NO shell invocation).
 * Strictly read-only operations allowed.
 */
export async function runGitCommand(
  repoPath: string,
  args: string[],
  timeoutMs: number = GIT_TIMEOUT_MS
): Promise<string> {
  // Safety check: only allow safe read-only subcommands
  const allowedSubcommands = new Set([
    'status',
    'log',
    'rev-parse',
    'rev-list',
    'branch',
    'ls-files',
    'shortlog',
    'diff',
    'describe',
    'tag',
    'config',
    'show',
  ]);

  const subcommand = args[0];
  if (!subcommand || !allowedSubcommands.has(subcommand)) {
    throw new Error(`Unauthorized or unsafe Git command argument: "${subcommand}"`);
  }

  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: repoPath,
      timeout: timeoutMs,
      maxBuffer: GIT_MAX_BUFFER_BYTES,
      shell: false, // Prevents shell injection
      windowsHide: true,
    });
    return stdout;
  } catch (err: unknown) {
    const error = err as Error & { code?: string | number; stderr?: string };
    const errMsg = error.stderr?.trim() || error.message;
    throw new Error(`Git error running "git ${args.join(' ')}": ${errMsg}`);
  }
}

/**
 * Checks if Git CLI is installed and returns its version.
 */
export async function checkGitInstallation(): Promise<{ installed: boolean; version: string | null }> {
  try {
    const { stdout } = await execFileAsync('git', ['--version'], {
      timeout: 3000,
      shell: false,
      windowsHide: true,
    });
    const versionMatch = stdout.match(/git version ([\d.]+)/);
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : stdout.trim(),
    };
  } catch {
    return {
      installed: false,
      version: null,
    };
  }
}

/**
 * Gathers complete Git metadata and history records for a verified repository.
 */
export async function getGitRepositoryInfo(repoPath: string): Promise<{
  metadata: RepositoryMetadata;
  activity: GitActivity;
}> {
  const repoName = path.basename(repoPath);

  // 1. Current branch
  let currentBranch = 'HEAD';
  try {
    const branchOut = await runGitCommand(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD']);
    currentBranch = branchOut.trim() || 'HEAD';
  } catch {
    // Empty repository or detached head
  }

  // 2. Total commits
  let totalCommits = 0;
  let hasCommits = false;
  try {
    const countOut = await runGitCommand(repoPath, ['rev-list', '--count', 'HEAD']);
    totalCommits = parseInt(countOut.trim(), 10) || 0;
    hasCommits = totalCommits > 0;
  } catch {
    // Newly initialized repo with no commits yet
  }

  // 3. Last commit details
  let lastCommitDate = 'Unknown (No commits)';
  let lastCommitMessage = 'No commits found';
  let lastCommitAuthor = 'Unknown';
  let firstCommitDate: string | undefined;

  if (hasCommits) {
    try {
      // Format: Hash%x1fAuthor%x1fDate%x1fSubject
      const lastLog = await runGitCommand(repoPath, [
        'log',
        '-1',
        '--format=%H%x1f%an%x1f%aI%x1f%s',
      ]);
      const parts = lastLog.trim().split('\x1f');
      if (parts.length >= 4) {
        lastCommitAuthor = (parts[1] || '').trim();
        lastCommitDate = (parts[2] || '').trim();
        lastCommitMessage = (parts[3] || '').trim();
      }
    } catch (err) {
      console.warn('Failed to retrieve last commit:', err);
    }

    try {
      const firstLog = await runGitCommand(repoPath, [
        'log',
        '--reverse',
        '-1',
        '--format=%aI',
      ]);
      firstCommitDate = firstLog.trim() || undefined;
    } catch {
      // Non-critical
    }
  }

  // 4. Tracked files count
  let trackedFilesCount = 0;
  try {
    const filesOut = await runGitCommand(repoPath, ['ls-files']);
    const files = filesOut.split('\n').filter((l) => l.trim().length > 0);
    trackedFilesCount = files.length;
  } catch {
    // If no commits, ls-files might be empty or fail
  }

  // 5. Contributors
  const contributors: ContributorInfo[] = [];
  if (hasCommits) {
    try {
      const shortlog = await runGitCommand(repoPath, ['shortlog', '-sne', 'HEAD']);
      const lines = shortlog.split('\n').filter((l) => l.trim().length > 0);
      for (const line of lines) {
        // Format: "    12  Jane Doe <jane@example.com>"
        const match = line.trim().match(/^(\d+)\s+(.+?)\s+<([^>]+)>$/);
        if (match) {
          contributors.push({
            commitsCount: parseInt(match[1], 10),
            name: match[2],
            email: match[3],
          });
        }
      }
    } catch {
      // Ignore shortlog error
    }
  }

  // 6. Recent branches
  const recentBranches: string[] = [];
  try {
    const branchOut = await runGitCommand(repoPath, [
      'branch',
      '--sort=-committerdate',
      '--format=%(refname:short)',
    ]);
    const bLines = branchOut.split('\n').map((b) => b.trim()).filter(Boolean);
    recentBranches.push(...bLines.slice(0, 10));
  } catch {
    // Non-critical
  }

  // 7. Recent commits log (up to 25)
  const recentCommits: GitCommitRecord[] = [];
  if (hasCommits) {
    try {
      const logOut = await runGitCommand(repoPath, [
        'log',
        '-n',
        '25',
        '--format=%H%x1f%aI%x1f%an%x1f%s',
      ]);
      const entries = logOut.split('\n').filter((l) => l.trim().length > 0);
      for (const entry of entries) {
        const parts = entry.split('\x1f');
        if (parts.length >= 4) {
          recentCommits.push({
            hash: (parts[0] || '').trim(),
            date: (parts[1] || '').trim(),
            author: (parts[2] || '').trim(),
            message: (parts[3] || '').trim(),
          });
        }
      }
    } catch {
      // Non-critical
    }
  }

  // Calculate inactive duration in days
  let daysSinceLastCommit = 0;
  if (hasCommits && lastCommitDate && lastCommitDate !== 'Unknown (No commits)') {
    const commitTime = new Date(lastCommitDate).getTime();
    if (!isNaN(commitTime)) {
      const diffMs = Date.now() - commitTime;
      daysSinceLastCommit = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  const metadata: RepositoryMetadata = {
    name: repoName,
    path: repoPath,
    currentBranch,
    totalCommits,
    lastCommitDate,
    lastCommitMessage,
    lastCommitAuthor,
    trackedFilesCount,
    contributors,
    recentBranches,
    firstCommitDate,
  };

  const activity: GitActivity = {
    recentCommits,
    daysSinceLastCommit,
    unmergedBranches: recentBranches.filter((b) => b !== currentBranch && b !== 'main' && b !== 'master'),
  };

  return { metadata, activity };
}

