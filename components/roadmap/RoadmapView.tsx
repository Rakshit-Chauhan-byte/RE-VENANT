'use client';

import React, { useState } from 'react';
import {
  Milestone,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { RepositoryAnalysis, RoadmapTask } from '@/lib/types';

interface RoadmapViewProps {
  analysis: RepositoryAnalysis;
  tasks: RoadmapTask[];
  onGenerateRoadmap: () => Promise<void>;
  isGenerating: boolean;
  error?: string | null;
}

export function RoadmapView({
  analysis,
  tasks,
  onGenerateRoadmap,
  isGenerating,
  error,
}: RoadmapViewProps) {
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  const toggleTaskCompleted = (id: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-xl border border-void-700 bg-void-900/80 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-ghost-phosphor" />
              <h2 className="text-xl font-bold font-terminal text-white tracking-wide">
                RESURRECTION ROADMAP
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Grounded, step-by-step technical plan to restore {analysis.repository.name} to active development.
            </p>
          </div>

          <button
            onClick={onGenerateRoadmap}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 font-terminal font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-ghost-glow disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CONJURING ROADMAP...</span>
              </>
            ) : tasks.length > 0 ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-GENERATE ROADMAP</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE ROADMAP</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar (if tasks exist) */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-void-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">
                Resurrection Progress: <strong className="text-ghost-mint">{completedCount} of {tasks.length} tasks completed</strong>
              </span>
              <span className="text-ghost-phosphor font-bold">{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-void-950 overflow-hidden border border-void-800">
              <div
                className="h-full bg-gradient-to-r from-ghost-dim via-ghost-emerald to-ghost-phosphor transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to Generate Roadmap</p>
            <p className="text-red-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !isGenerating && !error && (
        <div className="p-12 text-center rounded-xl border border-void-800 bg-void-900/40 space-y-4">
          <div className="w-12 h-12 rounded-full bg-void-800 border border-void-700 flex items-center justify-center mx-auto text-ghost-phosphor shadow-ghost-glow">
            <Milestone className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-terminal font-bold text-white text-base">NO ROADMAP GENERATED YET</h3>
            <p className="text-xs font-mono text-zinc-400">
              Generate a realistic revival roadmap tailored to the unfinished tasks, missing tests, and configuration
              gaps discovered in this repository.
            </p>
          </div>
          <button
            onClick={onGenerateRoadmap}
            className="px-5 py-2.5 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 font-terminal font-bold text-xs inline-flex items-center gap-2 shadow-ghost-glow cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>CREATE RESURRECTION PLAN</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="p-12 text-center rounded-xl border border-void-800 bg-void-900/60 space-y-4">
          <Loader2 className="w-8 h-8 text-ghost-phosphor animate-spin mx-auto" />
          <div className="space-y-1 font-mono">
            <p className="text-sm text-white font-bold">Synthesizing Practical Engineering Roadmap...</p>
            <p className="text-xs text-zinc-400">
              Gemma 3 4B is prioritizing discovered unfinished work markers and structuring actionable next steps.
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          {/* Priority filter pills */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <Filter className="w-3 h-3" /> Priority Filter:
            </span>
            {(['all', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  priorityFilter === p
                    ? 'bg-ghost-dim/80 text-ghost-phosphor border border-ghost-emerald/40'
                    : 'bg-void-950 text-zinc-400 hover:text-zinc-200 border border-void-800'
                }`}
              >
                {p === 'all' ? 'All Tasks' : `${p} Priority`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isCompleted = completedTaskIds.has(task.id);
              const isHigh = task.priority === 'High';
              const isMedium = task.priority === 'Medium';

              const priorityBadge = isHigh
                ? 'bg-red-950/60 text-red-400 border-red-800/40'
                : isMedium
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-5 transition-all bg-void-900/70 ${
                    isCompleted
                      ? 'border-void-800/50 opacity-60'
                      : isHigh
                      ? 'border-red-950/80 hover:border-red-800/60'
                      : 'border-void-800 hover:border-void-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="mt-0.5 text-zinc-400 hover:text-ghost-phosphor transition-colors shrink-0"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-ghost-phosphor" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold font-sans ${
                              isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                            }`}
                          >
                            {task.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Priority badge */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${priorityBadge}`}>
                            {task.priority} Priority
                          </span>

                          {/* Category badge */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-void-800 text-zinc-400 uppercase">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">{task.description}</p>

                      {/* Reason & Rationale */}
                      <div className="text-xs font-mono text-zinc-400 pt-1">
                        <strong className="text-zinc-300">Rationale: </strong>
                        <span>{task.reason}</span>
                      </div>

                      {/* Suggested Next Action */}
                      <div className="p-2.5 rounded bg-void-950 border border-void-800 text-xs font-mono text-ghost-mint flex items-start gap-2 mt-2">
                        <ArrowRight className="w-3.5 h-3.5 text-ghost-phosphor shrink-0 mt-0.5" />
                        <div>
                          <span className="text-zinc-400">Suggested Action: </span>
                          <span>{task.suggestedAction}</span>
                        </div>
                      </div>

                      {/* Supporting Evidence IDs */}
                      {task.supportingEvidence && task.supportingEvidence.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-500">Supporting Evidence:</span>
                          {task.supportingEvidence.map((evId) => (
                            <span
                              key={evId}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-void-950 text-ghost-cyan border border-void-800"
                            >
                              {evId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

