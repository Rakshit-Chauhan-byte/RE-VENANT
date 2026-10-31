import { NextRequest, NextResponse } from 'next/server';
import { sendOllamaChat } from '@/lib/ollama';
import { buildRoadmapPrompt } from '@/lib/prompts';
import { RepositoryAnalysis, RoadmapTask } from '@/lib/types';

export const dynamic = 'force-dynamic';

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function generateDeterministicFallbackRoadmap(analysis: RepositoryAnalysis): RoadmapTask[] {
  const tasks: RoadmapTask[] = [];
  let idCounter = 1;

  // 1. Address critical unfinished tasks (FIXME / NOT IMPLEMENTED)
  const criticalUnfinished = analysis.unfinishedWork.filter(
    (u) => u.type === 'FIXME' || u.type === 'NOT_IMPLEMENTED'
  );
  if (criticalUnfinished.length > 0) {
    const first = criticalUnfinished[0];
    tasks.push({
      id: `ROADMAP-${idCounter++}`,
      title: `Resolve Critical Incomplete Logic: ${first.content || first.type}`,
      description: `Investigate and finish implementation in ${first.filePath} at line ${first.lineNumber}.`,
      priority: 'High',
      reason: `Unfinished marker [${first.type}] indicates broken or missing functionality.`,
      supportingEvidence: [first.evidenceId],
      suggestedAction: `Inspect ${first.filePath}:${first.lineNumber} and provide complete implementation.`,
      category: 'core',
    });
  }

  // 2. Address missing tests
  if (!analysis.problems.hasTests) {
    tasks.push({
      id: `ROADMAP-${idCounter++}`,
      title: 'Establish Automated Test Suite',
      description: 'Zero test files were found. Introduce a test framework appropriate for the codebase.',
      priority: 'High',
      reason: 'A project cannot be reliably revived without regression and verification tests.',
      supportingEvidence: analysis.evidence.filter((e) => e.category === 'test').map((e) => e.id),
      suggestedAction: 'Install a testing runner and write initial unit tests for primary modules.',
      category: 'testing',
    });
  }

  // 3. Address missing configurations
  if (analysis.problems.missingConfigurations.length > 0) {
    tasks.push({
      id: `ROADMAP-${idCounter++}`,
      title: 'Fix Missing Project Configurations',
      description: analysis.problems.missingConfigurations.join(', '),
      priority: 'Medium',
      reason: 'Incomplete tooling configurations prevent predictable builds and linting.',
      supportingEvidence: analysis.evidence.filter((e) => e.category === 'config').map((e) => e.id),
      suggestedAction: 'Add the missing configuration files and verify build tooling runs cleanly.',
      category: 'config',
    });
  }

  // 4. Address TODO items
  const todos = analysis.unfinishedWork.filter((u) => u.type === 'TODO');
  if (todos.length > 0) {
    tasks.push({
      id: `ROADMAP-${idCounter++}`,
      title: `Review and Complete ${todos.length} Pending TODO Items`,
      description: `Prioritize unfinished work marked in files: ${todos.slice(0, 3).map((t) => t.filePath).join(', ')}.`,
      priority: 'Medium',
      reason: 'Pending TODOs mark planned features that were abandoned mid-implementation.',
      supportingEvidence: todos.slice(0, 4).map((t) => t.evidenceId),
      suggestedAction: 'Audit TODO list and convert high-value items into active tasks.',
      category: 'core',
    });
  }

  // 5. Documentation restoration
  if (!analysis.problems.hasReadme) {
    tasks.push({
      id: `ROADMAP-${idCounter++}`,
      title: 'Restore Project README and Architecture Documentation',
      description: 'Document project goals, setup instructions, architecture, and current status.',
      priority: 'Medium',
      reason: 'No documentation was found, leaving new developers blind to project purpose.',
      supportingEvidence: analysis.evidence.filter((e) => e.category === 'doc').map((e) => e.id),
      suggestedAction: 'Draft a comprehensive README.md with installation and execution instructions.',
      category: 'documentation',
    });
  }

  // 6. Refactor & hygiene
  tasks.push({
    id: `ROADMAP-${idCounter++}`,
    title: 'Modernize Dependencies and Validate Build',
    description: `Last commit was ${analysis.statistics.daysSinceLastCommit} days ago. Dependencies and toolchains need inspection.`,
    priority: 'Low',
    reason: 'Stale dependencies often harbor security vulnerabilities and compatibility breaks.',
    supportingEvidence: analysis.evidence.filter((e) => e.category === 'git').map((e) => e.id),
    suggestedAction: 'Audit package manifests, update outdated libraries, and verify compilation.',
    category: 'refactor',
  });

  return tasks;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { repositoryAnalysis } = (body || {}) as { repositoryAnalysis?: RepositoryAnalysis };

    if (!repositoryAnalysis || !repositoryAnalysis.repository || !repositoryAnalysis.statistics) {
      return NextResponse.json(
        { success: false, error: 'Valid repositoryAnalysis payload is required.' },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildRoadmapPrompt(repositoryAnalysis);

    let tasks: RoadmapTask[] = [];

    try {
      const rawResponse = await sendOllamaChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      const cleaned = cleanJsonString(rawResponse);
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        tasks = parsed.map((item, idx) => ({
          id: item.id || `ROADMAP-${idx + 1}`,
          title: item.title || `Resurrection Task ${idx + 1}`,
          description: item.description || '',
          priority: item.priority === 'High' || item.priority === 'Medium' || item.priority === 'Low'
            ? item.priority
            : 'Medium',
          reason: item.reason || 'Identified during repository analysis.',
          supportingEvidence: Array.isArray(item.supportingEvidence) ? item.supportingEvidence : [],
          suggestedAction: item.suggestedAction || 'Review related code files.',
          category: ['core', 'testing', 'documentation', 'config', 'refactor'].includes(item.category)
            ? item.category
            : 'core',
        }));
      }
    } catch (parseErr) {
      console.warn('Ollama roadmap parsing failed, falling back to evidence-based deterministic roadmap:', parseErr);
      tasks = generateDeterministicFallbackRoadmap(repositoryAnalysis);
    }

    if (tasks.length === 0) {
      tasks = generateDeterministicFallbackRoadmap(repositoryAnalysis);
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate resurrection roadmap.',
      },
      { status: 500 }
    );
  }
}
