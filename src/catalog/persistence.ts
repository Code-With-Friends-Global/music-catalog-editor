import type { Album, Track, PersistedCatalog } from './types';

const CATALOG_KEY = 'music-catalog-editor';
const SPLIT_KEY = 'music-catalog-editor-split';

const SPLIT_MIN = 0.15;
const SPLIT_MAX = 0.85;

export function saveCatalogToStorage(albums: Album[], tracks: Track[]): void {
  try {
    const payload: PersistedCatalog = { version: 1, albums, tracks };
    localStorage.setItem(CATALOG_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[persistence] Failed to save catalog to localStorage:', err);
  }
}

export function loadCatalogFromStorage(): PersistedCatalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);

    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.albums) ||
      !Array.isArray(parsed.tracks)
    ) {
      return null;
    }

    return { version: 1, albums: parsed.albums, tracks: parsed.tracks };
  } catch {
    return null;
  }
}

export function saveSplitRatioToStorage(ratio: number): void {
  try {
    localStorage.setItem(SPLIT_KEY, JSON.stringify(ratio));
  } catch (err) {
    console.error('[persistence] Failed to save split ratio to localStorage:', err);
  }
}

export function loadSplitRatioFromStorage(): number | null {
  try {
    const raw = localStorage.getItem(SPLIT_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'number' || !isFinite(parsed)) return null;

    return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, parsed));
  } catch {
    return null;
  }
}

export function exportCatalogToJSON(albums: Album[], tracks: Track[]): string {
  return JSON.stringify({ version: 1, albums, tracks }, null, 2);
}

export function importCatalogFromJSON(json: string): { data: PersistedCatalog } | { error: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return { error: 'Invalid file: not valid JSON.' };
  }

  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as Record<string, unknown>).albums)
  ) {
    return { error: "Invalid catalog: missing required field 'albums'." };
  }

  if (!Array.isArray((parsed as Record<string, unknown>).tracks)) {
    return { error: "Invalid catalog: missing required field 'tracks'." };
  }

  const p = parsed as Record<string, unknown>;
  return {
    data: {
      version: 1,
      albums: p.albums as Album[],
      tracks: p.tracks as Track[],
    },
  };
}
