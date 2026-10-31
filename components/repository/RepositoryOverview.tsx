'use client';

import React from 'react';
import {
  GitCommit,
  GitBranch,
  Clock,
  Users,
  FileCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSearch,
  MessageSquare,
  Milestone,
} from 'lucide-react';
import { RepositoryAnalysis } from '@/lib/types';

interface RepositoryOverviewProps {
  analysis: RepositoryAnalysis;
  onNavigateTab: (tab: 'autopsy' | 'ghost' | 'roadmap' | 'evidence') => void;
}

export function RepositoryOverview({ analysis, onNavigateTab }: RepositoryOverviewProps) {
  const { repository, structure, gitActivity, problems, statistics } = analysis;

  const abandonmentBadgeClass =
    statistics.abandonmentAssessment === 'High'
      ? 'bg-red-950/60 text-red-400 border-red-800/50'
      : statistics.abandonmentAssessment === 'Moderate'
      ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
      : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Subject Header Banner */}
      <div className="rounded-xl border border-void-700 bg-void-900/80 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-terminal text-white tracking-wide">
                {repository.name}
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-mono border ${abandonmentBadgeClass}`}>
                Inactivity Assessment: {statistics.abandonmentAssessment}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1 break-all">
              Path: <span className="text-zinc-300">{repository.path}</span>
            </p>
          </div>

          {/* Quick jump CTA buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('autopsy')}
              className="px-3.5 py-2 rounded-lg bg-void-800 hover:bg-void-700 border border-void-600 text-ghost-phosphor hover:border-ghost-emerald/40 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Digital Autopsy</span>
            </button>
            <button
              onClick={() => onNavigateTab('ghost')}
              className="px-3.5 py-2 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 text-xs font-terminal font-bold flex items-center gap-1.5 transition-all shadow-ghost-glow"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Summon Ghost</span>
            </button>
          </div>
        </div>

        {/* Vital Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-lg bg-void-950 border border-void-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-ghost-mint" />
              <span>Inactivity</span>
            </div>
            <div className="text-xl font-bold font-terminal text-white mt-1">
              {statistics.daysSinceLastCommit} <span className="text-xs font-normal text-zinc-500">days</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
              Last commit: {repository.lastCommitDate.split('T')[0] || 'Unknown'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-void-950 border border-void-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <GitCommit className="w-3.5 h-3.5 text-ghost-cyan" />
              <span>Total Commits</span>
            </div>
            <div className="text-xl font-bold font-terminal text-white mt-1">
              {repository.totalCommits}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
              Branch: <span className="text-zinc-300">{repository.currentBranch}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-void-950 border border-void-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Unfinished Tasks</span>
            </div>
            <div className="text-xl font-bold font-terminal text-amber-400 mt-1">
              {analysis.unfinishedWork.length}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
              {statistics.totalTodos} TODOs, {statistics.totalFixmes} FIXMEs
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-void-950 border border-void-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <FileCode className="w-3.5 h-3.5 text-ghost-emerald" />
              <span>Scanned Files</span>
            </div>
            <div className="text-xl font-bold font-terminal text-white mt-1">
              {structure.totalScannedFiles}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
              {repository.trackedFilesCount} tracked by Git
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Health Checks & Language Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repository Health Markers */}
        <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-ghost-cyan" />
            <span>Health &amp; Documentation Indicators</span>
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-void-950/80 border border-void-800">
              <span className="text-zinc-300">README / Documentation</span>
              {problems.hasReadme ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Present ({structure.readmeFiles[0]})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-3.5 h-3.5" /> Missing
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-void-950/80 border border-void-800">
              <span className="text-zinc-300">Automated Tests</span>
              {problems.hasTests ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {structure.testFiles.length} test files detected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <XCircle className="w-3.5 h-3.5" /> No tests detected
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-void-950/80 border border-void-800">
              <span className="text-zinc-300">Software License</span>
              {problems.hasLicense ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {problems.licenseName || 'Present'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-500">
                  <XCircle className="w-3.5 h-3.5" /> None detected
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-void-950/80 border border-void-800">
              <span className="text-zinc-300">Continuous Integration</span>
              {problems.hasCi ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-500">
                  <XCircle className="w-3.5 h-3.5" /> Not detected
                </span>
              )}
            </div>
          </div>

          {/* Warnings List */}
          {problems.warnings.length > 0 && (
            <div className="mt-4 pt-3 border-t border-void-800 space-y-1.5">
              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">
                Noticeable Gaps:
              </span>
              <ul className="space-y-1">
                {problems.warnings.map((w, idx) => (
                  <li key={idx} className="text-[11px] font-mono text-zinc-400 flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Structure & Languages */}
        <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-ghost-emerald" />
            <span>Codebase Composition &amp; Manifests</span>
          </h3>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400">Top Languages by File Extension:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(structure.languages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([ext, count]) => (
                  <span
                    key={ext}
                    className="px-2.5 py-1 rounded bg-void-950 border border-void-700 text-xs font-mono text-ghost-mint"
                  >
                    {ext} <span className="text-zinc-500">({count})</span>
                  </span>
                ))}
              {Object.keys(structure.languages).length === 0 && (
                <span className="text-xs font-mono text-zinc-500">No recognizable file extensions found.</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-void-800 space-y-2">
            <span className="text-[11px] font-mono text-zinc-400">Package Manifests:</span>
            <div className="text-xs font-mono text-zinc-300">
              {structure.packageManifests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {structure.packageManifests.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-void-800 text-zinc-300">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-zinc-500">No standard package manifests found.</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-void-800 space-y-2">
            <span className="text-[11px] font-mono text-zinc-400">Contributors Recorded:</span>
            <div className="space-y-1.5">
              {repository.contributors.slice(0, 4).map((c, idx) => (
                <div key={idx} className="text-xs font-mono flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-zinc-500" />
                    <span>{c.name}</span>
                  </span>
                  <span className="text-zinc-500">{c.commitsCount} commit(s)</span>
                </div>
              ))}
              {repository.contributors.length === 0 && (
                <div className="text-xs font-mono text-zinc-500">No contributor records found in Git.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Git Activity Timeline */}
      <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-ghost-phosphor" />
          <span>Last Recorded Git Commits</span>
        </h3>

        <div className="space-y-2">
          {gitActivity.recentCommits.slice(0, 6).map((commit) => (
            <div
              key={commit.hash}
              className="p-2.5 rounded bg-void-950 border border-void-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-1.5 py-0.5 rounded bg-void-800 text-ghost-mint font-bold">
                  {commit.hash.slice(0, 7)}
                </span>
                <span className="text-zinc-200 truncate max-w-md">{commit.message}</span>
              </div>
              <div className="text-zinc-500 flex items-center gap-3 shrink-0 text-[11px]">
                <span>{commit.author}</span>
                <span>{commit.date.split('T')[0]}</span>
              </div>
            </div>
          ))}

          {gitActivity.recentCommits.length === 0 && (
            <div className="text-xs font-mono text-zinc-500 py-4 text-center">
              No commit history recorded in this repository.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
