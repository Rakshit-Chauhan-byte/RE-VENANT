'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Ghost, Trash2, Cpu, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { GhostChatMessage, RepositoryAnalysis, SystemHealth } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface GhostInterfaceProps {
  analysis: RepositoryAnalysis;
  health: SystemHealth | null;
}

export function GhostInterface({ analysis, health }: GhostInterfaceProps) {
  const [messages, setMessages] = useState<GhostChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOllamaOnline = health?.ollamaAvailable ?? true;
  const isModelReady = health?.modelAvailable ?? true;

  // Initialize initial greeting when repository analysis changes
  useEffect(() => {
    const greetingText = `I awaken from the digital ether. I am the spirit of "${analysis.repository.name}". 
My records preserve ${analysis.repository.totalCommits} commits, with my final breath recorded on ${analysis.repository.lastCommitDate.split('T')[0]} (${analysis.statistics.daysSinceLastCommit} days ago). 

I sense ${analysis.unfinishedWork.length} unfinished fragments left behind. What would you ask of my history?`;

    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toISOString(),
        evidenceIds: analysis.evidence.slice(0, 3).map((e) => e.id),
      },
    ]);
  }, [analysis]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg: GhostChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          repositoryAnalysis: analysis,
          history: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'The ghost could not respond.');
      }

      const assistantMsg: GhostChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: result.data.reply,
        timestamp: new Date().toISOString(),
        evidenceIds: result.data.evidenceIds,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Communication severed.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `My memories are cleared. I stand ready once more to speak of ${analysis.repository.name}.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Ghost Séance Header */}
      <div className="rounded-xl border border-void-700 bg-void-900/80 p-4 backdrop-blur shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ghost-dim/60 border border-ghost-emerald/40 flex items-center justify-center text-ghost-phosphor shadow-ghost-glow">
            <Ghost className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-terminal text-white">COMMUNING WITH: {analysis.repository.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-void-800 text-ghost-mint font-mono border border-void-700">
                ACTIVE SÉANCE
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Grounded in {analysis.evidence.length} cataloged evidence artifacts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg bg-void-950 hover:bg-void-800 text-zinc-400 hover:text-zinc-200 border border-void-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Reset Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>
      </div>

      {/* Connection Warning if Ollama is Offline */}
      {(!isOllamaOnline || !isModelReady) && (
        <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-300 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Ghost Voice Inaudible (Local Ollama Offline)</p>
            <p className="text-amber-200/80 mt-0.5">
              {!isOllamaOnline
                ? 'Run "ollama serve" in your terminal to enable local AI inference.'
                : `Model "${health?.configuredModel}" is missing. Run "ollama pull ${health?.configuredModel}" to download.`}
            </p>
          </div>
        </div>
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 rounded-xl border border-void-800/80 bg-void-950/40 p-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Ghost Thinking indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-void-900/60 border border-void-800 text-xs font-mono text-ghost-mint">
            <Loader2 className="w-4 h-4 text-ghost-phosphor animate-spin" />
            <span>The Ghost is listening to echoes in the Git history...</span>
          </div>
        )}

        {/* Inline Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Controls */}
      <div className="shrink-0 pt-2">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isOllamaOnline || !isModelReady}
        />
      </div>
    </div>
  );
}
