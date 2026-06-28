import { validateAlbumNameRef, validateAIGenerationRatio, validateISRC, validatePositiveNumber, validateRequired } from '../catalog/validation';
import { EXPLICIT_FLAGS, MOOD_DESCRIPTORS, MUSIC_GENRES } from '../catalog/types';
import type { Album, Track } from '../catalog/types';
import { EditableCell } from './EditableCell';

interface TrackRowProps {
  track: Track;
  albums: Album[];
  isActive: boolean;
  isSelected: boolean;
  onToggleSelection: (selected: boolean) => void;
  onActivate: () => void;
  onCommit: (field: string, value: string) => void;
}

export default function TrackRow({
  track,
  albums,
  isActive,
  isSelected,
  onToggleSelection,
  onActivate,
  onCommit,
}: TrackRowProps) {
  const albumTitles = albums.map((album) => album.AlbumTitle);
  const validateAlbumName = (value: string) => {
    return validateRequired(value) || validateAlbumNameRef(value, albums);
  };

  return (
    <tr
      className={`border-b border-slate-200 transition hover:bg-slate-50 ${isActive ? 'bg-blue-50 ring-1 ring-blue-400' : ''}`}
      onClick={onActivate}
    >
      <td className="border border-slate-200 px-3 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(event) => onToggleSelection(event.target.checked)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select track ${track.TrackTitle}`}
        />
      </td>
      <EditableCell
        value={track.TrackTitle}
        rowId={track.id}
        fieldName="TrackTitle"
        type="text"
        validate={validateRequired}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.PrimaryArtist}
        rowId={track.id}
        fieldName="PrimaryArtist"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.FeaturedArtists}
        rowId={track.id}
        fieldName="FeaturedArtists"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.AlbumName}
        rowId={track.id}
        fieldName="AlbumName"
        type="dropdown"
        options={albumTitles}
        validate={validateAlbumName}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ReleaseYear}
        rowId={track.id}
        fieldName="ReleaseYear"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.GenreCluster}
        rowId={track.id}
        fieldName="GenreCluster"
        type="dropdown"
        options={MUSIC_GENRES}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.MoodSignature}
        rowId={track.id}
        fieldName="MoodSignature"
        type="dropdown"
        options={MOOD_DESCRIPTORS}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.TempoBPM}
        rowId={track.id}
        fieldName="TempoBPM"
        type="number"
        validate={validatePositiveNumber}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.EnergyLevel}
        rowId={track.id}
        fieldName="EnergyLevel"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ExplicitContentFlag}
        rowId={track.id}
        fieldName="ExplicitContentFlag"
        type="dropdown"
        options={EXPLICIT_FLAGS}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ProducerCredits}
        rowId={track.id}
        fieldName="ProducerCredits"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ComposerList}
        rowId={track.id}
        fieldName="ComposerList"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.MasteringEngineer}
        rowId={track.id}
        fieldName="MasteringEngineer"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.RecordingLocation}
        rowId={track.id}
        fieldName="RecordingLocation"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ISRCCode}
        rowId={track.id}
        fieldName="ISRCCode"
        type="text"
        validate={validateISRC}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.CoverArtPalette}
        rowId={track.id}
        fieldName="CoverArtPalette"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.PlaybackGain}
        rowId={track.id}
        fieldName="PlaybackGain"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.ListenerAtmosphere}
        rowId={track.id}
        fieldName="ListenerAtmosphere"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.GeoOrigin}
        rowId={track.id}
        fieldName="GeoOrigin"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.StreamingPriority}
        rowId={track.id}
        fieldName="StreamingPriority"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.WaveformFingerprint}
        rowId={track.id}
        fieldName="WaveformFingerprint"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.LyricLanguage}
        rowId={track.id}
        fieldName="LyricLanguage"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.VocalStyle}
        rowId={track.id}
        fieldName="VocalStyle"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.CopyrightHolder}
        rowId={track.id}
        fieldName="CopyrightHolder"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={track.AIGenerationRatio}
        rowId={track.id}
        fieldName="AIGenerationRatio"
        type="number"
        validate={validateAIGenerationRatio}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
    </tr>
  );
}
