import fs from 'fs/promises';
import path from 'path';

export interface PathValidationResult {
  valid: boolean;
  normalizedPath?: string;
  error?: string;
  isGitRepo?: boolean;
}

/**
 * Validates and normalizes an absolute local directory path.
 * Checks that the directory exists, is a directory, and contains a valid .git directory or worktree file.
 */
export async function validateRepositoryPath(rawPath: string | unknown): Promise<PathValidationResult> {
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    return {
      valid: false,
      error: 'Repository path must be a non-empty string.',
    };
  }

  const trimmed = rawPath.trim();

  // Basic check for absolute path
  // Windows: C:\... or \\... | Unix: /...
  const isWindowsAbsolute = /^[a-zA-Z]:[/\\]/.test(trimmed) || trimmed.startsWith('\\\\');
  const isUnixAbsolute = trimmed.startsWith('/');

  if (!isWindowsAbsolute && !isUnixAbsolute) {
    return {
      valid: false,
      error: `Path "${trimmed}" is not an absolute path. Please provide an absolute directory path (e.g. C:\\Projects\\my-repo or /home/user/my-repo).`,
    };
  }

  const normalized = path.resolve(trimmed);

  try {
    const stat = await fs.stat(normalized);
    if (!stat.isDirectory()) {
      return {
        valid: false,
        normalizedPath: normalized,
        error: `Path "${normalized}" exists but is a file, not a directory.`,
      };
    }
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code === 'ENOENT') {
      return {
        valid: false,
        normalizedPath: normalized,
        error: `Directory "${normalized}" does not exist. Please check the path and try again.`,
      };
    }
    if (nodeErr.code === 'EACCES' || nodeErr.code === 'EPERM') {
      return {
        valid: false,
        normalizedPath: normalized,
        error: `Permission denied accessing "${normalized}".`,
      };
    }
    return {
      valid: false,
      normalizedPath: normalized,
      error: `Failed to access directory "${normalized}": ${nodeErr.message}`,
    };
  }

  // Check for .git directory or .git file (for git worktrees/submodules)
  const gitPath = path.join(normalized, '.git');
  try {
    const gitStat = await fs.stat(gitPath);
    // .git can be a directory or a file containing `gitdir: ...`
    if (gitStat.isDirectory() || gitStat.isFile()) {
      return {
        valid: true,
        normalizedPath: normalized,
        isGitRepo: true,
      };
    }
  } catch {
    return {
      valid: false,
      normalizedPath: normalized,
      isGitRepo: false,
      error: `The directory "${normalized}" is not a Git repository. No .git folder or worktree file was found.`,
    };
  }

  return {
    valid: true,
    normalizedPath: normalized,
    isGitRepo: true,
  };
}

/**
 * Validates chat input payload
 */
export function validateChatPayload(body: unknown): {
  valid: boolean;
  message?: string;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const { message } = body as { message?: unknown };

  if (typeof message !== 'string' || !message.trim()) {
    return { valid: false, error: 'Message field is required and cannot be empty.' };
  }

  if (message.length > 5000) {
    return { valid: false, error: 'Message exceeds the maximum permitted length of 5000 characters.' };
  }

  return { valid: true, message: message.trim() };
}
