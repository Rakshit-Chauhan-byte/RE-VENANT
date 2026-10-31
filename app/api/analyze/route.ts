import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/analyzer';
import { validateRepositoryPath } from '@/lib/validation';

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

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object containing "repositoryPath".' },
        { status: 400 }
      );
    }

    const { repositoryPath } = body as { repositoryPath?: unknown };

    const validation = await validateRepositoryPath(repositoryPath);
    if (!validation.valid || !validation.normalizedPath) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Invalid repository path.',
          normalizedPath: validation.normalizedPath,
          isGitRepo: validation.isGitRepo ?? false,
        },
        { status: 400 }
      );
    }

    // Run the analysis engine
    const analysis = await analyzeRepository(validation.normalizedPath);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/analyze:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while analyzing the repository.',
      },
      { status: 500 }
    );
  }
}
