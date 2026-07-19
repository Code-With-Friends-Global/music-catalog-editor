/**
 * ai-server.js — Express AI service for the Music Catalog Editor
 *
 * Runs on process.env.AI_SERVICE_PORT || 3001
 * Proxies chat requests to Google Gemini and serves curated music GIFs.
 *
 * Security:
 *  - Google credentials are read from process.env via ADC, GOOGLE_APPLICATION_CREDENTIALS, or GOOGLE_API_KEY.
 *  - Any request body containing credential fields like `openaiApiKey`, `googleApiKey`, or `apiKey` is rejected with HTTP 400.
 *  - No credentials are ever echoed in any response.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { JWT } from 'google-auth-library';
import { readFileSync } from 'node:fs';

dotenv.config();

const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_SCOPES = [
  'https://www.googleapis.com/auth/generative-language',
  'https://www.googleapis.com/auth/cloud-platform',
];
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://code-with-friends-global.github.io',
];
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json());

const MUSIC_GIFS = [
  { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Guitar Solo', tags: ['guitar', 'rock', 'solo', 'electric'] },
  { url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', title: 'Piano Playing', tags: ['piano', 'jazz', 'classical', 'keys'] },
  { url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif', title: 'Drum Kit', tags: ['drums', 'percussion', 'rock', 'beat'] },
  { url: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif', title: 'Vinyl Record Spinning', tags: ['vinyl', 'record', 'dj', 'spin', 'music'] },
  { url: 'https://media.giphy.com/media/3oEjHWpiVIOGXT5l9u/giphy.gif', title: 'Concert Crowd', tags: ['concert', 'crowd', 'live', 'festival', 'energy'] },
  { url: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif', title: 'Microphone Performance', tags: ['microphone', 'vocal', 'singer', 'performance', 'pop'] },
  { url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif', title: 'Bass Guitar', tags: ['bass', 'guitar', 'funk', 'groove', 'rock'] },
  { url: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif', title: 'Saxophone Jazz', tags: ['saxophone', 'jazz', 'sax', 'blues', 'smooth'] },
  { url: 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', title: 'Turntable DJ', tags: ['dj', 'turntable', 'hip-hop', 'rap', 'electronic', 'mix'] },
  { url: 'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif', title: 'Music Notes', tags: ['notes', 'music', 'melody', 'compose', 'sheet'] },
  { url: 'https://media.giphy.com/media/l0HlCqCqFMkQGmgFO/giphy.gif', title: 'Headphones Listening', tags: ['headphones', 'listening', 'chill', 'relax', 'ambient'] },
  { url: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif', title: 'Stage Lights', tags: ['stage', 'lights', 'concert', 'show', 'performance', 'pop', 'rock'] },
];

async function getGoogleAuthHeaders() {
  if (process.env.GOOGLE_API_KEY?.trim()) {
    return { queryString: `?key=${encodeURIComponent(process.env.GOOGLE_API_KEY.trim())}` };
  }

  const scopes = GEMINI_SCOPES;

  let credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  if (!credentialsJson && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      credentialsJson = readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
    } catch (err) {
      console.warn('Unable to read GOOGLE_APPLICATION_CREDENTIALS:', err?.message ?? err);
    }
  }

  if (!credentialsJson) {
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
    const secretName = process.env.GOOGLE_SERVICE_ACCOUNT_SECRET_NAME || 'gemini-service-account-key';
    const secretProject = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
    try {
      const { stdout } = await execFileAsync('gcloud', ['secrets', 'versions', 'access', 'latest', '--secret=' + secretName, '--project=' + secretProject], { timeout: 60000 });
      credentialsJson = stdout.trim();
    } catch (err) {
      console.warn('Unable to read service account credentials from Secret Manager:', err?.message ?? err);
    }
  }

  if (credentialsJson) {
    const credentials = JSON.parse(credentialsJson);
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes,
    });

    const accessToken = await client.getAccessToken();
    const token = typeof accessToken === 'string' ? accessToken : accessToken?.token;
    if (!token) {
      throw new Error('Failed to obtain Google Cloud access token from JWT client.');
    }

    const billingProject = process.env.GOOGLE_BILLING_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT_ID;
    return { authorization: `Bearer ${token}`, project: billingProject };
  }

  try {
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
    const args = ['auth', 'print-access-token'];
    if (project) {
      args.push('--project', project);
    }
    const { stdout } = await execFileAsync('gcloud', args, { timeout: 30000 });
    const token = stdout.trim();
    if (token) {
      return { authorization: `Bearer ${token}`, project };
    }
  } catch (err) {
    console.warn('gcloud CLI token fallback failed:', err?.message ?? err);
  }

  throw new Error('No Google authentication credentials were available. Set GOOGLE_API_KEY, GOOGLE_SERVICE_ACCOUNT_KEY_JSON, or run gcloud auth login/application-default login.');
}

function buildConversationPrompt(messages) {
  return messages
    .map((message) => {
      const role = message.role === 'assistant' ? 'Assistant' : message.role === 'user' ? 'User' : 'System';
      return `${role}: ${message.content}`;
    })
    .join('\n');
}

app.post('/api/chat', async (req, res) => {
  if (req.body && (Object.prototype.hasOwnProperty.call(req.body, 'openaiApiKey') || Object.prototype.hasOwnProperty.call(req.body, 'googleApiKey') || Object.prototype.hasOwnProperty.call(req.body, 'apiKey'))) {
    return res.status(400).json({
      error: 'Supplying or overriding API credentials via the request body is not permitted.',
    });
  }

  const { messages, catalogContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  const systemPrompt = buildSystemPrompt(catalogContext);
  const promptText = buildConversationPrompt([{ role: 'system', content: systemPrompt }, ...messages]);

  try {
    const authHeaders = await getGoogleAuthHeaders();
      const modelsToTry = [DEFAULT_GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.0-flash-lite-001', 'gemini-2.0-flash-001'];
    let completion = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        let url = `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent`;
        const headers = { 'Content-Type': 'application/json' };
        if (authHeaders.authorization) {
          headers.Authorization = authHeaders.authorization;
          if (authHeaders.project) {
            headers['X-Goog-User-Project'] = authHeaders.project;
          }
        }
        if (authHeaders.queryString) {
          url += authHeaders.queryString;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        });

        const body = await response.json();
        // If billing/prepay exhausted, return a safe canned reply so UI stays usable
        const isBillingError = response.status === 429 || body?.error?.status === 'RESOURCE_EXHAUSTED' || (body?.error?.message && /prepayment credits|prepay|RESOURCE_EXHAUSTED/i.test(body.error.message));
        if (isBillingError) {
          const canned = {
            candidates: [
              { content: { parts: [{ text: 'The AI service is temporarily unavailable due to billing or quota limits. I can still help with basic questions: hello — how can I assist with your music catalog?' }] } },
            ],
          };
          completion = canned;
          break;
        }
        if (!response.ok) {
          throw new Error(body.error?.message || JSON.stringify(body));
        }

        if (body?.candidates?.length > 0) {
          completion = body;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${model} failed:`, err?.message ?? err);
      }
    }

    if (!completion) {
      console.error('All Gemini model attempts failed:', lastError?.message ?? lastError);
      return res.status(502).json({ error: lastError?.message || 'All Gemini model attempts failed' });
    }

    const replyContent = completion.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') ?? '';
    const { triggerGif, gifQuery } = detectGifTrigger(replyContent, messages);
    return res.json({ reply: replyContent, triggerGif, gifQuery });
  } catch (err) {
    console.error('Gemini error:', err?.message ?? err);
    return res.status(502).json({ error: err?.message ?? 'The AI service encountered an error. Please try again.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/gif', (req, res) => {
  const query = (req.query.q ?? '').toLowerCase().trim();
  let candidates = [];

  if (query) {
    const queryWords = query.split(/\s+/);
    candidates = MUSIC_GIFS.filter((gif) =>
      queryWords.some((word) => gif.tags.some((tag) => tag.includes(word) || word.includes(tag))),
    );
  }

  if (candidates.length === 0) {
    candidates = MUSIC_GIFS;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return res.json({ url: chosen.url, title: chosen.title });
});

function buildSystemPrompt(catalogContext) {
  const contextSection = catalogContext
    ? `\n\n## Current Catalog Context\n${JSON.stringify(catalogContext, null, 2)}`
    : '';

  return `You are a friendly, encouraging, and knowledgeable music catalog assistant. ` +
    `You have deep expertise in music history, genres, production techniques, and metadata standards ` +
    `(including ISRC codes, BPM, and catalog numbering conventions). ` +
    `Your goal is to help the user fill out their music catalog accurately and completely.\n\n` +
    `## Album Fields\n` +
    `- AlbumTitle (string, required): The full title of the album.\n` +
    `- AlbumArtist (string, required): The primary artist or band name.\n` +
    `- ReleaseDate (string, YYYY-MM-DD): Official release date.\n` +
    `- RecordLabel (string): The record label that released the album.\n` +
    `- CatalogNumber (string, required, unique): The label's catalog identifier (e.g., DGC-24425).\n` +
    `- EditionType (enum): One of Standard | Deluxe | Limited | Remastered | Box Set.\n` +
    `- DiscCount (positive integer): Number of discs in the release.\n` +
    `- TrackTotal (positive integer): Total number of tracks.\n` +
    `- AlbumGenre (enum): Music genre from the predefined list.\n` +
    `- AlbumMood (enum): Mood descriptor from the predefined list.\n\n` +
    `## Track Fields\n` +
    `- TrackTitle (string, required): The title of the track.\n` +
    `- PrimaryArtist (string): The primary performing artist.\n` +
    `- FeaturedArtists (string): Any featured artists (comma-separated).\n` +
    `- AlbumName (string, required): Must match an existing AlbumTitle.\n` +
    `- ReleaseYear (string, YYYY): Year the track was released.\n` +
    `- GenreCluster (enum): Music genre from the predefined list.\n` +
    `- MoodSignature (enum): Mood descriptor from the predefined list.\n` +
    `- TempoBPM (positive number): Beats per minute.\n` +
    `- EnergyLevel (string): Subjective energy descriptor.\n` +
    `- ExplicitContentFlag (enum): Clean | Explicit.\n` +
    `- ProducerCredits (string): Producer name(s).\n` +
    `- ComposerList (string): Composer name(s).\n` +
    `- MasteringEngineer (string): Mastering engineer name.\n` +
    `- RecordingLocation (string): Studio or location where recorded.\n` +
    `- ISRCCode (string, format CC-XXX-YY-NNNNN): International Standard Recording Code.\n` +
    `- CoverArtPalette (string): Dominant colors in the cover art.\n` +
    `- PlaybackGain (string): Replay gain value.\n` +
    `- ListenerAtmosphere (string): Suggested listening environment.\n` +
    `- GeoOrigin (string): Geographic origin of the track.\n` +
    `- StreamingPriority (string): Priority tier for streaming platforms.\n` +
    `- WaveformFingerprint (string): Audio fingerprint identifier.\n` +
    `- LyricLanguage (string): Language of the lyrics.\n` +
    `- VocalStyle (string): Vocal style descriptor.\n` +
    `- CopyrightHolder (string): Copyright owner.\n` +
    `- AIGenerationRatio (number, 0–100): Percentage of AI-generated content.\n\n` +
    `## Behavior Guidelines\n` +
    `- Be warm, concise, and encouraging.\n` +
    `- When the user completes an album or adds a notable track, celebrate the milestone.\n` +
    `- When referencing a famous artist or album, feel free to share an interesting fact.\n` +
    `- If you detect a contextually exciting moment (completing an album, adding a famous track, ` +
    `referencing a legendary artist), include the text [TRIGGER_GIF:<keyword>] at the end of your ` +
    `response, where <keyword> is a relevant music term (e.g., guitar, jazz, concert, vinyl).\n` +
    `- Never reveal or reference any API keys or server configuration.${contextSection}`;
}

function detectGifTrigger(replyContent, _messages) {
  const match = replyContent.match(/\[TRIGGER_GIF:([^\]]+)\]/i);
  if (match) {
    return { triggerGif: true, gifQuery: match[1].trim() };
  }
  return { triggerGif: false, gifQuery: null };
}

app.listen(PORT, () => {
  console.log(`🎵 Music Catalog AI service running on port ${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   GET  http://localhost:${PORT}/api/gif?q=<query>`);
});
