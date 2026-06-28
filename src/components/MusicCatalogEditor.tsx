import { useMemo, useState } from 'react';
import { CatalogProvider, useCatalog } from '../catalog/CatalogContext';
import AlbumsTable from './AlbumsTable';
import TracksTable from './TracksTable';
import Toolbar from './Toolbar';
import SplitPane from './SplitPane';
import BulkReassignDialog from './BulkReassignDialog';
import ChatPanel from './ChatPanel';

function MusicCatalogEditorContent() {
  const { state, dispatch } = useCatalog();
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const selectedTracks = useMemo(
    () => state.tracks.filter((track) => state.selectedTrackIds.has(track.id)),
    [state.tracks, state.selectedTrackIds],
  );

  const albumTitles = useMemo(
    () => state.albums.map((album) => album.AlbumTitle),
    [state.albums],
  );

  const handleConfirmReassign = (destinationAlbumTitle: string) => {
    dispatch({ type: 'BULK_REASSIGN', destinationAlbumTitle });
    setIsBulkDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <header className="mb-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Music Catalog Editor</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Catalog, tracks, and AI assistant</h1>
            </div>
            <div className="space-x-2 text-sm text-slate-600">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">Albums: {state.albums.length}</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">Tracks: {state.tracks.length}</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">Selected: {state.selectedTrackIds.size}</span>
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-136px)] rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <SplitPane
            initialRatio={state.splitRatio}
            onRatioChange={(ratio) => dispatch({ type: 'SET_SPLIT_RATIO', ratio })}
            topContent={
              <div className="h-full px-6 py-5">
                <Toolbar
                  albums={state.albums}
                  tracks={state.tracks}
                  selectedCount={state.selectedTrackIds.size}
                  onAddAlbum={() => dispatch({ type: 'ADD_ALBUM' })}
                  onAddTrack={() => dispatch({ type: 'ADD_TRACK' })}
                  onOpenReassign={() => setIsBulkDialogOpen(true)}
                  onLoadCatalog={(albums, tracks) => dispatch({ type: 'LOAD_CATALOG', albums, tracks })}
                />

                <div className="space-y-6 pt-5">
                  <AlbumsTable
                    albums={state.albums}
                    activeAlbumId={state.activeAlbumId}
                    onSetActiveAlbum={(albumId) => dispatch({ type: 'SET_ACTIVE_ALBUM', albumId })}
                    onCommitCell={(entityId, field, value) =>
                      dispatch({ type: 'SET_CELL', entityType: 'album', entityId, field, value })
                    }
                  />

                  <TracksTable
                    tracks={state.tracks}
                    albums={state.albums}
                    activeTrackId={state.activeTrackId}
                    selectedTrackIds={state.selectedTrackIds}
                    onToggleTrackSelection={(trackId, selected) =>
                      dispatch({ type: 'SET_SELECTED_TRACKS', trackId, selected })
                    }
                    onSetActiveTrack={(trackId) => dispatch({ type: 'SET_ACTIVE_TRACK', trackId })}
                    onCommitCell={(entityId, field, value) =>
                      dispatch({ type: 'SET_CELL', entityType: 'track', entityId, field, value })
                    }
                  />
                </div>
              </div>
            }
            bottomContent={<ChatPanel />}
          />
        </div>
      </div>

      {isBulkDialogOpen && (
        <BulkReassignDialog
          selectedTrackTitles={selectedTracks.map((track) => track.TrackTitle)}
          albumOptions={albumTitles}
          onConfirm={handleConfirmReassign}
          onCancel={() => setIsBulkDialogOpen(false)}
        />
      )}
    </div>
  );
}

export default function MusicCatalogEditor() {
  return (
    <CatalogProvider>
      <MusicCatalogEditorContent />
    </CatalogProvider>
  );
}
