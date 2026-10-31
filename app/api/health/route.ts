import { NextResponse } from 'next/server';
import { checkGitInstallation } from '@/lib/git';
import { checkOllamaHealth, getOllamaConfig } from '@/lib/ollama';
import { SystemHealth } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gitInfo = await checkGitInstallation();
    const ollamaInfo = await checkOllamaHealth();
    const config = getOllamaConfig();

    let status: SystemHealth['status'] = 'healthy';
    if (!gitInfo.installed || !ollamaInfo.connected) {
      status = 'degraded';
    }
    if (!gitInfo.installed && !ollamaInfo.connected) {
      status = 'unavailable';
    }

    const health: SystemHealth = {
      status,
      gitAvailable: gitInfo.installed,
      gitVersion: gitInfo.version,
      ollamaAvailable: ollamaInfo.connected,
      ollamaUrl: config.baseUrl,
      configuredModel: config.model,
      modelAvailable: ollamaInfo.hasModel,
      availableModels: ollamaInfo.availableModels,
      error: ollamaInfo.error || (!gitInfo.installed ? 'Git is not installed or not in PATH' : undefined),
    };

    return NextResponse.json({
      success: true,
      data: health,
      suggestion: ollamaInfo.suggestion,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal health check failure',
      },
      { status: 500 }
    );
  }
}
