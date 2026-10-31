import { NextRequest, NextResponse } from 'next/server';
import { OllamaChatMessage, sendOllamaChat } from '@/lib/ollama';
import { buildGhostSystemPrompt } from '@/lib/prompts';
import { RepositoryAnalysis } from '@/lib/types';
import { validateChatPayload } from '@/lib/validation';

export const dynamic = 'force-dynamic';

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

    const validation = validateChatPayload(body);
    if (!validation.valid || !validation.message) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid chat message.' },
        { status: 400 }
      );
    }

    const { repositoryAnalysis, history } = (body || {}) as {
      repositoryAnalysis?: RepositoryAnalysis;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!repositoryAnalysis || !repositoryAnalysis.repository) {
      return NextResponse.json(
        { success: false, error: 'Valid repositoryAnalysis context is required for Ghost Chat.' },
        { status: 400 }
      );
    }

    const systemPrompt = buildGhostSystemPrompt(repositoryAnalysis);

    // Prepare bounded conversation history (last 10 messages)
    const formattedHistory: OllamaChatMessage[] = [];
    if (Array.isArray(history)) {
      const recent = history.slice(-10);
      for (const msg of recent) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          formattedHistory.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    const messages: OllamaChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: validation.message },
    ];

    const reply = await sendOllamaChat(messages, undefined, 0.4);

    // Extract evidence IDs mentioned in reply (e.g. EV-TODO-001, EV-GIT-002)
    const evidenceMatches = reply.match(/EV-[A-Z]+-\d+/g);
    const evidenceIds = Array.from(new Set(evidenceMatches || []));

    return NextResponse.json({
      success: true,
      data: {
        reply,
        evidenceIds,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to communicate with the repository ghost.',
      },
      { status: 500 }
    );
  }
}
