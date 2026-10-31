'use client';

import React from 'react';
import {
  Compass,
  FileSearch,
  MessageSquare,
  Milestone,
  Layers,
  Database,
  Clock,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { RepositoryAnalysis } from '@/lib/types';

export type ActiveTab = 'input' | 'overview' | 'autopsy' | 'ghost' | 'roadmap' | 'evidence';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  analysis: RepositoryAnalysis | null;
  onResetInvestigation: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  analysis,
  onResetInvestigation,
}: SidebarProps) {
  const hasAnalysis = Boolean(analysis);

  const navItems = [
    {
      id: 'input' as ActiveTab,
      label: 'Repository Séance',
      sublabel: 'Connect & Inquire',
      icon: Compass,
      enabled: true,
    },
    {
      id: 'overview' as ActiveTab,
      label: 'Repository Overview',
      sublabel: 'Vitals & Architecture',
      icon: Layers,
      enabled: hasAnalysis,
    },
    {
      id: 'autopsy' as ActiveTab,
      label: 'Digital Autopsy',
      sublabel: 'AI Forensic Report',
      icon: FileSearch,
      enabled: hasAnalysis,
    },
    {
      id: 'ghost' as ActiveTab,
      label: 'Talk to the Ghost',
      sublabel: 'Conversational Séance',
      icon: MessageSquare,
      enabled: hasAnalysis,
    },
    {
      id: 'roadmap' as ActiveTab,
      label: 'Resurrection Roadmap',
      sublabel: 'Revival Action Plan',
      icon: Milestone,
      enabled: hasAnalysis,
    },
    {
      id: 'evidence' as ActiveTab,
      label: 'Evidence Ledger',
      sublabel: 'Cataloged Markers',
      icon: Database,
      badge: analysis?.evidence.length,
      enabled: hasAnalysis,
    },
  ];

  return (
    <aside className="w-64 border-r border-void-800 bg-void-950 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        {/* Quick action: New Investigation */}
        <div>
          <button
            onClick={onResetInvestigation}
            className="w-full py-2.5 px-3 rounded-lg border border-void-700 bg-void-900/80 hover:bg-void-850 hover:border-ghost-emerald/40 text-xs font-mono text-zinc-300 hover:text-ghost-phosphor flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-ghost-cyan" />
            <span>New Investigation</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 pb-2">
            Investigation Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = !item.enabled;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && onSelectTab(item.id)}
                disabled={isDisabled}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all font-mono text-xs ${
                  isActive
                    ? 'bg-void-900 text-ghost-phosphor border border-ghost-emerald/30 shadow-ghost-glow'
                    : isDisabled
                    ? 'text-zinc-600 cursor-not-allowed opacity-50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-ghost-phosphor' : isDisabled ? 'text-zinc-700' : 'text-zinc-400'
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 font-sans">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-ghost-dim/80 text-ghost-phosphor border border-ghost-emerald/40'
                        : 'bg-void-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Repository Vitals Footer (if analyzed) */}
      {analysis && (
        <div className="p-4 border-t border-void-800 bg-void-900/40">
          <div className="text-[10px] font-mono uppercase text-zinc-500 mb-2">
            Subject Vitals
          </div>
          <div className="space-y-2 text-xs font-mono text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Inactive
              </span>
              <span className="text-ghost-mint">{analysis.statistics.daysSinceLastCommit}d</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Pending TODOs
              </span>
              <span className="text-amber-300">{analysis.unfinishedWork.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Abandonment Risk</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  analysis.statistics.abandonmentAssessment === 'High'
                    ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                    : analysis.statistics.abandonmentAssessment === 'Moderate'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                {analysis.statistics.abandonmentAssessment}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
