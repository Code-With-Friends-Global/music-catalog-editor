import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BulkReassignDialogProps {
  selectedTrackTitles: string[];
  albumOptions: string[];
  onConfirm: (destinationAlbumTitle: string) => void;
  onCancel: () => void;
}

export default function BulkReassignDialog({
  selectedTrackTitles,
  albumOptions,
  onConfirm,
  onCancel,
}: BulkReassignDialogProps) {
  const [destination, setDestination] = useState(albumOptions[0] ?? '');

  useEffect(() => {
    if (albumOptions.length > 0) {
      setDestination(albumOptions[0]);
    }
  }, [albumOptions]);

  const hasOptions = albumOptions.length > 0;
  const selectedList = selectedTrackTitles.length > 0 ? selectedTrackTitles : ['No tracks selected'];

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
    ) as HTMLElement[];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = elements.filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reassign selected tracks"
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-slate-900">Reassign selected tracks</h2>
        <p className="mt-2 text-sm text-slate-600">
          Updating {selectedTrackTitles.length} selected track(s). Choose a destination album.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,220px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-800">Selected tracks</h3>
            <ul className="mt-3 max-h-40 space-y-2 overflow-auto text-sm text-slate-700">
              {selectedList.map((title) => (
                <li key={title} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                  {title}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="destination-album">
              Destination album
            </label>
            <select
              id="destination-album"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            >
              {albumOptions.map((albumTitle) => (
                <option key={albumTitle} value={albumTitle}>
                  {albumTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasOptions}
            onClick={() => onConfirm(destination)}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
