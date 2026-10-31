import fs from 'fs/promises';
import path from 'path';
import {
  Evidence,
  ProblemIndicators,
  ProjectStructure,
  UnfinishedTask,
} from './types';

// Default limits
const DEFAULT_MAX_FILES = 500;
const DEFAULT_MAX_FILE_SIZE = 256 * 1024; // 256 KB
const MAX_DIRECTORY_DEPTH = 8;

// Folders to ignore
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'out',
  'target',
  'vendor',
  '.venv',
  'venv',
  'env',
  '__pycache__',
  '.turbo',
  '.cache',
  '.idea',
  '.vscode',
  'bin',
  'obj',
  'coverage',
  '.gradle',
  '.cargo',
]);

// Binary / media extensions to ignore
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff',
  '.pdf', '.zip', '.tar', '.gz', '.tgz', '.bz2', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
  '.mp3', '.mp4', '.wav', '.mov', '.avi', '.mkv',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.wasm', '.pyc', '.class', '.o', '.a',
  '.lock', '.sqlite', '.db', '.parquet',
]);

// Secret file patterns (NEVER read these)
const SECRET_FILE_PATTERNS = [
  /^\.env/i,
  /\.pem$/i,
  /\.key$/i,
  /\.keystore$/i,
  /\.jks$/i,
  /\.kdbx$/i,
  /id_rsa/i,
  /id_ecdsa/i,
  /id_ed25519/i,
  /credentials/i,
  /secrets?\./i,
  /\.htpasswd/i,
  /\.pfx$/i,
  /\.p12$/i,
  /^\.npmrc$/i,
  /^\.pypirc$/i,
  /^\.netrc$/i,
];

// Regex to catch unfinished work comments
const TODO_REGEX = /(?:\/\/|#|\/\*|<!--|;|\*)\s*(TODO|FIXME|HACK|XXX|NOT IMPLEMENTED|NOT_IMPLEMENTED|STUB)\b[:\s-]*(.*)/i;

export interface ScanOptions {
  maxFiles?: number;
  maxFileSize?: number;
}

export interface ScanResult {
  structure: ProjectStructure;
  unfinishedWork: UnfinishedTask[];
  problems: ProblemIndicators;
  evidence: Evidence[];
}

/**
 * Checks if a filename matches sensitive secret patterns
 */
function isSecretFile(filename: string): boolean {
  return SECRET_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Scans a local Git repository safely with bounded limits and extraction.
 */
export async function scanRepository(
  repoPath: string,
  options: ScanOptions = {}
): Promise<ScanResult> {
  const maxFiles = options.maxFiles || parseInt(process.env.MAX_SCAN_FILES || '500', 10) || DEFAULT_MAX_FILES;
  const maxFileSize = options.maxFileSize || parseInt(process.env.MAX_FILE_SIZE_BYTES || '262144', 10) || DEFAULT_MAX_FILE_SIZE;

  const topLevelItems: string[] = [];
  const readmeFiles: string[] = [];
  const configFiles: string[] = [];
  const packageManifests: string[] = [];
  const testFiles: string[] = [];
  const emptyFiles: string[] = [];
  const suspiciousFiles: string[] = [];
  const languages: Record<string, number> = {};

  const unfinishedWork: UnfinishedTask[] = [];
  const evidence: Evidence[] = [];
  let scannedFileCount = 0;
  let evidenceCounter = 1;

  function createEvidenceId(prefix: string): string {
    const id = `EV-${prefix.toUpperCase()}-${String(evidenceCounter).padStart(3, '0')}`;
    evidenceCounter++;
    return id;
  }

  // Read top level items
  try {
    const topEntries = await fs.readdir(repoPath, { withFileTypes: true });
    for (const entry of topEntries) {
      if (entry.name !== '.git') {
        topLevelItems.push(entry.name);
      }
    }
  } catch (err) {
    console.warn('Failed reading top-level entries:', err);
  }

  // Recursive bounded directory traversal
  async function traverse(currentDir: string, depth: number) {
    if (depth > MAX_DIRECTORY_DEPTH || scannedFileCount >= maxFiles) {
      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (scannedFileCount >= maxFiles) break;

      // Security: never traverse symbolic links to prevent circular references and path traversal outside repo root
      if (entry.isSymbolicLink()) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);

      // Security: ensure fullPath is strictly contained within repoPath
      const resolvedPath = path.resolve(fullPath);
      const resolvedRoot = path.resolve(repoPath);
      if (!resolvedPath.startsWith(resolvedRoot)) {
        continue;
      }

      const relativePath = path.relative(repoPath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name.toLowerCase()) && !entry.name.startsWith('.')) {
          await traverse(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        scannedFileCount++;
        const ext = path.extname(entry.name).toLowerCase();
        const lowerName = entry.name.toLowerCase();

        // Check if sensitive secret file - NEVER inspect content
        if (isSecretFile(entry.name)) {
          continue;
        }

        // Track languages
        if (ext) {
          languages[ext] = (languages[ext] || 0) + 1;
        }

        // Classify manifests and configs
        if (
          lowerName === 'package.json' ||
          lowerName === 'cargo.toml' ||
          lowerName === 'pyproject.toml' ||
          lowerName === 'pom.xml' ||
          lowerName === 'build.gradle' ||
          lowerName === 'go.mod' ||
          lowerName === 'gemfile' ||
          lowerName === 'composer.json'
        ) {
          packageManifests.push(relativePath);
        } else if (
          lowerName.includes('config') ||
          lowerName === 'makefile' ||
          lowerName === 'dockerfile' ||
          lowerName.startsWith('docker-compose')
        ) {
          configFiles.push(relativePath);
        }

        // Classify README
        if (lowerName.startsWith('readme')) {
          readmeFiles.push(relativePath);
        }

        // Classify Test files
        if (
          lowerName.includes('test') ||
          lowerName.includes('spec') ||
          relativePath.includes('/__tests__/') ||
          relativePath.includes('/test/') ||
          relativePath.includes('/tests/')
        ) {
          testFiles.push(relativePath);
        }

        // Check file size & stats
        let fileStat;
        try {
          fileStat = await fs.stat(fullPath);
        } catch {
          continue;
        }

        if (fileStat.size === 0) {
          emptyFiles.push(relativePath);
          if (emptyFiles.length <= 10) {
            const evId = createEvidenceId('EMPTY');
            evidence.push({
              id: evId,
              category: 'structure',
              filePath: relativePath,
              explanation: `Empty file detected with 0 bytes: "${relativePath}"`,
              severity: 'warning',
            });
          }
          continue;
        }

        // Skip binary extensions or files exceeding size limit
        if (IGNORED_EXTENSIONS.has(ext) || fileStat.size > maxFileSize) {
          continue;
        }

        // Read text file safely
        try {
          const content = await fs.readFile(fullPath, 'utf8');

          // Check for suspicious tiny placeholder files (< 80 bytes)
          if (fileStat.size < 80) {
            const lowerContent = content.toLowerCase();
            if (
              lowerContent.includes('todo') ||
              lowerContent.includes('wip') ||
              lowerContent.includes('placeholder') ||
              lowerContent.includes('coming soon')
            ) {
              suspiciousFiles.push(relativePath);
              const evId = createEvidenceId('STUB');
              evidence.push({
                id: evId,
                category: 'structure',
                filePath: relativePath,
                snippet: content.trim(),
                explanation: `Suspicious placeholder/stub file detected: "${relativePath}" containing "${content.trim()}"`,
                severity: 'warning',
              });
            }
          }

          // Scan lines for TODO / FIXME / HACK markers
          const lines = content.split(/\r?\n/);
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Performance: skip excessively long lines (e.g. bundled or minified code) to prevent regex backtracking
            if (line.length > 2000) {
              continue;
            }
            const match = line.match(TODO_REGEX);
            if (match) {
              const markerType = match[1].toUpperCase().replace(/\s+/g, '_') as
                | 'TODO'
                | 'FIXME'
                | 'HACK'
                | 'XXX'
                | 'NOT_IMPLEMENTED'
                | 'STUB';
              const rawComment = (match[2] || '').trim();
              const surrounding = lines
                .slice(Math.max(0, i - 1), Math.min(lines.length, i + 2))
                .join('\n');

              const evId = createEvidenceId(markerType.slice(0, 4));
              const task: UnfinishedTask = {
                id: `TASK-${unfinishedWork.length + 1}`,
                type: markerType === 'STUB' ? 'TODO' : markerType,
                filePath: relativePath,
                lineNumber: i + 1,
                content: rawComment || line.trim(),
                surroundingCode: surrounding,
                evidenceId: evId,
              };

              unfinishedWork.push(task);

              // Add to evidence pool (bounded to 40 max to avoid token blowout)
              if (evidence.length < 50) {
                evidence.push({
                  id: evId,
                  category: 'todo',
                  filePath: relativePath,
                  lineNumber: i + 1,
                  snippet: line.trim(),
                  explanation: `Unfinished work marker [${markerType}] found in ${relativePath}:${i + 1}`,
                  severity: markerType === 'FIXME' || markerType === 'NOT_IMPLEMENTED' ? 'alert' : 'warning',
                });
              }
            }
          }
        } catch {
          // File might be non-UTF8 or unreadable, ignore safely
        }
      }
    }
  }

  await traverse(repoPath, 0);

  // Read excerpt of first README found
  let readmeExcerpt: string | undefined;
  if (readmeFiles.length > 0) {
    try {
      const readmePath = path.join(repoPath, readmeFiles[0]);
      const raw = await fs.readFile(readmePath, 'utf8');
      const lines = raw.split(/\r?\n/).slice(0, 40);
      readmeExcerpt = lines.join('\n').slice(0, 1500);

      const evId = createEvidenceId('DOC');
      evidence.push({
        id: evId,
        category: 'doc',
        filePath: readmeFiles[0],
        snippet: readmeExcerpt.slice(0, 200) + '...',
        explanation: `Primary repository documentation found in ${readmeFiles[0]}`,
        severity: 'info',
      });
    } catch {
      // Non-critical
    }
  }

  // Check License
  let hasLicense = false;
  let licenseName: string | undefined;
  for (const item of topLevelItems) {
    if (/^license|^copying|^unlicense/i.test(item)) {
      hasLicense = true;
      licenseName = item;
      break;
    }
  }

  // Check CI
  let hasCi = false;
  try {
    const ghActionsPath = path.join(repoPath, '.github', 'workflows');
    const ghStat = await fs.stat(ghActionsPath);
    if (ghStat.isDirectory()) {
      hasCi = true;
    }
  } catch {
    // Check other CI files
    hasCi = topLevelItems.some(
      (item) => item === '.gitlab-ci.yml' || item === 'Jenkinsfile' || item === '.travis.yml'
    );
  }

  // Detect missing configurations
  const missingConfigurations: string[] = [];
  const hasTs = Object.keys(languages).some((ext) => ext === '.ts' || ext === '.tsx');
  const hasPackageJson = packageManifests.some((p) => p.toLowerCase() === 'package.json');
  const hasTsConfig = configFiles.some((c) => c.toLowerCase().includes('tsconfig.json'));

  if (hasTs && !hasTsConfig) {
    missingConfigurations.push('TypeScript files present without tsconfig.json');
    const evId = createEvidenceId('CFG');
    evidence.push({
      id: evId,
      category: 'config',
      explanation: 'Repository contains TypeScript source code but no tsconfig.json configuration file.',
      severity: 'warning',
    });
  }

  if (hasPackageJson) {
    try {
      const pkgPath = path.join(repoPath, 'package.json');
      const pkgRaw = await fs.readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(pkgRaw);
      if (!pkg.scripts || !pkg.scripts.test || pkg.scripts.test.includes('no test specified')) {
        if (testFiles.length === 0) {
          missingConfigurations.push('package.json exists without configured test suite');
        }
      }
    } catch {
      // Ignore
    }
  }

  // Problem warnings
  const warnings: string[] = [];
  if (readmeFiles.length === 0) {
    warnings.push('No README or project documentation file was detected.');
    const evId = createEvidenceId('DOC');
    evidence.push({
      id: evId,
      category: 'doc',
      explanation: 'No README or project documentation file found in the repository.',
      severity: 'alert',
    });
  }

  if (testFiles.length === 0) {
    warnings.push('No unit or integration tests were detected in the repository.');
    const evId = createEvidenceId('TEST');
    evidence.push({
      id: evId,
      category: 'test',
      explanation: 'Zero test files found in the codebase.',
      severity: 'warning',
    });
  }

  if (!hasLicense) {
    warnings.push('No open source or proprietary LICENSE file was detected.');
  }

  const structure: ProjectStructure = {
    topLevelItems,
    readmeFiles,
    configFiles,
    packageManifests,
    testFiles,
    emptyFiles,
    suspiciousFiles,
    languages,
    totalScannedFiles: scannedFileCount,
  };

  const problems: ProblemIndicators = {
    hasReadme: readmeFiles.length > 0,
    readmeExcerpt,
    hasTests: testFiles.length > 0,
    hasLicense,
    licenseName,
    hasCi,
    missingConfigurations,
    potentialStaleModules: suspiciousFiles,
    warnings,
  };

  return {
    structure,
    unfinishedWork,
    problems,
    evidence,
  };
}

