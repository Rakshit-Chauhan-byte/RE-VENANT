'use client';

import React, { useState } from 'react';
import { Database, Filter, Search, Copy, Check, AlertCircle, Info, AlertTriangle, Code2 } from 'lucide-react';
import { Evidence } from '@/lib/types';

interface EvidenceListProps {
  evidence: Evidence[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Artifacts' },
    { id: 'todo', label: 'TODOs & FIXMEs' },
    { id: 'git', label: 'Git History' },
    { id: 'doc', label: 'Documentation' },
    { id: 'structure', label: 'Structure & Stubs' },
    { id: 'config', label: 'Configurations' },
    { id: 'test', label: 'Tests' },
  ];

  const filteredEvidence = evidence.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (item.id || '').toLowerCase().includes(q);
      const matchPath = (item.filePath || '').toLowerCase().includes(q);
      const matchExpl = (item.explanation || '').toLowerCase().includes(q);
      const matchSnippet = (item.snippet || '').toLowerCase().includes(q);
      return matchId || matchPath || matchExpl || matchSnippet;
    }
    return true;
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-terminal text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-ghost-cyan" />
            <span>EVIDENCE LEDGER</span>
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Deterministic repository artifacts cataloged for forensic grounding and AI séance queries.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-void-900 border border-void-700 text-ghost-phosphor flex items-center gap-1.5 self-start">
          <span>Total Evidence Count:</span>
          <span className="font-bold">{evidence.length}</span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="rounded-xl border border-void-800 bg-void-900/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, file path, comment text..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-void-950 border border-void-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-ghost-emerald/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`text-[11px] font-mono px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${filterCategory === c.id
                    ? 'bg-ghost-dim/70 text-ghost-phosphor border border-ghost-emerald/40'
                    : 'bg-void-950 text-zinc-400 hover:text-zinc-200 border border-void-800'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Items List */}
      <div className="space-y-3">
        {filteredEvidence.map((item) => {
          const isAlert = item.severity === 'alert';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-4 transition-all bg-void-900/70 font-mono text-xs ${isAlert
                  ? 'border-red-900/50 hover:border-red-700/60'
                  : isWarning
                    ? 'border-amber-900/40 hover:border-amber-700/50'
                    : 'border-void-800 hover:border-void-700'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Evidence ID with copy */}
                  <button
                    onClick={() => handleCopy(item.id)}
                    className="px-2 py-0.5 rounded bg-void-950 border border-void-700 text-ghost-phosphor font-bold text-[11px] hover:border-ghost-emerald/60 flex items-center gap-1 transition-colors"
                    title="Click to copy ID for chat prompts"
                  >
                    <span>{item.id}</span>
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                    )}
                  </button>

                  {/* Category Badge */}
                  <span className="px-2 py-0.5 rounded bg-void-800 text-zinc-400 text-[10px] uppercase">
                    {item.category}
                  </span>

                  {/* Severity Badge */}
                  {isAlert && (
                    <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 text-[10px] flex items-center gap-1 border border-red-800/40">
                      <AlertCircle className="w-3 h-3" /> Critical
                    </span>
                  )}
                  {isWarning && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 text-[10px] flex items-center gap-1 border border-amber-800/40">
                      <AlertTriangle className="w-3 h-3" /> Unfinished
                    </span>
                  )}
                </div>

                {/* File Path & Line */}
                {item.filePath && (
                  <div className="text-[11px] text-zinc-400 text-right truncate max-w-xs sm:max-w-md">
                    <span className="text-ghost-cyan">{item.filePath}</span>
                    {item.lineNumber && <span className="text-zinc-500">:{item.lineNumber}</span>}
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="mt-2.5 text-zinc-200 text-xs leading-relaxed font-sans">
                {item.explanation}
              </div>

              {/* Code Snippet */}
              {item.snippet && (
                <div className="mt-2 p-2.5 rounded bg-void-950 border border-void-800 text-[11px] text-zinc-300 font-mono overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] pb-1 border-b border-void-900 mb-1.5">
                    <Code2 className="w-3 h-3" />
                    <span>Raw Code Excerpt</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{item.snippet}</pre>
                </div>
              )}
            </div>
          );
        })}

        {filteredEvidence.length === 0 && (
          <div className="p-12 text-center rounded-xl border border-void-800 bg-void-900/30 font-mono text-zinc-500 text-xs">
            No evidence matches the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}

