import React, { useState } from 'react';
import {
  Music,
  Calendar,
  Ticket,
  Car,
  Plus,
  Filter,
  MapPin,
  Building2,
  Volume2,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  Trash2
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { ConcertCard } from './ConcertCard';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';
import { Badge } from '../common/Badge';

interface ConcertsDashboardProps {
  concerts: ConcertEvent[];
  searchQuery: string;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onSelectConcert: (concert: ConcertEvent) => void;
  onDeleteConcert: (id: string) => void;
  onOpenUploadModal: () => void;
}

export const ConcertsDashboard: React.FC<ConcertsDashboardProps> = ({
  concerts,
  searchQuery,
  activeSubTab = 'all-concerts',
  onSubTabChange,
  onSelectConcert,
  onDeleteConcert,
  onOpenUploadModal
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [concertsPage, setConcertsPage] = useState(1);
  const [concertsPageSize, setConcertsPageSize] = useState(8);
  const [concertsViewMode, setConcertsViewMode] = useState<'cards' | 'table'>('cards');

  const [venuesPage, setVenuesPage] = useState(1);
  const [venuesPageSize, setVenuesPageSize] = useState(4);

  const genres = ['All', 'EDM', 'Rock', 'Pop', 'Indie', 'Hip-Hop'];

  // Metrics
  const activeEventsCount = concerts.filter(c => c.status === 'active').length;
  const totalCapacitySum = concerts.reduce((acc, c) => acc + c.totalCapacity, 0);
  const totalSoldSum = concerts.reduce((acc, c) => acc + c.ticketsSold, 0);
  const totalLinkedCarpools = concerts.reduce((acc, c) => acc + c.connectedRidesCount, 0);

  // Filter Concerts
  const filteredConcerts = concerts.filter(concert => {
    const matchesSearch =
      concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.venueName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedGenre !== 'All') return concert.genre === selectedGenre;
    return true;
  });

  const paginatedConcerts = filteredConcerts.slice(
    (concertsPage - 1) * concertsPageSize,
    concertsPage * concertsPageSize
  );

  // Stages & Venues Data
  const venuesData = [
    {
      id: 'venue-1',
      name: 'Narendra Modi Stadium',
      city: 'Ahmedabad',
      country: 'India',
      capacity: 74000,
      soundSystem: 'L-Acoustics K1 Stadium Array',
      gates: '14 Security Gates',
      parkingBays: '3,200 Carpool Slots',
      image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
      scheduledConcert: 'Coldplay • Music of the Spheres',
      connectedRides: 88,
      status: 'Ready'
    },
    {
      id: 'venue-2',
      name: 'Jawaharlal Nehru Stadium',
      city: 'Delhi',
      country: 'India',
      capacity: 45000,
      soundSystem: 'd&b audiotechnik GSL System',
      gates: '10 Entry Portals',
      parkingBays: '1,800 Carpool Slots',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      scheduledConcert: 'Diljit Dosanjh • Dil-Luminati Tour',
      connectedRides: 64,
      status: 'Ready'
    },
    {
      id: 'venue-3',
      name: 'Jio World Garden',
      city: 'Mumbai',
      country: 'India',
      capacity: 22000,
      soundSystem: 'Meyer Sound PANTHER Line Array',
      gates: '6 VIP Entry Gates',
      parkingBays: '1,200 Carpool Slots',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      scheduledConcert: 'Dua Lipa • Radical Optimism',
      connectedRides: 52,
      status: 'Ready'
    },
    {
      id: 'venue-4',
      name: 'Bhartiya City Amphitheatre',
      city: 'Bengaluru',
      country: 'India',
      capacity: 18000,
      soundSystem: 'JBL VTX A12 Dual 12" Line Array',
      gates: '8 Gates with RFID Scanning',
      parkingBays: '950 Carpool Slots',
      image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80',
      scheduledConcert: 'Martin Garrix • Live in India',
      connectedRides: 41,
      status: 'Ready'
    }
  ];

  const paginatedVenues = venuesData.slice(
    (venuesPage - 1) * venuesPageSize,
    venuesPage * venuesPageSize
  );

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
            onClick={(e) => {
              e.stopPropagation();
              onSelectConcert(concert);
            }}
            className="rounded-lg p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs transition-all cursor-pointer"
            title="View Concert Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConcert(concert.id);
            }}
            className="rounded-lg p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
            title="Delete Concert"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {activeSubTab === 'venues' ? 'Venues & Arenas' : 'Live Concerts & Festivals'}
        </h1>
        <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
          {activeSubTab === 'venues'
            ? 'Capacity, soundstage management, and geographical drop points'
            : 'Stage schedules, ticket tier velocity, connected intercity transport'}
        </p>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Live Tours & Events"
          value={activeEventsCount}
          change="+4 this month"
          isPositive={true}
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
          change={`${Math.round((totalSoldSum / (totalCapacitySum || 1)) * 100)}% sold`}
          isPositive={true}
          subtext="Verified spectator passes"
          icon={Ticket}
          accentColor="emerald"
        />
        <MetricCard
          label="Connected Carpool Shuttles"
          value={totalLinkedCarpools}
          change="+89 today"
          isPositive={true}
          subtext="Direct to venue gates"
          icon={Car}
          accentColor="cyan"
        />
      </div>

      {/* Navigation Sub-Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Navigation Routes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSubTabChange?.('all-concerts')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === 'all-concerts'
                ? 'bg-sidebar-active text-sidebar-active font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Tour Manifest ({concerts.length})</span>
          </button>

          <button
            onClick={() => onSubTabChange?.('venues')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === 'venues'
                ? 'bg-sidebar-active text-sidebar-active font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Stages & Venues ({venuesData.length})</span>
          </button>
        </div>

        {/* Right Action: Genre Pills or View Switcher + Upload */}
        {activeSubTab === 'all-concerts' ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
              </span>
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setConcertsPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setConcertsViewMode('cards')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  concertsViewMode === 'cards'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setConcertsViewMode('table')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  concertsViewMode === 'table'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Concert</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            {venuesData.length} Live Stadiums & Acoustic Arenas
          </span>
        )}
      </div>

      {/* Render View Based on Active Route */}
      {activeSubTab === 'venues' ? (
        /* Stages & Venues Route View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedVenues.map(venue => (
              <div
                key={venue.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{venue.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>
                            {venue.city}, {venue.country}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                      {venue.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs my-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Venue Capacity</span>
                      <span className="font-semibold text-slate-800">
                        {venue.capacity.toLocaleString()} Seats
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Carpool Drop-off</span>
                      <span className="font-semibold text-slate-800">{venue.parkingBays}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/50">
                      <span className="text-slate-400 text-[10px] block">
                        Acoustics & Sound System
                      </span>
                      <span className="font-medium text-slate-700 text-[11px] flex items-center gap-1 mt-0.5">
                        <Volume2 className="h-3 w-3 text-purple-500" />
                        {venue.soundSystem}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Tour Leg</span>
                    <span className="font-medium text-slate-800 text-[11px] truncate max-w-[200px]">
                      {venue.scheduledConcert}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <Car className="h-3.5 w-3.5" />
                    <span>{venue.connectedRides} Carpools</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {venuesData.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
              <Pagination
                currentPage={venuesPage}
                totalItems={venuesData.length}
                pageSize={venuesPageSize}
                onPageChange={setVenuesPage}
                onPageSizeChange={setVenuesPageSize}
                pageSizeOptions={[2, 4, 8]}
                itemName="venues"
              />
            </div>
          )}
        </div>
      ) : (
        /* All Concerts Route View */
        filteredConcerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Music className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-medium text-slate-800">No concerts matched</h3>
            <p className="mt-1 text-xs text-slate-400">
              Try switching your genre filter or upload a new music festival.
            </p>
          </div>
        ) : concertsViewMode === 'table' ? (
          <Table
            data={filteredConcerts}
            columns={concertColumns}
            keyExtractor={(concert) => concert.id}
            emptyMessage="No concerts matched"
            emptySubtext="Try switching your genre filter or upload a new music festival."
            emptyIcon={Music}
            onRowClick={(concert) => onSelectConcert(concert)}
            pagination={{
              currentPage: concertsPage,
              pageSize: concertsPageSize,
              totalItems: filteredConcerts.length,
              onPageChange: setConcertsPage,
              onPageSizeChange: setConcertsPageSize,
              pageSizeOptions: [4, 8, 16],
              itemName: 'concerts'
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedConcerts.map(concert => (
                <ConcertCard
                  key={concert.id}
                  concert={concert}
                  onSelect={onSelectConcert}
                  onDelete={onDeleteConcert}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
              <Pagination
                currentPage={concertsPage}
                totalItems={filteredConcerts.length}
                pageSize={concertsPageSize}
                onPageChange={setConcertsPage}
                onPageSizeChange={setConcertsPageSize}
                pageSizeOptions={[4, 8, 16]}
                itemName="concerts"
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};
