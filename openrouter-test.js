import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const CACHE_FILE = path.resolve(process.cwd(), '.openrouter-cache.json');
const STARTING_BUDGET = 4000;

if (!openRouterApiKey) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
}

async function readCache() {
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      remainingBudget: Number.isFinite(parsed?.remainingBudget)
        ? Math.max(0, Number(parsed.remainingBudget))
        : STARTING_BUDGET,
      prompts: typeof parsed?.prompts === 'object' && parsed.prompts !== null
        ? parsed.prompts
        : {},
    };
  } catch {
    return { remainingBudget: STARTING_BUDGET, prompts: {} };
  }
}

async function writeCache(cache) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function parseAffordableTokenLimit(errorBody) {
  const message = String(errorBody?.error?.message || '');
  const nestedMessage = String(errorBody?.error?.metadata?.previous_errors?.[0]?.message || '');
  const source = `${message}\n${nestedMessage}`;
  const match = source.match(/can only afford\s+(\d+)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

const prompt = process.argv.slice(2).join(' ').trim() || 'What is the meaning of life?';
const cache = await readCache();

if (cache.prompts[prompt]) {
  console.log(
    JSON.stringify(
      {
        source: 'cache',
        prompt,
        remainingBudget: cache.remainingBudget,
        cachedAt: cache.prompts[prompt].cachedAt,
        response: cache.prompts[prompt].response,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (cache.remainingBudget <= 0) {
  throw new Error('Token budget exhausted (remainingBudget=0).');
}

let maxTokens = cache.remainingBudget;
let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${openRouterApiKey}`,
    'HTTP-Referer': '<YOUR_SITE_URL>',
    'X-Title': '<YOUR_SITE_NAME>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  }),
});

let body = await response.json();
if (!response.ok) {
  const affordableTokens = parseAffordableTokenLimit(body);
  if (response.status === 402 && affordableTokens && affordableTokens > 0 && affordableTokens < maxTokens) {
    maxTokens = affordableTokens;
    cache.remainingBudget = Math.min(cache.remainingBudget, affordableTokens);
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': '<YOUR_SITE_URL>',
        'X-Title': '<YOUR_SITE_NAME>',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
    body = await response.json();
  }
}

if (!response.ok) {
  throw new Error(`OpenRouter request failed: ${response.status} ${JSON.stringify(body)}`);
}

const tokensUsed = Number(body?.usage?.total_tokens ?? body?.usage?.completion_tokens ?? 0);
cache.remainingBudget = Math.max(0, cache.remainingBudget - Math.max(0, tokensUsed));
cache.prompts[prompt] = {
  cachedAt: new Date().toISOString(),
  tokensUsed,
  maxTokens,
  response: body,
};

await writeCache(cache);

console.log(
  JSON.stringify(
    {
      source: 'live',
      prompt,
      maxTokens,
      tokensUsed,
      remainingBudget: cache.remainingBudget,
      response: body,
    },
    null,
    2,
  ),
);