import type { Album } from './types';

export function validateRequired(v: string): string | null {
  if (v.trim() === '') {
    return 'This field is required.';
  }
  return null;
}

export function validatePositiveInteger(v: string): string | null {
  if (!/^\d+$/.test(v) || parseInt(v, 10) < 1) {
    return 'Must be a positive integer (e.g. 1, 2, 3).';
  }
  return null;
}

export function validatePositiveNumber(v: string): string | null {
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0 || !isFinite(n)) {
    return 'Must be a positive number greater than zero.';
  }
  return null;
}

export function validateAIGenerationRatio(v: string): string | null {
  const n = parseFloat(v);
  if (isNaN(n) || n < 0 || n > 100) {
    return 'AI Generation Ratio must be a number between 0 and 100.';
  }
  return null;
}

export function validateISRC(v: string): string | null {
  if (!/^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/.test(v)) {
    return 'ISRC must match the format CC-XXX-YY-NNNNN (e.g. US-DGC-91-00001).';
  }
  return null;
}

export function validateAlbumNameRef(v: string, albums: Array<Pick<Album, 'AlbumTitle'>>): string | null {
  if (!albums.some((a) => a.AlbumTitle === v)) {
    return `"${v}" does not match any existing album title.`;
  }
  return null;
}

export function validateCatalogNumberUnique(
  v: string,
  albums: Array<Pick<Album, 'id' | 'CatalogNumber'>>,
  excludeId?: string,
): string | null {
  const conflict = albums.some(
    (a) => a.CatalogNumber === v && a.id !== excludeId,
  );
  if (conflict) {
    return `Catalog number "${v}" is already used by another album.`;
  }
  return null;
}
