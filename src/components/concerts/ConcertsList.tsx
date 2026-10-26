import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Calendar,
  Ticket,
  Plus,
  Filter,
  MapPin,
  TrendingUp,
  Eye,
  Trash2,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { Table, type Column } from '../common/Table';
import { Badge } from '../common/Badge';

interface ConcertsListProps {
  concerts: ConcertEvent[];
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onSelectConcert?: (concert: ConcertEvent) => void;
  onDeleteConcert: (id: string) => void;
  onOpenUploadModal: () => void;
}

export const ConcertsList: React.FC<ConcertsListProps> = ({
  concerts,
  searchQuery = '',
  onSearchChange,
  onSelectConcert,
  onDeleteConcert,
  onOpenUploadModal
}) => {
  const navigate = useNavigate();
  const [internalSearch, setInternalSearch] = useState<string>(searchQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [concertsPage, setConcertsPage] = useState(1);
  const [concertsPageSize, setConcertsPageSize] = useState(8);
  const [concertsViewMode, setConcertsViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    setInternalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    onSearchChange?.(val);
    setConcertsPage(1);
  };

  const genres = ['All', 'EDM', 'Rock', 'Pop', 'Indie', 'Hip-Hop'];

  // Metrics
  const activeEventsCount = concerts.filter(c => c.status === 'active').length;
  const totalCapacitySum = concerts.reduce((acc, c) => acc + c.totalCapacity, 0);
  const totalSoldSum = concerts.reduce((acc, c) => acc + c.ticketsSold, 0);
  const totalGMV = concerts.reduce((acc, c) => {
    const avgPrice = (c.minPrice + c.maxPrice) / 2;
    return acc + (c.ticketsSold * avgPrice);
  }, 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  // Filter Concerts
  const filteredConcerts = concerts.filter(concert => {
    const q = internalSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      concert.title.toLowerCase().includes(q) ||
      concert.artist.toLowerCase().includes(q) ||
      concert.city.toLowerCase().includes(q) ||
      concert.venueName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedGenre !== 'All') return concert.genre === selectedGenre;
    return true;
  });

  const concertColumns: Column<ConcertEvent>[] = [
    {
      key: 'title',
      header: 'Concert & Artist',
      render: (concert) => (
        <div className="flex items-center gap-3">
          <img
            src={concert.image}
            alt={concert.title}
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-slate-900">{concert.title}</div>
            <div className="text-[11px] text-slate-500">{concert.artist}</div>
          </div>
        </div>
      )
    },
    {
      key: 'genre',
      header: 'Genre',
      render: (concert) => (
        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-100">
          {concert.genre}
        </span>
      )
    },
    {
      key: 'schedule',
      header: 'Date & Schedule',
      className: 'whitespace-nowrap',
      render: (concert) => (
        <div>
          <div className="text-slate-800 font-medium text-xs">{concert.date}</div>
          <div className="text-[11px] text-slate-400">Doors: {concert.doorsOpen}</div>
        </div>
      )
    },
    {
      key: 'venue',
      header: 'Venue & City',
      render: (concert) => (
        <div>
          <div className="text-xs text-slate-800 font-medium truncate max-w-[180px]">
            {concert.venueName}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span>
              {concert.city}, {concert.country}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'tickets',
      header: 'Ticket Sales',
      className: 'whitespace-nowrap',
      render: (concert) => {
        const percentSold = Math.round((concert.ticketsSold / concert.totalCapacity) * 100);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-800">
                {concert.ticketsSold.toLocaleString()} / {concert.totalCapacity.toLocaleString()}
              </span>
              <span className="text-slate-400">{percentSold}%</span>
            </div>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-purple-600 transition-all"
                style={{ width: `${percentSold}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'price',
      header: 'Price Range',
      className: 'whitespace-nowrap',
      render: (concert) => (
        <span className="text-xs font-semibold text-slate-800">
          ₹{concert.minPrice.toLocaleString()} - ₹{concert.maxPrice.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (concert) => <Badge status={concert.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (concert) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectConcert?.(concert);
              navigate(`/concerts/${concert.id}`);
            }}
            className="rounded-md p-1.5 bg-purple-50 border border-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-2xs transition-all cursor-pointer"
            title="View Concert Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConcert(concert.id);
            }}
            className="rounded-md p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
            title="Delete Concert"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
            Live Concerts & Festivals
          </h1>
          <p className="text-[13px] font-normal text-slate-500 mt-1 max-w-2xl">
            Live tour manifests, ticket tier availability, spectator capacity, and stage dates.
          </p>
        </div>

        {onOpenUploadModal && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-100 transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Concert</span>
          </button>
        )}
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Live Tours & Events"
          value={activeEventsCount}
          subtext="Stadium and arena performances"
          icon={Music}
          accentColor="purple"
        />
        <MetricCard
          label="Total Stadium Capacity"
          value={totalCapacitySum.toLocaleString()}
          subtext="Across all indexed tour stops"
          icon={Calendar}
          accentColor="indigo"
        />
        <MetricCard
          label="Tickets Issued"
          value={totalSoldSum.toLocaleString()}
          // change={`${Math.round((totalSoldSum / (totalCapacitySum || 1)) * 100)}% sold`}
          isPositive={true}
          subtext="Verified spectator passes"
          icon={Ticket}
          accentColor="emerald"
        />
        <MetricCard
          label="Gross Box Office (GMV)"
          value={formatCurrency(totalGMV)}
          isPositive={true}
          subtext="Total ticket gross volume"
          icon={TrendingUp}
          accentColor="cyan"
        />
      </div>

      {/* Unified Attached Card: Header, Controls & Table / Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header: Search & Filter Controls */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Left: Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search concerts, artists, cities, venues..."
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9.5 pr-9 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 shadow-2xs"
            />
            {internalSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Genre Dropdown Filter + View Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            {/* Genre Filter Dropdown */}
            <div className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setConcertsPage(1);
                }}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-2xs"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'All' ? `All Genres (${concerts.length})` : genre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* <span className="text-xs font-medium text-slate-500">
              {filteredConcerts.length} concerts
            </span> */}
          </div>
        </div>

        {/* Card Body: Directly Attached Table or Grid */}
        {filteredConcerts.length === 0 ? (
          <div className="p-12 text-center">
            <Music className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-medium text-slate-800">No concerts matched</h3>
            <p className="mt-1 text-xs text-slate-400">
              {internalSearch || selectedGenre !== 'All'
                ? 'Try resetting your search query or switching your genre filter.'
                : 'No live concerts found. Upload a new music festival to get started.'}
            </p>
            {(internalSearch || selectedGenre !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange('');
                  setSelectedGenre('All');
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                Reset Filters & Search
              </button>
            )}
          </div>
        ) : (
          <Table
            data={filteredConcerts}
            columns={concertColumns}
            keyExtractor={(concert) => concert.id}
            emptyMessage="No concerts matched"
            emptySubtext="Try switching your genre filter or upload a new music festival."
            emptyIcon={Music}
            hoverClassName="hover:bg-[#F2E6FF]"
            onRowClick={(concert) => {
              onSelectConcert?.(concert);
              navigate(`/concerts/${concert.id}`);
            }}
            containerClassName="border-0 rounded-none shadow-none"
            pagination={{
              currentPage: concertsPage,
              pageSize: concertsPageSize,
              totalItems: filteredConcerts.length,
              onPageChange: setConcertsPage,
              onPageSizeChange: setConcertsPageSize,
              pageSizeOptions: [4, 8, 16],
              itemName: 'concerts',
              activeColor: 'bg-concerts-primary text-white',
            }}
          />
        )}
      </div>
    </div>
  );
};

export const ConcertsDashboard = ConcertsList;
