import type { Album, CatalogState, Track, UndoEntry } from './types';

export type CatalogAction =
  | {
      type: 'SET_CELL';
      entityType: 'album' | 'track';
      entityId: string;
      field: string;
      value: string;
    }
  | { type: 'ADD_ALBUM' }
  | { type: 'ADD_ALBUM_WITH'; album: Partial<Album> }
  | { type: 'ADD_TRACK' }
  | { type: 'ADD_TRACK_WITH'; track: Partial<Track> }
  | { type: 'DELETE_ALBUM'; albumId: string }
  | { type: 'DELETE_TRACK'; trackId: string }
  | { type: 'BULK_REASSIGN'; destinationAlbumTitle: string }
  | { type: 'UNDO' }
  | { type: 'LOAD_CATALOG'; albums: Album[]; tracks: Track[] }
  | { type: 'SET_ACTIVE_ALBUM'; albumId: string | null }
  | { type: 'SET_ACTIVE_TRACK'; trackId: string | null }
  | { type: 'SET_SELECTED_TRACKS'; trackId: string; selected: boolean }
  | { type: 'SET_SPLIT_RATIO'; ratio: number };

const UNDO_STACK_LIMIT = 50;

export function generateId(): string {
  return crypto.randomUUID();
}

export const initialCatalogState: CatalogState = {
  albums: [],
  tracks: [],
  activeAlbumId: null,
  activeTrackId: null,
  selectedTrackIds: new Set<string>(),
  undoStack: [],
  splitRatio: 0.5,
};

export function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case 'SET_CELL': {
      const { entityType, entityId, field, value } = action;

      if (entityType === 'album') {
        const albumIndex = state.albums.findIndex((a) => a.id === entityId);
        if (albumIndex === -1) return state;

        const previousValue = ((state.albums[albumIndex] as unknown) as Record<string, string>)[field] ?? '';

        const undoEntry: UndoEntry = {
          type: 'cell_edit',
          entityType: 'album',
          entityId,
          field,
          previousValue,
        };

        const updatedAlbum = {
          ...state.albums[albumIndex],
          [field]: value,
        };

        const updatedAlbums = [
          ...state.albums.slice(0, albumIndex),
          updatedAlbum,
          ...state.albums.slice(albumIndex + 1),
        ];

        const newUndoStack = [undoEntry, ...state.undoStack].slice(0, UNDO_STACK_LIMIT);

        return { ...state, albums: updatedAlbums, undoStack: newUndoStack };
      }

      const trackIndex = state.tracks.findIndex((t) => t.id === entityId);
      if (trackIndex === -1) return state;

      const previousValue = ((state.tracks[trackIndex] as unknown) as Record<string, string>)[field] ?? '';

      const undoEntry: UndoEntry = {
        type: 'cell_edit',
        entityType: 'track',
        entityId,
        field,
        previousValue,
      };

      const updatedTrack = {
        ...state.tracks[trackIndex],
        [field]: value,
      };

      const updatedTracks = [
        ...state.tracks.slice(0, trackIndex),
        updatedTrack,
        ...state.tracks.slice(trackIndex + 1),
      ];

      const newUndoStack = [undoEntry, ...state.undoStack].slice(0, UNDO_STACK_LIMIT);
      return { ...state, tracks: updatedTracks, undoStack: newUndoStack };
    }

    case 'ADD_ALBUM': {
      const newAlbum: Album = {
        id: generateId(),
        AlbumTitle: '',
        AlbumArtist: '',
        ReleaseDate: '',
        RecordLabel: '',
        CatalogNumber: '',
        EditionType: '',
        DiscCount: '',
        TrackTotal: '',
        AlbumGenre: '',
        AlbumMood: '',
      };

      return { ...state, albums: [...state.albums, newAlbum], activeAlbumId: newAlbum.id };
    }

    case 'ADD_ALBUM_WITH': {
      const base = action.album || {};
      const newAlbum: Album = {
        id: generateId(),
        AlbumTitle: (base as any).AlbumTitle ?? '',
        AlbumArtist: (base as any).AlbumArtist ?? '',
        ReleaseDate: (base as any).ReleaseDate ?? '',
        RecordLabel: (base as any).RecordLabel ?? '',
        CatalogNumber: (base as any).CatalogNumber ?? '',
        EditionType: (base as any).EditionType ?? '',
        DiscCount: (base as any).DiscCount ?? '',
        TrackTotal: (base as any).TrackTotal ?? '',
        AlbumGenre: (base as any).AlbumGenre ?? '',
        AlbumMood: (base as any).AlbumMood ?? '',
      };

      return { ...state, albums: [...state.albums, newAlbum], activeAlbumId: newAlbum.id };
    }

    case 'ADD_TRACK': {
      let albumName = '';
      if (state.activeAlbumId !== null) {
        const activeAlbum = state.albums.find((a) => a.id === state.activeAlbumId);
        if (activeAlbum) albumName = activeAlbum.AlbumTitle;
      }

      const newTrack: Track = {
        id: generateId(),
        TrackTitle: '',
        PrimaryArtist: '',
        FeaturedArtists: '',
        AlbumName: albumName,
        ReleaseYear: '',
        GenreCluster: '',
        MoodSignature: '',
        TempoBPM: '',
        EnergyLevel: '',
        ExplicitContentFlag: '',
        ProducerCredits: '',
        ComposerList: '',
        MasteringEngineer: '',
        RecordingLocation: '',
        ISRCCode: '',
        CoverArtPalette: '',
        PlaybackGain: '',
        ListenerAtmosphere: '',
        GeoOrigin: '',
        StreamingPriority: '',
        WaveformFingerprint: '',
        LyricLanguage: '',
        VocalStyle: '',
        CopyrightHolder: '',
        AIGenerationRatio: '',
      };

      return { ...state, tracks: [...state.tracks, newTrack], activeTrackId: newTrack.id };
    }

    case 'ADD_TRACK_WITH': {
      const base = action.track || {};
      let albumName = (base as any).AlbumName ?? '';
      if (!albumName && state.activeAlbumId !== null) {
        const activeAlbum = state.albums.find((a) => a.id === state.activeAlbumId);
        if (activeAlbum) albumName = activeAlbum.AlbumTitle;
      }

      const newTrack: Track = {
        id: generateId(),
        TrackTitle: (base as any).TrackTitle ?? '',
        PrimaryArtist: (base as any).PrimaryArtist ?? '',
        FeaturedArtists: (base as any).FeaturedArtists ?? '',
        AlbumName: albumName,
        ReleaseYear: (base as any).ReleaseYear ?? '',
        GenreCluster: (base as any).GenreCluster ?? '',
        MoodSignature: (base as any).MoodSignature ?? '',
        TempoBPM: (base as any).TempoBPM ?? '',
        EnergyLevel: (base as any).EnergyLevel ?? '',
        ExplicitContentFlag: (base as any).ExplicitContentFlag ?? '',
        ProducerCredits: (base as any).ProducerCredits ?? '',
        ComposerList: (base as any).ComposerList ?? '',
        MasteringEngineer: (base as any).MasteringEngineer ?? '',
        RecordingLocation: (base as any).RecordingLocation ?? '',
        ISRCCode: (base as any).ISRCCode ?? '',
        CoverArtPalette: (base as any).CoverArtPalette ?? '',
        PlaybackGain: (base as any).PlaybackGain ?? '',
        ListenerAtmosphere: (base as any).ListenerAtmosphere ?? '',
        GeoOrigin: (base as any).GeoOrigin ?? '',
        StreamingPriority: (base as any).StreamingPriority ?? '',
        WaveformFingerprint: (base as any).WaveformFingerprint ?? '',
        LyricLanguage: (base as any).LyricLanguage ?? '',
        VocalStyle: (base as any).VocalStyle ?? '',
        CopyrightHolder: (base as any).CopyrightHolder ?? '',
        AIGenerationRatio: (base as any).AIGenerationRatio ?? '',
      };

      return { ...state, tracks: [...state.tracks, newTrack], activeTrackId: newTrack.id };
    }

    case 'DELETE_ALBUM':
      return { ...state, albums: state.albums.filter((a) => a.id !== action.albumId) };

    case 'DELETE_TRACK':
      return { ...state, tracks: state.tracks.filter((t) => t.id !== action.trackId) };

    case 'BULK_REASSIGN': {
      const updatedTracks = state.tracks.map((track) =>
        state.selectedTrackIds.has(track.id)
          ? { ...track, AlbumName: action.destinationAlbumTitle }
          : track,
      );
      return { ...state, tracks: updatedTracks, selectedTrackIds: new Set<string>() };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const [topEntry, ...remainingStack] = state.undoStack;
      const { entityType, entityId, field, previousValue } = topEntry;

      if (entityType === 'album') {
        const albumIndex = state.albums.findIndex((a) => a.id === entityId);
        if (albumIndex === -1) return { ...state, undoStack: remainingStack };
        const restoredAlbum = {
          ...state.albums[albumIndex],
          [field]: previousValue,
        };
        const updatedAlbums = [
          ...state.albums.slice(0, albumIndex),
          restoredAlbum,
          ...state.albums.slice(albumIndex + 1),
        ];
        return { ...state, albums: updatedAlbums, undoStack: remainingStack };
      }

      const trackIndex = state.tracks.findIndex((t) => t.id === entityId);
      if (trackIndex === -1) return { ...state, undoStack: remainingStack };
      const restoredTrack = {
        ...state.tracks[trackIndex],
        [field]: previousValue,
      };
      const updatedTracks = [
        ...state.tracks.slice(0, trackIndex),
        restoredTrack,
        ...state.tracks.slice(trackIndex + 1),
      ];
      return { ...state, tracks: updatedTracks, undoStack: remainingStack };
    }

    case 'LOAD_CATALOG':
      return {
        ...state,
        albums: action.albums,
        tracks: action.tracks,
      };

    case 'SET_ACTIVE_ALBUM':
      return { ...state, activeAlbumId: action.albumId };

    case 'SET_ACTIVE_TRACK':
      return { ...state, activeTrackId: action.trackId };

    case 'SET_SELECTED_TRACKS': {
      const selected = new Set(state.selectedTrackIds);
      if (action.selected) {
        selected.add(action.trackId);
      } else {
        selected.delete(action.trackId);
      }
      return { ...state, selectedTrackIds: selected };
    }

    case 'SET_SPLIT_RATIO':
      return { ...state, splitRatio: action.ratio };

    default:
      return state;
  }
}
