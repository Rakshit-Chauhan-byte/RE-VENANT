'use client';

import React, { useState } from 'react';
import { Compass, ShieldCheck, AlertCircle, ArrowRight, Loader2, Sparkles, Folder } from 'lucide-react';

interface RepositoryInputProps {
  onAnalyze: (path: string) => Promise<void>;
  isAnalyzing: boolean;
  error?: string | null;
}

export function RepositoryInput({ onAnalyze, isAnalyzing, error }: RepositoryInputProps) {
  const [repoPath, setRepoPath] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoPath.trim();
    if (!trimmed) {
      setValidationError('Please enter a local Git repository path.');
      return;
    }

    setValidationError(null);
    await onAnalyze(trimmed);
  };

  const handleUseCurrentRepo = () => {
    // Convenient shortcut for current repository
    setRepoPath('d:\\Projects\\REVENANT');
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Intro Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-ghost-emerald/30 text-ghost-phosphor text-xs font-mono mb-2 shadow-ghost-glow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hacktoberfest Week 4 — Ghost in the Machine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-terminal">
          COMMENCE <span className="text-ghost-phosphor">REPOSITORY SÉANCE</span>
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto font-mono">
          &ldquo;Every abandoned project has a story. Let yours speak again.&rdquo;
        </p>
      </div>

      {/* Main Terminal Input Card */}
      <div className="rounded-xl border border-void-700 bg-void-900/90 p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-void-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs font-mono text-zinc-500 ml-2">archaeologist@revenant-terminal:~</span>
          </div>
          <span className="text-xs font-mono text-ghost-mint/70 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-ghost-phosphor" />
            LOCAL_INSPECTOR_V1
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="repoPathInput" className="block text-xs font-mono uppercase text-zinc-300 tracking-wider">
              Absolute Local Repository Path:
            </label>
            <div className="relative">
              <input
                id="repoPathInput"
                type="text"
                value={repoPath}
                onChange={(e) => {
                  setRepoPath(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isAnalyzing}
                placeholder="e.g. C:\Users\HP\Projects\abandoned-app or /home/dev/old-tool"
                className="w-full px-4 py-3.5 rounded-lg bg-void-950 border border-void-700 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-ghost-phosphor focus:ring-1 focus:ring-ghost-phosphor transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Provide the full path to a local directory containing a <code className="text-zinc-400">.git</code> folder or worktree.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-zinc-500">Quick Test:</span>
            <button
              type="button"
              onClick={handleUseCurrentRepo}
              className="text-xs font-mono px-2.5 py-1 rounded bg-void-800 hover:bg-void-700 text-zinc-300 hover:text-ghost-phosphor border border-void-700 flex items-center gap-1.5 transition-colors"
            >
              <Folder className="w-3 h-3 text-ghost-cyan" />
              <span>Current Project (d:\Projects\REVENANT)</span>
            </button>
          </div>

          {/* Error Message */}
          {(validationError || error) && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Inspection Failed</p>
                <p className="text-red-300/90 mt-0.5">{validationError || error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing || !repoPath.trim()}
            className="w-full py-3.5 px-6 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 font-terminal font-bold text-sm tracking-wider uppercase transition-all shadow-ghost-glow hover:shadow-ghost-glow-strong flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>EXHUMING REPOSITORY ARTIFACTS...</span>
              </>
            ) : (
              <>
                <span>COMMENCE INVESTIGATION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Safety Guarantees */}
        <div className="mt-8 pt-6 border-t border-void-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-ghost-phosphor shrink-0 mt-0.5" />
            <span>Strictly Read-Only (no modifications, commits, or deletions)</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-ghost-phosphor shrink-0 mt-0.5" />
            <span>Never runs package scripts or executes code</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-ghost-phosphor shrink-0 mt-0.5" />
            <span>Zero cloud AI telemetry — local inference via Ollama</span>
          </div>
        </div>
      </div>
    </div>
  );
}
