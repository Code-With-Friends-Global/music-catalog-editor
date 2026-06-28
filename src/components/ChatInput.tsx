import { useId } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  isLoading: boolean;
  error?: string | null;
}

export default function ChatInput({ value, onChange, onSend, isLoading, error }: ChatInputProps) {
  const id = useId();

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <label htmlFor={`chat-input-${id}`} className="sr-only">
        Message
      </label>
      <textarea
        id={`chat-input-${id}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        className="w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-500"
        placeholder="Ask the assistant about your music catalog..."
      />
      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={isLoading}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Sending…' : 'Send'}
        </button>
        <span className="text-xs text-slate-500">Shift+Enter for newline</span>
      </div>
    </div>
  );
}
