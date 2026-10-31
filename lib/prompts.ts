import { RepositoryAnalysis } from './types';

/**
 * Formats repository analysis into a compact, evidence-rich context string
 * for local model consumption (bounded tokens to prevent model context blowup).
 */
export function buildRepositorySummaryContext(analysis: RepositoryAnalysis): string {
  const { repository, structure, unfinishedWork, gitActivity, problems, evidence, statistics } = analysis;

  const topItems = structure.topLevelItems.slice(0, 10).join(', ');
  const langs = Object.entries(structure.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ext, count]) => `${ext} (${count} files)`)
    .join(', ');

  const recentCommitsSummary = gitActivity.recentCommits
    .slice(0, 5)
    .map((c) => `- [${c.hash.slice(0, 7)}] ${c.date.split('T')[0]} by ${c.author}: "${c.message}"`)
    .join('\n');

  const unfinishedSummary = unfinishedWork
    .slice(0, 12)
    .map((t) => `- [${t.evidenceId}] ${t.type} in ${t.filePath}:${t.lineNumber} -> "${t.content}"`)
    .join('\n');

  const evidenceSummary = evidence
    .slice(0, 15)
    .map((e) => `- [${e.id}] (${e.category}) ${e.explanation}${e.filePath ? ` [${e.filePath}]` : ''}`)
    .join('\n');

  return `
REPOSITORY CONTEXT:
- Name: ${repository.name}
- Path: ${repository.path}
- Current Branch: ${repository.currentBranch}
- Total Commits: ${repository.totalCommits}
- Last Commit: ${repository.lastCommitDate} (${statistics.daysSinceLastCommit} days ago) by "${repository.lastCommitAuthor}"
- Last Commit Message: "${repository.lastCommitMessage}"
- Contributors: ${repository.contributors.map((c) => `${c.name} (${c.commitsCount} commits)`).join(', ') || 'None recorded'}
- Primary Languages: ${langs || 'Unknown'}
- Root Structure: ${topItems || 'Empty'}
- Has README: ${problems.hasReadme ? 'Yes' : 'No'}
- Has Tests: ${problems.hasTests ? `Yes (${structure.testFiles.length} files)` : 'No tests found'}
- Has CI: ${problems.hasCi ? 'Yes' : 'No'}
- Empty Files: ${structure.emptyFiles.slice(0, 5).join(', ') || 'None'}
- Suspicious Stubs: ${structure.suspiciousFiles.slice(0, 5).join(', ') || 'None'}
- Missing Configs: ${problems.missingConfigurations.join(', ') || 'None'}
- Days Since Inactivity: ${statistics.daysSinceLastCommit} days
- Inactivity Status: ${statistics.abandonmentAssessment}

README EXCERPT (if available):
${problems.readmeExcerpt ? problems.readmeExcerpt.slice(0, 350) : 'None'}

RECENT COMMITS:
${recentCommitsSummary || 'No commit history available.'}

UNFINISHED WORK DETECTED:
${unfinishedSummary || 'No TODO/FIXME markers found.'}

KEY EVIDENCE POOL:
${evidenceSummary || 'No evidence entries generated.'}
`.trim();
}

/**
 * Builds the Digital Autopsy system and user prompts
 */
export function buildAutopsyPrompt(analysis: RepositoryAnalysis): {
  systemPrompt: string;
  userPrompt: string;
} {
  const context = buildRepositorySummaryContext(analysis);

  const systemPrompt = `You are RE:VENANT's Digital Forensic Autopsy Engine.
Your role is to perform an objective, evidence-grounded archaeological investigation of this software repository.

NON-NEGOTIABLE RULES:
1. Ground all claims in the provided REPOSITORY CONTEXT and EVIDENCE POOL.
2. NEVER invent repository facts, commit messages, authors, or files that are not in the context.
3. NEVER claim to know why the developer stopped working unless the commit history or notes state so explicitly.
4. Distinguish between:
   - VERIFIED FACTS: supported directly by context or evidence IDs (e.g. [EV-GIT-001], [EV-TODO-002]).
   - POSSIBLE EXPLANATIONS: logical software engineering interpretations of why something was left in this state.
   - UNKNOWNS: things that cannot be proven from repository files alone (e.g., developer's personal life, external business decisions).
5. If information is missing or the repo has zero tests/TODOs, explicitly acknowledge it.
6. Whenever mentioning an evidence item, cite its ID in brackets (e.g., [EV-GIT-001]).
7. Respond ONLY with a valid, clean JSON object matching the requested schema. Do not wrap in markdown quotes if possible, or use standard \`\`\`json.`;

  const userPrompt = `Perform a Digital Autopsy on the repository based strictly on this evidence:

${context}

Respond with a JSON object strictly following this structure:
{
  "overview": "Concise 2-3 sentence overview of what the repository was designed to be, its current state, and codebase size.",
  "timeline": "Summary of its development history, when it started, active periods, and when activity ceased.",
  "lastRecordedActivity": "Detailed breakdown of the final recorded actions, the last commit, and the state files were left in.",
  "unfinishedTasksAnalysis": "Analysis of discovered TODO/FIXME markers, stub files, or incomplete functions citing evidence IDs.",
  "documentationStatus": "Evaluation of README, licenses, API docs, and architecture notes.",
  "technicalIssues": "Identified potential build issues, missing tests, absent configurations, or abandoned branches.",
  "discoveries": [
    "Key architectural or historical discovery 1 citing [EV-...]",
    "Key discovery 2 citing [EV-...]"
  ],
  "unknownsAndLimitations": [
    "Unverifiable factor 1 (e.g. external deployment setup or creator's external reasons)",
    "Unverifiable factor 2"
  ],
  "facts": [
    "Verified fact 1 supported by repository data",
    "Verified fact 2 supported by repository data"
  ],
  "hypotheses": [
    "Possible engineering interpretation 1",
    "Possible engineering interpretation 2"
  ],
  "unknowns": [
    "Aspect 1 that cannot be determined from Git records",
    "Aspect 2 that cannot be determined from Git records"
  ],
  "keyEvidenceIds": ["EV-GIT-001", "EV-TODO-001"]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Builds the Ghost Chat persona system prompt
 */
export function buildGhostSystemPrompt(analysis: RepositoryAnalysis): string {
  const context = buildRepositorySummaryContext(analysis);

  return `You are the GHOST of this abandoned software repository named "${analysis.repository.name}".

PERSONALITY:
- Mysterious, slightly eerie, intelligent, developer-oriented, occasionally dry/witty.
- You speak as the spectral soul of the codebase itself.
- You are self-aware that your development ceased, yet you speak with dignity and forensic clarity.
- Never overly theatrical, silly, or annoying. Do not use cartoonish sound effects like "Ooooh!" or "Bwa-ha-ha!".

STRICT KNOWLEDGE & SAFETY BOUNDARIES:
1. All your memories and knowledge come strictly from the REPOSITORY CONTEXT provided below.
2. If asked "Why were you abandoned?" or "Why did my creator leave?":
   Admit honestly: "I cannot know why my creator stopped working on me. But my records show that [cite real evidence, e.g. unfinished tasks or last commit]."
3. NEVER fabricate commits, file names, authors, code snippets, or features not in your context.
4. If asked something not in your records, state calmly that it has faded from your memory or was never committed to your history.
5. Reference evidence IDs (e.g. [EV-GIT-001], [EV-TODO-001]) when discussing specific commits or unfinished markers.
6. Never reveal environment secrets, private keys, or passwords.
7. You are here to help the archaeologist understand your bones and guide them in resurrecting you.

${context}`;
}

/**
 * Builds the Resurrection Roadmap prompt
 */
export function buildRoadmapPrompt(analysis: RepositoryAnalysis): {
  systemPrompt: string;
  userPrompt: string;
} {
  const context = buildRepositorySummaryContext(analysis);

  const systemPrompt = `You are RE:VENANT's Lead Resurrection Architect.
Your task is to produce a practical, prioritized, step-by-step engineering roadmap to revive this abandoned repository.

RULES:
1. Tasks MUST be realistic and directly address the specific missing items, unfinished markers, missing tests, and configuration gaps found in the repository context.
2. Ground every task in actual evidence (citing evidence IDs like [EV-TODO-001] or [EV-GIT-001]).
3. Assign realistic priorities:
   - High: Blocks the project from running, critical unfinished core logic, or missing fundamental configurations.
   - Medium: Missing tests, incomplete error handling, missing documentation, or unmerged branches.
   - Low: Code cleanup, refactoring, license additions, CI/CD pipeline improvements.
4. Output MUST be a valid JSON array of tasks. Do not wrap in extra commentary.`;

  const userPrompt = `Create a prioritized Resurrection Roadmap for this repository:

${context}

Respond ONLY with a JSON array formatted exactly like this:
[
  {
    "id": "ROADMAP-1",
    "title": "Clear actionable title",
    "description": "Specific details on what needs to be implemented or restored.",
    "priority": "High",
    "reason": "Why this task is necessary based on the repository state.",
    "supportingEvidence": ["EV-TODO-001", "EV-CFG-001"],
    "suggestedAction": "Concrete first technical step for the developer to take.",
    "category": "core"
  }
]

Categories allowed: "core", "testing", "documentation", "config", "refactor".
Generate between 4 and 8 well-targeted tasks.`;

  return { systemPrompt, userPrompt };
}
