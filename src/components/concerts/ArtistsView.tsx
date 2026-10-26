import React, { useState } from 'react';
import {
  Mic2,
  Users,
  Search,
  Plus,
  Sparkles,
  ExternalLink,
  MapPin,
  Headphones,
  CheckCircle2,
  Trash2,
  FileText,
  Music,
  X,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import type { Artist } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { Table, type Column } from '../common/Table';
import { CreateArtistModal } from './CreateArtistModal';

interface ArtistsViewProps {
  artists: Artist[];
  onAddArtist: (artist: Omit<Artist, 'id'>) => void;
  onDeleteArtist?: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const GENRE_FILTERS = [
  'All Genres',
  'EDM',
  'Bollywood',
  'Rock',
  'Punjabi',
  'Pop',
  'Hip-Hop',
  'Indie'
];

export const ArtistsView: React.FC<ArtistsViewProps> = ({
  artists,
  onAddArtist,
  onDeleteArtist,
  onShowToast
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRiderArtist, setSelectedRiderArtist] = useState<Artist | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [artistsPage, setArtistsPage] = useState(1);
  const [artistsPageSize, setArtistsPageSize] = useState(8);

  // Filtered artists
  const filteredArtists = artists.filter((artist) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      artist.name.toLowerCase().includes(q) ||
      (artist.stageName && artist.stageName.toLowerCase().includes(q)) ||
      artist.city?.toLowerCase().includes(q) ||
      artist.country.toLowerCase().includes(q) ||
      artist.management?.agency?.toLowerCase().includes(q) ||
      artist.subGenres?.some(sg => sg.toLowerCase().includes(q));

    const matchesGenre =
      selectedGenre === 'All Genres' ||
      artist.genre.toLowerCase() === selectedGenre.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' || artist.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Calculate metrics
  const totalHeadliners = artists.length;
  const touringCount = artists.filter((a) => a.status === 'touring').length;
  const availableCount = artists.filter((a) => a.status === 'available').length;
  const totalUpcomingShows = artists.reduce((acc, a) => acc + (a.upcomingConcerts || 0), 0);

  const handleDelete = (id: string, name: string) => {
    if (onDeleteArtist) {
      onDeleteArtist(id);
      onShowToast(`Artist "${name}" removed from roster.`);
    }
  };

  // Columns for Table View
  const artistColumns: Column<Artist>[] = [
    {
      key: 'artist',
      header: 'Artist / Headliner',
      render: (artist) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            </div>
            {artist.verified && (
              <div
                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-white shadow-2xs"
                title="Verified Concert Headliner"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 text-xs block truncate" title={artist.name}>
              {artist.name}
            </span>
            {artist.stageName && (
              <span className="text-[11px] text-slate-400 block truncate">
                {artist.stageName}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'genre',
      header: 'Genre & Style',
      className: 'whitespace-nowrap',
      render: (artist) => (
        <div className="space-y-1">
          <span className="inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
            {artist.genre}
          </span>
          {artist.subGenres && artist.subGenres.length > 0 && (
            <div className="flex items-center gap-1">
              {artist.subGenres.slice(0, 2).map((sg, i) => (
                <span
                  key={i}
                  className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium"
                >
                  {sg}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location & Agency',
      render: (artist) => (
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {artist.city ? `${artist.city}, ` : ''}{artist.country}
            </span>
          </div>
          {artist.management?.agency && (
            <div className="text-[11px] text-slate-400 truncate mt-0.5 pl-4">
              {artist.management.agency.split('/')[0]}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Tour Status',
      className: 'whitespace-nowrap',
      render: (artist) => {
        const isTouring = artist.status === 'touring';
        const isAvailable = artist.status === 'available';
        const isActive = artist.status === 'active';
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-2xs ${isTouring
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isAvailable
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : isActive
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isTouring
                  ? 'bg-emerald-500 animate-pulse'
                  : isAvailable
                    ? 'bg-blue-500'
                    : isActive
                      ? 'bg-purple-500'
                      : 'bg-slate-400'
                }`}
            />
            {isTouring
              ? 'On World Tour'
              : isAvailable
                ? 'Booking Available'
                : isActive
                  ? 'Roster Active'
                  : 'On Hiatus'}
          </span>
        );
      }
    },
    {
      key: 'listeners',
      header: 'Monthly Listeners',
      className: 'whitespace-nowrap',
      render: (artist) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Headphones className="h-3.5 w-3.5 text-emerald-500" />
            <span>{artist.monthlyListeners || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            {artist.socialLinks?.spotify && (
              <a
                href={artist.socialLinks.spotify}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Spotify"
              >
                <Headphones className="h-3 w-3" />
              </a>
            )}
            {artist.socialLinks?.instagram && (
              <a
                href={artist.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors"
                title="Instagram"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'rider',
      header: 'Rider Specs',
      className: 'whitespace-nowrap',
      render: (artist) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRiderArtist(artist);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shadow-2xs"
        >
          <FileText className="h-3 w-3" />
          <span>View Rider</span>
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (artist) => (
        <div className="flex items-center justify-end gap-1.5">
          {onDeleteArtist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(artist.id, artist.name);
              }}
              className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer shadow-2xs"
              title="Delete artist from roster"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
              <Mic2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Artists & Headliners
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Touring headliners, opening acts, technical acoustic riders, Spotify profiles, and talent agency contacts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs shadow-purple-200 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Artist</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Artists"
          value={totalHeadliners}
          subtext="Managed in concert catalog"
          icon={Users}
          accentColor="purple"
        />
        <MetricCard
          label="Actively On Tour"
          value={touringCount}
          subtext="Stadium & arena runs live"
          icon={Sparkles}
          accentColor="emerald"
        />
        <MetricCard
          label="Ready for Booking"
          value={availableCount}
          subtext="Open booking calendars"
          icon={CheckCircle2}
          accentColor="cyan"
        />
        <MetricCard
          label="Total Shows Scheduled"
          value={totalUpcomingShows}
          subtext="Confirmed tour dates"
          icon={Mic2}
          accentColor="purple"
        />
      </div>

      {/* Unified Attached Card: Search & Filters Bar + Artists Table / Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header: Search & Filter Controls */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setArtistsPage(1);
                }}
                placeholder="Search artist by name, stage alias, city or agency..."
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50/70 pl-8.5 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setArtistsPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Right: Dropdowns, View Switcher & Reset */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Genre Filter Dropdown */}
              <div className="relative inline-flex items-center">
                <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setArtistsPage(1);
                  }}
                  className="h-9 rounded-md border border-slate-200 bg-slate-50/70 pl-8.5 pr-7 text-xs font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-2xs"
                >
                  {GENRE_FILTERS.map((g) => (
                    <option key={g} value={g}>
                      {g === 'All Genres' ? 'All Genres' : g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tour Status Filter Dropdown */}
              <div className="relative inline-flex items-center">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setArtistsPage(1);
                  }}
                  className="h-9 rounded-md border border-slate-200 bg-slate-50/70 pl-8.5 pr-7 text-xs text-slate-700 font-medium outline-none transition-all hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-2xs"
                >
                  <option value="all">All</option>
                  <option value="touring">Actively Touring</option>
                  <option value="active">Roster Active</option>
                  <option value="available">Booking Available</option>
                  <option value="on-break">On Hiatus / Break</option>
                </select>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'table'
                      ? 'bg-white text-purple-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                    }`}
                  title="Table view"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid'
                      ? 'bg-white text-purple-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                    }`}
                  title="Grid cards view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Reset Filters button if active */}
              {(searchQuery || selectedGenre !== 'All Genres' || selectedStatus !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All Genres');
                    setSelectedStatus('all');
                    setArtistsPage(1);
                  }}
                  className="h-9 px-2.5 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Reset all filters"
                >
                  <X className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card Body: Table View or Modern Grid View */}
        {filteredArtists.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Mic2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No Artists Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, switching genre filter, or register a new headliner act.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('All Genres');
                  setSelectedStatus('all');
                  setArtistsPage(1);
                }}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
              >
                + Create New Artist
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <Table
            data={filteredArtists}
            columns={artistColumns}
            keyExtractor={(artist) => artist.id}
            emptyMessage="No artists found"
            emptySubtext="Try adjusting your search criteria."
            emptyIcon={Mic2}
            hoverClassName="hover:bg-purple-50/40"
            onRowClick={(artist) => setSelectedRiderArtist(artist)}
            containerClassName="border-0 rounded-none shadow-none"
            pagination={{
              currentPage: artistsPage,
              pageSize: artistsPageSize,
              totalItems: filteredArtists.length,
              onPageChange: setArtistsPage,
              onPageSizeChange: setArtistsPageSize,
              pageSizeOptions: [5, 8, 15, 25],
              itemName: 'artists',
              activeColor: 'bg-purple-600 text-white',
            }}
          />
        ) : (
          <div className="p-4 sm:p-5 bg-slate-50/40">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtists.map((artist) => {
                const isTouring = artist.status === 'touring';
                const isAvailable = artist.status === 'available';
                const isActive = artist.status === 'active';
                return (
                  <div
                    key={artist.id}
                    className="rounded-xl border border-slate-200/90 bg-white p-4.5 hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      {/* Top Row: Avatar, Name & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="h-11 w-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                              <img
                                src={artist.avatar}
                                alt={artist.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {artist.verified && (
                              <div
                                className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-white shadow-xs"
                                title="Verified Concert Headliner"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 truncate" title={artist.name}>
                              {artist.name}
                            </h3>
                            {artist.stageName ? (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {artist.stageName}
                              </p>
                            ) : (
                              <p className="text-[11px] text-purple-600 font-medium truncate mt-0.5">
                                {artist.genre}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs shrink-0 ${isTouring
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isAvailable
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : isActive
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isTouring
                                ? 'bg-emerald-500 animate-pulse'
                                : isAvailable
                                  ? 'bg-blue-500'
                                  : isActive
                                    ? 'bg-purple-500'
                                    : 'bg-slate-400'
                              }`}
                          />
                          {isTouring
                            ? 'On Tour'
                            : isAvailable
                              ? 'Available'
                              : isActive
                                ? 'Active'
                                : 'Hiatus'}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {artist.bio}
                      </p>

                      {/* Meta Tags: Location, Listeners & Genre */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-[11px]">
                            {artist.city ? `${artist.city}, ` : ''}{artist.country}
                          </span>
                        </div>
                        {artist.monthlyListeners && (
                          <div className="flex items-center gap-1.5 min-w-0 justify-end font-semibold text-slate-700">
                            <Headphones className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate text-[11px]">{artist.monthlyListeners}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRiderArtist(artist)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Rider Specs</span>
                        </button>
                        {artist.socialLinks?.spotify && (
                          <a
                            href={artist.socialLinks.spotify}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Spotify Profile"
                          >
                            <Headphones className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {artist.socialLinks?.instagram && (
                          <a
                            href={artist.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors"
                            title="Instagram"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {onDeleteArtist && (
                        <button
                          type="button"
                          onClick={() => handleDelete(artist.id, artist.name)}
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer shadow-2xs"
                          title="Delete artist from roster"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Global Create Artist Modal */}
      <CreateArtistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAddArtist={onAddArtist}
        onShowToast={onShowToast}
      />

      {/* Technical Rider Quick View Modal */}
      {selectedRiderArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setSelectedRiderArtist(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={selectedRiderArtist.avatar}
                    alt={selectedRiderArtist.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedRiderArtist.name}</h3>
                  <p className="text-xs text-purple-600 font-medium">Stage & Hospitality Rider</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRiderArtist(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Vocal Microphone
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedRiderArtist.rider?.microphonePreference ||
                    'Standard Axient Digital Wireless Handheld'}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  In-Ear Monitoring (IEM)
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedRiderArtist.rider?.inEarMonitors || 'Sennheiser Wireless IEM'}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Hospitality & Greenroom Catering
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedRiderArtist.rider?.hospitalityNotes ||
                    'Quiet greenroom with organic refreshments, hot water, lemon and honey.'}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Management Contact
                </span>
                <div className="text-xs text-slate-700 space-y-0.5">
                  <p className="font-semibold">
                    {selectedRiderArtist.management?.managerName || 'Operations Desk'}
                  </p>
                  <p className="text-slate-500">
                    {selectedRiderArtist.management?.agency || 'Talent Management'}
                  </p>
                  <p className="text-purple-600">
                    {selectedRiderArtist.management?.email || 'booking@agency.com'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRiderArtist(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Close Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
