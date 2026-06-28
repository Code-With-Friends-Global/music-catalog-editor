import type { Album, Track } from '../catalog/types';
import TrackRow from './TrackRow';

interface TracksTableProps {
  tracks: Track[];
  albums: Album[];
  activeTrackId: string | null;
  selectedTrackIds: Set<string>;
  onToggleTrackSelection: (trackId: string, selected: boolean) => void;
  onSetActiveTrack: (trackId: string) => void;
  onCommitCell: (trackId: string, field: string, value: string) => void;
}

const HEADERS = [
  'Select',
  'TrackTitle',
  'PrimaryArtist',
  'FeaturedArtists',
  'AlbumName',
  'ReleaseYear',
  'GenreCluster',
  'MoodSignature',
  'TempoBPM',
  'EnergyLevel',
  'ExplicitContentFlag',
  'ProducerCredits',
  'ComposerList',
  'MasteringEngineer',
  'RecordingLocation',
  'ISRCCode',
  'CoverArtPalette',
  'PlaybackGain',
  'ListenerAtmosphere',
  'GeoOrigin',
  'StreamingPriority',
  'WaveformFingerprint',
  'LyricLanguage',
  'VocalStyle',
  'CopyrightHolder',
  'AIGenerationRatio',
];

export default function TracksTable({
  tracks,
  albums,
  activeTrackId,
  selectedTrackIds,
  onToggleTrackSelection,
  onSetActiveTrack,
  onCommitCell,
}: TracksTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        Tracks
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              {HEADERS.map((header) => (
                <th key={header} className="border-b border-slate-200 px-3 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                albums={albums}
                isActive={track.id === activeTrackId}
                isSelected={selectedTrackIds.has(track.id)}
                onToggleSelection={(selected) => onToggleTrackSelection(track.id, selected)}
                onActivate={() => onSetActiveTrack(track.id)}
                onCommit={(field, value) => onCommitCell(track.id, field, value)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
