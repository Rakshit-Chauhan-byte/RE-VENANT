import { getGitRepositoryInfo } from './git';
import { scanRepository } from './repository';
import {
  Evidence,
  RepositoryAnalysis,
  RepositoryStatistics,
} from './types';
import { validateRepositoryPath } from './validation';

/**
 * Analyzes a local repository completely, extracting Git history, project structure,
 * unfinished work markers, problems, and evidence.
 */
export async function analyzeRepository(repoPath: string): Promise<RepositoryAnalysis> {
  // 1. Validate the path
  const validation = await validateRepositoryPath(repoPath);
  if (!validation.valid || !validation.normalizedPath) {
    throw new Error(validation.error || 'Invalid repository path');
  }

  const normalizedPath = validation.normalizedPath;

  // 2. Extract Git information safely
  const { metadata, activity } = await getGitRepositoryInfo(normalizedPath);

  // 3. Scan filesystem boundedly
  const scanResult = await scanRepository(normalizedPath);

  // 4. Synthesize Git-specific evidence
  const gitEvidence: Evidence[] = [];
  let gitEvCounter = 1;

  if (metadata.totalCommits > 0) {
    gitEvidence.push({
      id: `EV-GIT-${String(gitEvCounter++).padStart(3, '0')}`,
      category: 'git',
      commitHash: activity.recentCommits[0]?.hash,
      explanation: `Last commit recorded on ${metadata.lastCommitDate} (${activity.daysSinceLastCommit} days ago) by "${metadata.lastCommitAuthor}": "${metadata.lastCommitMessage}"`,
      severity: activity.daysSinceLastCommit > 180 ? 'warning' : 'info',
    });

    if (metadata.firstCommitDate) {
      gitEvidence.push({
        id: `EV-GIT-${String(gitEvCounter++).padStart(3, '0')}`,
        category: 'git',
        explanation: `Repository history spans from first commit on ${metadata.firstCommitDate} to ${metadata.lastCommitDate}`,
        severity: 'info',
      });
    }

    if (metadata.contributors.length > 0) {
      gitEvidence.push({
        id: `EV-GIT-${String(gitEvCounter++).padStart(3, '0')}`,
        category: 'git',
        explanation: `Identified ${metadata.contributors.length} unique contributor(s) across ${metadata.totalCommits} total commit(s).`,
        severity: 'info',
      });
    }

    if (activity.unmergedBranches && activity.unmergedBranches.length > 0) {
      gitEvidence.push({
        id: `EV-GIT-${String(gitEvCounter++).padStart(3, '0')}`,
        category: 'git',
        explanation: `Detected active or abandoned secondary branch(es): ${activity.unmergedBranches.join(', ')}`,
        severity: 'warning',
      });
    }
  } else {
    gitEvidence.push({
      id: `EV-GIT-${String(gitEvCounter++).padStart(3, '0')}`,
      category: 'git',
      explanation: 'Repository is freshly initialized with zero recorded commits.',
      severity: 'alert',
    });
  }

  // Combine evidence
  const allEvidence: Evidence[] = [...gitEvidence, ...scanResult.evidence];

  // 5. Count unfinished markers
  let todos = 0;
  let fixmes = 0;
  let hacks = 0;

  for (const item of scanResult.unfinishedWork) {
    if (item.type === 'TODO') todos++;
    else if (item.type === 'FIXME') fixmes++;
    else if (item.type === 'HACK' || item.type === 'XXX') hacks++;
  }

  // Determine abandonment likelihood grounded in evidence
  let abandonmentAssessment: 'High' | 'Moderate' | 'Low' | 'Active' = 'Active';
  if (metadata.totalCommits === 0) {
    abandonmentAssessment = 'High'; // Empty/stagnant repo
  } else if (activity.daysSinceLastCommit > 365) {
    abandonmentAssessment = 'High';
  } else if (activity.daysSinceLastCommit > 180) {
    abandonmentAssessment = 'Moderate';
  } else if (activity.daysSinceLastCommit > 30) {
    abandonmentAssessment = 'Low';
  } else {
    abandonmentAssessment = 'Active';
  }

  const statistics: RepositoryStatistics = {
    totalFilesScanned: scanResult.structure.totalScannedFiles,
    totalTodos: todos,
    totalFixmes: fixmes,
    totalHacks: hacks,
    totalCommits: metadata.totalCommits,
    daysSinceLastCommit: activity.daysSinceLastCommit,
    abandonmentAssessment,
  };

  return {
    repository: metadata,
    structure: scanResult.structure,
    unfinishedWork: scanResult.unfinishedWork,
    gitActivity: activity,
    problems: scanResult.problems,
    evidence: allEvidence,
    statistics,
    analyzedAt: new Date().toISOString(),
  };
}

