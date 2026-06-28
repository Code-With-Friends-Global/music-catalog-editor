import { validateCatalogNumberUnique, validatePositiveInteger } from '../catalog/validation';
import { EDITION_TYPES } from '../catalog/types';
import type { Album } from '../catalog/types';
import { EditableCell } from './EditableCell';

interface AlbumRowProps {
  album: Album;
  albums: Album[];
  isActive: boolean;
  onActivate: () => void;
  onCommit: (field: string, value: string) => void;
}

const SELECTED_OPTIONS = EDITION_TYPES;

export default function AlbumRow({
  album,
  albums,
  isActive,
  onActivate,
  onCommit,
}: AlbumRowProps) {
  return (
    <tr
      className={`border-b border-slate-200 transition hover:bg-slate-50 ${isActive ? 'bg-blue-50 ring-1 ring-blue-400' : ''}`}
      onClick={onActivate}
    >
      <EditableCell
        value={album.AlbumTitle}
        rowId={album.id}
        fieldName="AlbumTitle"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.AlbumArtist}
        rowId={album.id}
        fieldName="AlbumArtist"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.ReleaseDate}
        rowId={album.id}
        fieldName="ReleaseDate"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.RecordLabel}
        rowId={album.id}
        fieldName="RecordLabel"
        type="text"
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.CatalogNumber}
        rowId={album.id}
        fieldName="CatalogNumber"
        type="text"
        validate={(value) => validateCatalogNumberUnique(value, albums, album.id)}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.EditionType}
        rowId={album.id}
        fieldName="EditionType"
        type="dropdown"
        options={SELECTED_OPTIONS}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.DiscCount}
        rowId={album.id}
        fieldName="DiscCount"
        type="number"
        validate={validatePositiveInteger}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.TrackTotal}
        rowId={album.id}
        fieldName="TrackTotal"
        type="number"
        validate={validatePositiveInteger}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.AlbumGenre}
        rowId={album.id}
        fieldName="AlbumGenre"
        type="dropdown"
        options={['Alternative', 'Blues', 'Classical', 'Country', 'Electronic', 'Folk', 'Hip-Hop', 'Jazz', 'Latin', 'Metal', 'Pop', 'Punk', 'R&B / Soul', 'Reggae', 'Rock', 'World']}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
      <EditableCell
        value={album.AlbumMood}
        rowId={album.id}
        fieldName="AlbumMood"
        type="dropdown"
        options={['Aggressive', 'Calm', 'Dark', 'Dreamy', 'Energetic', 'Happy', 'Melancholic', 'Nostalgic', 'Romantic', 'Tense', 'Uplifting', 'Whimsical']}
        validate={undefined}
        onCommit={(_, field, value) => onCommit(field, value)}
        isActive={isActive}
      />
    </tr>
  );
}
