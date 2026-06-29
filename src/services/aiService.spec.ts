import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendChatMessage } from './aiService';

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends the message "hello" to the local AI service', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Hello there!', triggerGif: false, gifQuery: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await sendChatMessage([{ role: 'user', content: 'hello' }], { albums: [], tracks: [] });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/http:\/\/localhost:3001\/api\/chat/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"content":"hello"'),
      }),
    );
    expect(result.reply).toBe('Hello there!');
  });
});
