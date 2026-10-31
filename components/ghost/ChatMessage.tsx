'use client';

import React from 'react';
import { GhostChatMessage } from '@/lib/types';
import { Ghost, User, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: GhostChatMessage;
}

function formatTimestamp(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const [copiedEvidence, setCopiedEvidence] = React.useState<string | null>(null);

  const handleCopyEvidence = (evId: string) => {
    navigator.clipboard.writeText(evId);
    setCopiedEvidence(evId);
    setTimeout(() => setCopiedEvidence(null), 2000);
  };

  // Format content to highlight evidence IDs: [EV-XXX-000] or EV-XXX-000
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\[?EV-[A-Z]+-\d+\]?)/g);

    return parts.map((part, index) => {
      const match = part.match(/\[?(EV-[A-Z]+-\d+)\]?/);
      if (match) {
        const evId = match[1];
        return (
          <button
            key={index}
            onClick={() => handleCopyEvidence(evId)}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-void-950 border border-ghost-emerald/40 text-ghost-phosphor font-mono text-[11px] hover:border-ghost-phosphor transition-colors shadow-sm"
            title={`Referenced Evidence ${evId} (Click to copy)`}
          >
            <span>{evId}</span>
            {copiedEvidence === evId ? (
              <Check className="w-2.5 h-2.5 text-emerald-400" />
            ) : (
              <Copy className="w-2.5 h-2.5 text-zinc-500" />
            )}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex gap-3 sm:gap-4 p-4 rounded-xl transition-colors ${
      isAssistant ? 'bg-void-900/80 border border-void-800' : 'bg-void-950/60 border border-void-850'
    }`}>
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-lg bg-ghost-dim/60 border border-ghost-emerald/40 flex items-center justify-center text-ghost-phosphor shadow-ghost-glow">
            <Ghost className="w-4 h-4 animate-pulse-subtle" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-void-800 border border-void-700 flex items-center justify-center text-zinc-300">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className={isAssistant ? 'text-ghost-phosphor font-bold' : 'text-zinc-400'}>
            {isAssistant ? 'THE GHOST' : 'ARCHAEOLOGIST'}
          </span>
          <span className="text-zinc-600">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap break-words">
          {renderFormattedContent(message.content)}
        </div>

        {/* Evidence citations footer if attached */}
        {message.evidenceIds && message.evidenceIds.length > 0 && (
          <div className="mt-2 pt-2 border-t border-void-800/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500">Cited Evidence:</span>
            {message.evidenceIds.map((evId) => (
              <span
                key={evId}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-void-950 text-ghost-mint border border-void-700"
              >
                {evId}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

