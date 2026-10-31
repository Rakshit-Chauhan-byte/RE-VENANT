'use client';

import React from 'react';
import { Activity, Cpu, GitBranch, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SystemHealth } from '@/lib/types';

interface HeaderProps {
  health: SystemHealth | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
  activeRepoName?: string;
  activeRepoBranch?: string;
}

export function Header({
  health,
  isLoadingHealth,
  onRefreshHealth,
  activeRepoName,
  activeRepoBranch,
}: HeaderProps) {
  const isHealthy = health?.status === 'healthy';
  const isOllamaConnected = health?.ollamaAvailable ?? false;
  const isModelReady = health?.modelAvailable ?? false;
  const isGitReady = health?.gitAvailable ?? false;

  return (
    <header className="border-b border-void-800 bg-void-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Repository */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ghost-dim/40 border border-ghost-emerald/40 flex items-center justify-center shadow-ghost-glow">
            <span className="text-ghost-phosphor font-terminal font-black text-sm tracking-wider">RE</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-terminal font-bold text-ghost-phosphor text-base tracking-widest uppercase">
                RE:VENANT
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-void-800 text-ghost-mint/80 border border-void-700 font-mono">
                LOCAL AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono hidden sm:block">
              Repository Archaeology &amp; Resurrection
            </p>
          </div>
        </div>

        {activeRepoName && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-void-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-void-900 border border-void-700 text-xs text-zinc-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-ghost-phosphor animate-pulse"></span>
              <span className="text-zinc-400 font-semibold">{activeRepoName}</span>
              {activeRepoBranch && (
                <span className="text-zinc-500 flex items-center gap-1 pl-1">
                  <GitBranch className="w-3 h-3 text-ghost-cyan" />
                  {activeRepoBranch}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* System Health / Local AI Indicators */}
      <div className="flex items-center gap-3">
        {/* Git Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border ${
            isGitReady
              ? 'bg-void-900/60 border-zinc-800 text-zinc-300'
              : 'bg-red-950/30 border-red-800/50 text-red-400'
          }`}
          title={isGitReady ? `Git v${health?.gitVersion || ''} installed` : 'Git is not found'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isGitReady ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span>Git</span>
        </div>

        {/* Ollama & Model Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono border transition-colors ${
            isOllamaConnected && isModelReady
              ? 'bg-void-900/80 border-ghost-dim text-ghost-mint shadow-ghost-glow'
              : isOllamaConnected
              ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
              : 'bg-red-950/30 border-red-800/40 text-red-400'
          }`}
          title={
            !isOllamaConnected
              ? 'Ollama is offline. Run "ollama serve"'
              : !isModelReady
              ? `Model ${health?.configuredModel} missing. Run "ollama pull ${health?.configuredModel}"`
              : `Ollama connected: ${health?.configuredModel}`
          }
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isOllamaConnected ? health?.configuredModel || 'Ollama' : 'Ollama Offline'}
          </span>
          <span className="sm:hidden">{isOllamaConnected ? 'AI Ready' : 'AI Offline'}</span>

          {isOllamaConnected && isModelReady ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-ghost-phosphor" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>

        {/* Refresh health */}
        <button
          onClick={onRefreshHealth}
          disabled={isLoadingHealth}
          className="p-1.5 rounded hover:bg-void-800 text-zinc-400 hover:text-ghost-phosphor transition-colors disabled:opacity-50"
          title="Refresh system status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}

