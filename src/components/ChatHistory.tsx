import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../catalog/types';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-3xl p-4 shadow-sm ${message.role === 'assistant' ? 'bg-slate-100 self-start' : 'bg-slate-900 text-white self-end'}`}
        >
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
            {message.role === 'assistant' ? 'Assistant' : 'You'}
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.content}</p>
          {message.gifEmbed && (
            <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">GIF</div>
              <img src={message.gifEmbed.url} alt={message.gifEmbed.title} className="mt-2 h-44 w-full rounded-2xl object-cover" />
              <p className="mt-2 text-sm text-slate-600">{message.gifEmbed.title}</p>
            </div>
          )}
        </div>
      ))}
      <div ref={anchorRef} />
    </div>
  );
}
