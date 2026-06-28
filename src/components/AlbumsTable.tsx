import type { Album } from '../catalog/types';
import AlbumRow from './AlbumRow';

interface AlbumsTableProps {
  albums: Album[];
  activeAlbumId: string | null;
  onSetActiveAlbum: (albumId: string | null) => void;
  onCommitCell: (albumId: string, field: string, value: string) => void;
}

const HEADERS = [
  'AlbumTitle',
  'AlbumArtist',
  'ReleaseDate',
  'RecordLabel',
  'CatalogNumber',
  'EditionType',
  'DiscCount',
  'TrackTotal',
  'AlbumGenre',
  'AlbumMood',
];

export default function AlbumsTable({
  albums,
  activeAlbumId,
  onSetActiveAlbum,
  onCommitCell,
}: AlbumsTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        Albums
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
            {albums.map((album) => (
              <AlbumRow
                key={album.id}
                album={album}
                isActive={album.id === activeAlbumId}
                albums={albums}
                onActivate={() => onSetActiveAlbum(album.id)}
                onCommit={(field, value) => onCommitCell(album.id, field, value)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
