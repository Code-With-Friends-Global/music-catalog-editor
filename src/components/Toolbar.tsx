import { useRef, useState } from 'react';
import type { Album, Track } from '../catalog/types';
import { exportCatalogToJSON, importCatalogFromJSON } from '../catalog/persistence';

interface ToolbarProps {
  albums: Album[];
  tracks: Track[];
  selectedCount: number;
  onAddAlbum: () => void;
  onAddTrack: () => void;
  onOpenReassign: () => void;
  onLoadCatalog: (albums: Album[], tracks: Track[]) => void;
}

export default function Toolbar({
  albums,
  tracks,
  selectedCount,
  onAddAlbum,
  onAddTrack,
  onOpenReassign,
  onLoadCatalog,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const json = exportCatalogToJSON(albums, tracks);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'catalog-export.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const result = importCatalogFromJSON(text);
    if ('error' in result) {
      setError(result.error);
      return;
    }

    const confirmed = window.confirm('This will replace your current catalog. Continue?');
    if (confirmed) {
      onLoadCatalog(result.data.albums, result.data.tracks);
    }
    event.target.value = '';
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddAlbum}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            aria-label="Add Album"
          >
            Add Album
          </button>
          <button
            type="button"
            onClick={onAddTrack}
            className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
            aria-label="Add Track"
          >
            Add Track
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            aria-label="Export catalog as JSON"
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            aria-label="Import catalog from JSON"
          >
            Import
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenReassign}
            disabled={selectedCount < 2}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Reassign selected tracks"
          >
            Reassign
          </button>
          <span className="text-sm text-slate-600">{selectedCount} track(s) selected</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
