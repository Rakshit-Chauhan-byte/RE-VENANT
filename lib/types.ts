export interface Evidence {
  id: string; // e.g. EV-TODO-001, EV-GIT-002, EV-DOC-003
  category: 'todo' | 'git' | 'structure' | 'doc' | 'config' | 'test' | 'problem';
  filePath?: string;
  lineNumber?: number;
  commitHash?: string;
  snippet?: string;
  explanation: string;
  severity?: 'info' | 'warning' | 'alert';
}

export interface ContributorInfo {
  name: string;
  email: string;
  commitsCount: number;
}

export interface RepositoryMetadata {
  name: string;
  path: string;
  currentBranch: string;
  totalCommits: number;
  lastCommitDate: string;
  lastCommitMessage: string;
  lastCommitAuthor: string;
  trackedFilesCount: number;
  contributors: ContributorInfo[];
  recentBranches: string[];
  firstCommitDate?: string;
}

export interface UnfinishedTask {
  id: string;
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'NOT_IMPLEMENTED' | 'PLACEHOLDER';
  filePath: string;
  lineNumber: number;
  content: string;
  surroundingCode?: string;
  evidenceId: string;
}

export interface ProjectStructure {
  topLevelItems: string[];
  readmeFiles: string[];
  configFiles: string[];
  packageManifests: string[];
  testFiles: string[];
  emptyFiles: string[];
  suspiciousFiles: string[];
  languages: Record<string, number>;
  totalScannedFiles: number;
}

export interface GitCommitRecord {
  hash: string;
  date: string;
  author: string;
  message: string;
}

export interface GitActivity {
  recentCommits: GitCommitRecord[];
  daysSinceLastCommit: number;
  unmergedBranches?: string[];
  activeYearsRange?: string;
}

export interface ProblemIndicators {
  hasReadme: boolean;
  readmeExcerpt?: string;
  hasTests: boolean;
  testFramework?: string;
  hasLicense: boolean;
  licenseName?: string;
  hasCi: boolean;
  missingConfigurations: string[];
  potentialStaleModules: string[];
  warnings: string[];
}

export interface RepositoryStatistics {
  totalFilesScanned: number;
  totalTodos: number;
  totalFixmes: number;
  totalHacks: number;
  totalCommits: number;
  daysSinceLastCommit: number;
  abandonmentAssessment: 'High' | 'Moderate' | 'Low' | 'Active';
}

export interface RepositoryAnalysis {
  repository: RepositoryMetadata;
  structure: ProjectStructure;
  unfinishedWork: UnfinishedTask[];
  gitActivity: GitActivity;
  problems: ProblemIndicators;
  evidence: Evidence[];
  statistics: RepositoryStatistics;
  analyzedAt: string;
}

export interface DigitalAutopsyReport {
  overview: string;
  timeline: string;
  lastRecordedActivity: string;
  unfinishedTasksAnalysis: string;
  documentationStatus: string;
  technicalIssues: string;
  discoveries: string[];
  unknownsAndLimitations: string[];
  facts: string[];
  hypotheses: string[];
  unknowns: string[];
  keyEvidenceIds: string[];
  generatedByModel: string;
  generatedAt: string;
}

export interface GhostChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  evidenceIds?: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  supportingEvidence: string[];
  suggestedAction: string;
  category: 'core' | 'testing' | 'documentation' | 'config' | 'refactor';
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  gitAvailable: boolean;
  gitVersion: string | null;
  ollamaAvailable: boolean;
  ollamaUrl: string;
  configuredModel: string;
  modelAvailable: boolean;
  availableModels: string[];
  error?: string;
}
