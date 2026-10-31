'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    'Why were you abandoned?',
    'What was my creator trying to build?',
    'Where was development left off?',
    'What are your most urgent incomplete tasks?',
    'Can you help me return to life?',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;

    setInput('');
    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggested = (q: string) => {
    if (isLoading || disabled) return;
    onSendMessage(q);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="space-y-3">
      {/* Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <span className="text-zinc-600 text-[10px] uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-ghost-cyan" />
          <span>Inquire:</span>
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggested(q)}
            disabled={isLoading || disabled}
            className="px-2.5 py-1 rounded-full bg-void-900 border border-void-800 hover:border-ghost-emerald/40 hover:text-ghost-phosphor text-zinc-400 text-[11px] whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="relative rounded-xl border border-void-700 bg-void-950 p-2 focus-within:border-ghost-emerald/60 transition-all shadow-lg">
        <div className="flex items-start gap-2">
          <div className="pt-2 pl-2 text-ghost-phosphor">
            <Terminal className="w-4 h-4" />
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={disabled ? 'Ollama is offline. Start Ollama to chat.' : 'Commune with the repository ghost... (Enter to send)'}
            className="w-full bg-transparent border-0 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none resize-none py-1.5 min-h-[36px] max-h-[120px] disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className="p-2 rounded-lg bg-ghost-phosphor hover:bg-ghost-mint text-void-950 disabled:opacity-30 disabled:hover:bg-ghost-phosphor transition-all shrink-0 cursor-pointer shadow-ghost-glow"
            title="Send Message"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
