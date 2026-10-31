'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { RepositoryInput } from '@/components/repository/RepositoryInput';
import { RepositoryOverview } from '@/components/repository/RepositoryOverview';
import { AnalysisReport } from '@/components/repository/AnalysisReport';
import { EvidenceList } from '@/components/repository/EvidenceList';
import { GhostInterface } from '@/components/ghost/GhostInterface';
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import {
  DigitalAutopsyReport,
  RepositoryAnalysis,
  RoadmapTask,
  SystemHealth,
} from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');

  // Application State
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [autopsyReport, setAutopsyReport] = useState<DigitalAutopsyReport | null>(null);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Loading States
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAutopsy, setIsGeneratingAutopsy] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Errors
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [autopsyError, setAutopsyError] = useState<string | null>(null);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Fetch System Health
  const fetchHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      if (json.success) {
        setHealth(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Handle Repository Analysis
  const handleAnalyzeRepository = async (repoPath: string) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAutopsyReport(null);
    setRoadmapTasks([]);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryPath: repoPath }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze repository.');
      }

      setAnalysis(json.data);
      setActiveTab('overview');
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'An error occurred during repository analysis.';
      setAnalyzeError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Autopsy Generation
  const handleGenerateAutopsy = async () => {
    if (!analysis) return;

    setIsGeneratingAutopsy(true);
    setAutopsyError(null);

    try {
      const res = await fetch('/api/autopsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryAnalysis: analysis }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate digital autopsy.');
      }

      setAutopsyReport(json.data);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Failed to complete digital autopsy.';
      setAutopsyError(errorMsg);
    } finally {
      setIsGeneratingAutopsy(false);
    }
  };

  // Handle Roadmap Generation
  const handleGenerateRoadmap = async () => {
    if (!analysis) return;

    setIsGeneratingRoadmap(true);
    setRoadmapError(null);

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryAnalysis: analysis }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate resurrection roadmap.');
      }

      setRoadmapTasks(json.data.tasks || []);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Failed to generate roadmap.';
      setRoadmapError(errorMsg);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Reset to clean state for new investigation
  const handleResetInvestigation = () => {
    setAnalysis(null);
    setAutopsyReport(null);
    setRoadmapTasks([]);
    setAnalyzeError(null);
    setAutopsyError(null);
    setRoadmapError(null);
    setActiveTab('input');
  };

  return (
    <div className="min-h-screen bg-void-950 flex flex-col font-sans selection:bg-ghost-phosphor/20 selection:text-ghost-phosphor">
      {/* Top Header */}
      <Header
        health={health}
        isLoadingHealth={isLoadingHealth}
        onRefreshHealth={fetchHealth}
        activeRepoName={analysis?.repository.name}
        activeRepoBranch={analysis?.repository.currentBranch}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          analysis={analysis}
          onResetInvestigation={handleResetInvestigation}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-void-900/40 via-void-950 to-void-950">
          {activeTab === 'input' && (
            <RepositoryInput
              onAnalyze={handleAnalyzeRepository}
              isAnalyzing={isAnalyzing}
              error={analyzeError}
            />
          )}

          {activeTab === 'overview' && analysis && (
            <RepositoryOverview
              analysis={analysis}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'autopsy' && analysis && (
            <AnalysisReport
              analysis={analysis}
              report={autopsyReport}
              onGenerateAutopsy={handleGenerateAutopsy}
              isGenerating={isGeneratingAutopsy}
              error={autopsyError}
            />
          )}

          {activeTab === 'ghost' && analysis && (
            <GhostInterface
              analysis={analysis}
              health={health}
            />
          )}

          {activeTab === 'roadmap' && analysis && (
            <RoadmapView
              analysis={analysis}
              tasks={roadmapTasks}
              onGenerateRoadmap={handleGenerateRoadmap}
              isGenerating={isGeneratingRoadmap}
              error={roadmapError}
            />
          )}

          {activeTab === 'evidence' && analysis && (
            <EvidenceList evidence={analysis.evidence} />
          )}
        </main>
      </div>
    </div>
  );
}
