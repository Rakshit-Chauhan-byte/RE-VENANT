'use client';

import React, { useState } from 'react';
import {
  FileSearch,
  Cpu,
  Sparkles,
  AlertCircle,
  Clock,
  HelpCircle,
  CheckCircle2,
  ListTodo,
  Layers,
  Shield,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { DigitalAutopsyReport, RepositoryAnalysis } from '@/lib/types';

interface AnalysisReportProps {
  analysis: RepositoryAnalysis;
  report: DigitalAutopsyReport | null;
  onGenerateAutopsy: () => Promise<void>;
  isGenerating: boolean;
  error?: string | null;
}

export function AnalysisReport({
  analysis,
  report,
  onGenerateAutopsy,
  isGenerating,
  error,
}: AnalysisReportProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Autopsy Header */}
      <div className="rounded-xl border border-void-700 bg-void-900/80 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ghost-phosphor animate-pulse"></span>
              <h2 className="text-xl font-bold font-terminal text-white tracking-wide">
                DIGITAL AUTOPSY: FORENSIC REPORT
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              AI-synthesized repository archaeological examination grounded strictly in collected evidence.
            </p>
          </div>

          <button
            onClick={onGenerateAutopsy}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 font-terminal font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-ghost-glow disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>EXAMINING SPECIMEN...</span>
              </>
            ) : report ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-RUN AUTOPSY</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>COMMENCE AUTOPSY</span>
              </>
            )}
          </button>
        </div>

        {/* Model Execution Disclaimer */}
        <div className="mt-4 pt-4 border-t border-void-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-ghost-cyan" />
            <span>
              Engine: <strong className="text-ghost-mint">Gemma 3 4B</strong> via local Ollama
            </span>
          </div>
          <span className="text-zinc-500 hidden sm:inline">Evidence-bounded • Zero Cloud Inference</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Digital Autopsy Interrupted</p>
            <p className="text-red-300/90">{error}</p>
            <p className="text-[11px] text-zinc-400 mt-2">
              Ensure Ollama is running (`ollama serve`) and the configured model is installed.
            </p>
          </div>
        </div>
      )}

      {/* Empty State before generation */}
      {!report && !isGenerating && !error && (
        <div className="p-12 text-center rounded-xl border border-void-800 bg-void-900/40 space-y-4">
          <div className="w-12 h-12 rounded-full bg-void-800 border border-void-700 flex items-center justify-center mx-auto text-ghost-phosphor shadow-ghost-glow">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-terminal font-bold text-white text-base">SPECIMEN PREPARED FOR EXAMINATION</h3>
            <p className="text-xs font-mono text-zinc-400">
              {analysis.statistics.totalFilesScanned} files cataloged, {analysis.unfinishedWork.length} unfinished
              markers detected, and {analysis.evidence.length} evidence tokens are ready. Click &ldquo;COMMENCE
              AUTOPSY&rdquo; to begin forensic interpretation with Gemma 3.
            </p>
          </div>
          <button
            onClick={onGenerateAutopsy}
            className="px-5 py-2.5 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 font-terminal font-bold text-xs inline-flex items-center gap-2 shadow-ghost-glow cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>BEGIN AUTOPSY</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="p-12 text-center rounded-xl border border-void-800 bg-void-900/60 space-y-4">
          <Loader2 className="w-8 h-8 text-ghost-phosphor animate-spin mx-auto" />
          <div className="space-y-1 font-mono">
            <p className="text-sm text-white font-bold">Summoning Historical Memory...</p>
            <p className="text-xs text-zinc-400">
              Gemma 3 4B is evaluating Git commit vectors and cross-referencing {analysis.evidence.length} evidence
              artifacts locally.
            </p>
          </div>
        </div>
      )}

      {/* Autopsy Results Display */}
      {report && (
        <div className="space-y-6">
          {/* Primary Forensic Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ghost-phosphor flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>1. Repository Overview &amp; Intended Purpose</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.overview}</p>
            </div>

            {/* Development Timeline */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ghost-cyan flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>2. Development Timeline &amp; Active Periods</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.timeline}</p>
            </div>

            {/* Last Recorded Activity */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>3. Last Recorded Activity</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.lastRecordedActivity}</p>
            </div>

            {/* Unfinished Work */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                <span>4. Unfinished Tasks &amp; Stubs</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.unfinishedTasksAnalysis}</p>
            </div>

            {/* Documentation Status */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ghost-mint flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>5. Documentation Status</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.documentationStatus}</p>
            </div>

            {/* Potential Technical Issues */}
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>6. Potential Technical Issues</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{report.technicalIssues}</p>
            </div>
          </div>

          {/* Forensic Distinctions: Facts vs Hypotheses vs Unknowns */}
          <div className="rounded-xl border border-void-700 bg-void-900/80 p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Epistemological Forensic Classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Verified Facts */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verified Facts</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">Directly supported by repository records.</p>
                <ul className="space-y-1.5 pt-2">
                  {report.facts.map((fact, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 font-sans flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible Explanations */}
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Possible Explanations</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">Plausible engineering interpretations.</p>
                <ul className="space-y-1.5 pt-2">
                  {report.hypotheses.map((hyp, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 font-sans flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{hyp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unknowns & Limitations */}
              <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-700/60 space-y-2">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs font-bold uppercase">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Unknowns &amp; Limitations</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">Unprovable from Git records alone.</p>
                <ul className="space-y-1.5 pt-2">
                  {report.unknowns.map((un, idx) => (
                    <li key={idx} className="text-xs text-zinc-400 font-sans flex items-start gap-1.5">
                      <span className="text-zinc-500">•</span>
                      <span>{un}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Key Discoveries */}
          {report.discoveries && report.discoveries.length > 0 && (
            <div className="rounded-xl border border-void-800 bg-void-900/60 p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ghost-phosphor flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Important Discoveries &amp; Evidence Cross-Links</span>
              </h3>
              <div className="space-y-2">
                {report.discoveries.map((disc, idx) => (
                  <div key={idx} className="p-3 rounded bg-void-950 border border-void-800 text-xs text-zinc-200 font-mono">
                    {disc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
