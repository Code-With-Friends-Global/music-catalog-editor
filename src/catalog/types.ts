export type EditionType = 'Standard' | 'Deluxe' | 'Limited' | 'Remastered' | 'Box Set';
export type ExplicitFlag = 'Clean' | 'Explicit';

export interface Album {
  id: string;
  AlbumTitle: string;
  AlbumArtist: string;
  ReleaseDate: string;
  RecordLabel: string;
  CatalogNumber: string;
  EditionType: EditionType | '';
  DiscCount: string;
  TrackTotal: string;
  AlbumGenre: string;
  AlbumMood: string;
}

export interface Track {
  id: string;
  TrackTitle: string;
  PrimaryArtist: string;
  FeaturedArtists: string;
  AlbumName: string;
  ReleaseYear: string;
  GenreCluster: string;
  MoodSignature: string;
  TempoBPM: string;
  EnergyLevel: string;
  ExplicitContentFlag: ExplicitFlag | '';
  ProducerCredits: string;
  ComposerList: string;
  MasteringEngineer: string;
  RecordingLocation: string;
  ISRCCode: string;
  CoverArtPalette: string;
  PlaybackGain: string;
  ListenerAtmosphere: string;
  GeoOrigin: string;
  StreamingPriority: string;
  WaveformFingerprint: string;
  LyricLanguage: string;
  VocalStyle: string;
  CopyrightHolder: string;
  AIGenerationRatio: string;
}

export interface UndoEntry {
  type: 'cell_edit';
  entityType: 'album' | 'track';
  entityId: string;
  field: string;
  previousValue: string;
}

export interface GifEmbed {
  url: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  gifEmbed?: GifEmbed;
}

export interface CatalogState {
  albums: Album[];
  tracks: Track[];
  activeAlbumId: string | null;
  activeTrackId: string | null;
  selectedTrackIds: Set<string>;
  undoStack: UndoEntry[];
  splitRatio: number;
}

export interface PersistedCatalog {
  version: 1;
  albums: Album[];
  tracks: Track[];
}

export const MUSIC_GENRES = [
  'Alternative', 'Blues', 'Classical', 'Country', 'Electronic',
  'Folk', 'Hip-Hop', 'Jazz', 'Latin', 'Metal', 'Pop', 'Punk',
  'R&B / Soul', 'Reggae', 'Rock', 'World',
] as const;

export const MOOD_DESCRIPTORS = [
  'Aggressive', 'Calm', 'Dark', 'Dreamy', 'Energetic',
  'Happy', 'Melancholic', 'Nostalgic', 'Romantic', 'Tense',
  'Uplifting', 'Whimsical',
] as const;

export const EDITION_TYPES: EditionType[] = [
  'Standard', 'Deluxe', 'Limited', 'Remastered', 'Box Set',
];

export const EXPLICIT_FLAGS: ExplicitFlag[] = ['Clean', 'Explicit'];
