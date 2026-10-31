import { NextRequest, NextResponse } from 'next/server';
import { getOllamaConfig, sendOllamaChat } from '@/lib/ollama';
import { buildAutopsyPrompt } from '@/lib/prompts';
import { DigitalAutopsyReport, RepositoryAnalysis } from '@/lib/types';

export const dynamic = 'force-dynamic';

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  // Strip ```json ... ``` codeblocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
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

    const { systemPrompt, userPrompt } = buildAutopsyPrompt(repositoryAnalysis);
    const config = getOllamaConfig();

    const rawResponse = await sendOllamaChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    let parsed: Partial<DigitalAutopsyReport> = {};
    try {
      const cleaned = cleanJsonString(rawResponse);
      parsed = JSON.parse(cleaned);
    } catch {
      // Robust fallback extraction if model returned slight formatting defect
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          // Fallback to text synthesis
        }
      }
    }

    // Ensure all required fields exist
    const report: DigitalAutopsyReport = {
      overview:
        parsed.overview ||
        `Investigation of ${repositoryAnalysis.repository.name} containing ${repositoryAnalysis.repository.totalCommits} commits across ${repositoryAnalysis.statistics.totalFilesScanned} scanned files.`,
      timeline:
        parsed.timeline ||
        `Repository spans from first commit to ${repositoryAnalysis.repository.lastCommitDate}. Days since last recorded commit: ${repositoryAnalysis.statistics.daysSinceLastCommit}.`,
      lastRecordedActivity:
        parsed.lastRecordedActivity ||
        `Final commit: "${repositoryAnalysis.repository.lastCommitMessage}" by ${repositoryAnalysis.repository.lastCommitAuthor} on ${repositoryAnalysis.repository.lastCommitDate}.`,
      unfinishedTasksAnalysis:
        parsed.unfinishedTasksAnalysis ||
        `Discovered ${repositoryAnalysis.unfinishedWork.length} incomplete work markers (TODO: ${repositoryAnalysis.statistics.totalTodos}, FIXME: ${repositoryAnalysis.statistics.totalFixmes}, HACK: ${repositoryAnalysis.statistics.totalHacks}).`,
      documentationStatus:
        parsed.documentationStatus ||
        (repositoryAnalysis.problems.hasReadme
          ? 'README documentation file is present.'
          : 'No README or project documentation file was detected.'),
      technicalIssues:
        parsed.technicalIssues ||
        (repositoryAnalysis.problems.warnings.join('; ') || 'No critical configuration issues detected.'),
      discoveries: Array.isArray(parsed.discoveries) && parsed.discoveries.length > 0
        ? parsed.discoveries
        : [
            `Scanned ${repositoryAnalysis.statistics.totalFilesScanned} files with ${repositoryAnalysis.statistics.totalCommits} commits.`,
            `Identified ${repositoryAnalysis.unfinishedWork.length} unfinished task markers.`,
          ],
      unknownsAndLimitations: Array.isArray(parsed.unknownsAndLimitations) && parsed.unknownsAndLimitations.length > 0
        ? parsed.unknownsAndLimitations
        : [
            'Creator motivation for halting development cannot be established from Git metadata alone.',
            'External deployment pipelines and private third-party credentials cannot be verified.',
          ],
      facts: Array.isArray(parsed.facts) && parsed.facts.length > 0
        ? parsed.facts
        : [
            `Total commits recorded: ${repositoryAnalysis.repository.totalCommits}.`,
            `Days inactive: ${repositoryAnalysis.statistics.daysSinceLastCommit}.`,
            `Tracked files: ${repositoryAnalysis.repository.trackedFilesCount}.`,
          ],
      hypotheses: Array.isArray(parsed.hypotheses) && parsed.hypotheses.length > 0
        ? parsed.hypotheses
        : [
            repositoryAnalysis.statistics.totalFixmes > 0
              ? 'Unresolved FIXME items may indicate blocking technical hurdles.'
              : 'Development appears to have ceased following the last commit milestone.',
          ],
      unknowns: Array.isArray(parsed.unknowns) && parsed.unknowns.length > 0
        ? parsed.unknowns
        : [
            'The exact personal or commercial reason for project abandonment remains unknown.',
          ],
      keyEvidenceIds: Array.isArray(parsed.keyEvidenceIds) && parsed.keyEvidenceIds.length > 0
        ? parsed.keyEvidenceIds
        : repositoryAnalysis.evidence.slice(0, 5).map((e) => e.id),
      generatedByModel: config.model,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/autopsy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate digital autopsy.',
      },
      { status: 500 }
    );
  }
}
