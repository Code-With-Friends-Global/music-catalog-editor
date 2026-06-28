import { useMemo, useState } from 'react';
import { useCatalog } from '../catalog/CatalogContext';
import type { ChatMessage as ChatMessageType, GifEmbed } from '../catalog/types';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { sendChatMessage, fetchGif } from '../services/aiService';
import { MOCK_ALBUMS, MOCK_TRACKS } from '../catalog/mockData';

export default function ChatPanel() {
  const { state, dispatch } = useCatalog();
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Hi there! I can help you organize your music catalog and answer questions about album metadata.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalogContext = useMemo(
    () => ({ albums: state.albums, tracks: state.tracks }),
    [state.albums, state.tracks],
  );

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        [{ role: 'user', content: trimmed }],
        catalogContext,
      );

      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
      };

      if (/add.*mock\s+album/i.test(trimmed) || /add.*mock\s+track/i.test(trimmed) || /mock\s+album/i.test(trimmed)) {
        const albumPayload = { ...MOCK_ALBUMS[0] };
        const trackPayload = { ...MOCK_TRACKS[0] };

        dispatch({ type: 'ADD_ALBUM_WITH', album: albumPayload });
        dispatch({ type: 'ADD_TRACK_WITH', track: trackPayload });

        assistantMessage.content = `${response.reply}\n\nI also added the mock album "${albumPayload.AlbumTitle}" and mock track "${trackPayload.TrackTitle}" to your catalog.`;
      }

      if (response.triggerGif && response.gifQuery) {
        const gif = await fetchGif(response.gifQuery);
        assistantMessage.gifEmbed = gif as GifEmbed;
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The assistant is unavailable right now. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="mt-1 text-sm text-slate-400">Ask for help with album metadata, track details, or catalog validation.</p>
      </div>
      <div className="flex h-full flex-col sm:flex-row">
        <div className="flex-1 border-r border-slate-800 sm:max-w-[48%]">
          <ChatHistory messages={messages} />
        </div>
        <div className="flex w-full flex-col justify-between bg-slate-950 sm:w-[52%]">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
