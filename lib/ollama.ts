export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaTagsResponse {
  models: OllamaModelInfo[];
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaHealthResult {
  connected: boolean;
  hasModel: boolean;
  availableModels: string[];
  configuredModel: string;
  baseUrl: string;
  error?: string;
  suggestion?: string;
}

export function getOllamaConfig() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'gemma3:4b';
  // Allow 120 seconds default for CPU-based local model generation
  const timeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10);

  return { baseUrl, model, timeoutMs };
}

/**
 * Checks connectivity to local Ollama and verifies if the target model is installed.
 */
export async function checkOllamaHealth(): Promise<OllamaHealthResult> {
  const { baseUrl, model } = getOllamaConfig();

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return {
        connected: false,
        hasModel: false,
        availableModels: [],
        configuredModel: model,
        baseUrl,
        error: `Ollama returned HTTP ${response.status}: ${response.statusText}`,
        suggestion: 'Verify that Ollama server is running properly on ' + baseUrl,
      };
    }

    const data = (await response.json()) as OllamaTagsResponse;
    const modelNames = (data.models || []).map((m) => m.name);

    // Match either exact name or model name prefix (e.g. "gemma3:4b" or "gemma3:4b-latest")
    const hasModel = modelNames.some(
      (name) => name === model || name.startsWith(`${model}:`) || name.startsWith(model)
    );

    return {
      connected: true,
      hasModel,
      availableModels: modelNames,
      configuredModel: model,
      baseUrl,
      suggestion: !hasModel
        ? `Model "${model}" is not installed. Run "ollama pull ${model}" to install it.`
        : undefined,
    };
  } catch (err: unknown) {
    const error = err as Error;
    let suggestion = `Start Ollama by running "ollama serve" in a terminal or launching the Ollama desktop app.`;
    if (error.name === 'TimeoutError') {
      suggestion = `Ollama did not respond within 4 seconds. Check if the server is responsive at ${baseUrl}.`;
    }

    return {
      connected: false,
      hasModel: false,
      availableModels: [],
      configuredModel: model,
      baseUrl,
      error: `Could not connect to Ollama at ${baseUrl} (${error.message})`,
      suggestion,
    };
  }
}

/**
 * Sends a chat completion request to the local Ollama instance.
 */
export async function sendOllamaChat(
  messages: OllamaChatMessage[],
  overrideModel?: string,
  temperature: number = 0.3
): Promise<string> {
  const { baseUrl, model: defaultModel, timeoutMs } = getOllamaConfig();
  const model = overrideModel || defaultModel;

  const payload = {
    model,
    messages,
    stream: false,
    options: {
      temperature,
    },
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'TimeoutError') {
      throw new Error(
        `Ollama request timed out after ${timeoutMs / 1000} seconds. The local model may still be loading into memory or the prompt was very large.`
      );
    }
    throw new Error(
      `Failed to reach Ollama at ${baseUrl}: ${error.message}. Please ensure "ollama serve" is running.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 404) {
      throw new Error(
        `Model "${model}" was not found in Ollama. Please run "ollama pull ${model}" first.`
      );
    }
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  if (!data.message || typeof data.message.content !== 'string') {
    throw new Error('Malformed or empty response received from Ollama chat endpoint.');
  }

  return data.message.content;
}
