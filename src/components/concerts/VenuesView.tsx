import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Phone,
  Plus,
  Search,
  Filter,
  X,
  LayoutList,
  LayoutGrid,
  Radio,
  Eye
} from 'lucide-react';
import type { Venue } from '../../types';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';
import { AddVenueModal } from './AddVenueModal';
import { VenueDetailModal } from './VenueDetailModal';

interface VenuesViewProps {
  venues: Venue[];
  onAddVenue: (venue: Venue) => void;
  onShowToast: (msg: string) => void;
}

const VENUE_TYPES = [
  'All Types',
  'Stadium',
  'Arena',
  'Open Grounds',
  'Club',
  'Auditorium'
];

export const VenuesView: React.FC<VenuesViewProps> = ({
  venues,
  onAddVenue,
  onShowToast
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Filtered venues
  const filteredVenues = venues.filter((venue) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      venue.name.toLowerCase().includes(q) ||
      venue.city.toLowerCase().includes(q) ||
      venue.address.toLowerCase().includes(q) ||
      venue.soundSystem.toLowerCase().includes(q) ||
      venue.contactPerson.toLowerCase().includes(q) ||
      venue.type.toLowerCase().includes(q);

    const matchesType =
      selectedType === 'All Types' || venue.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Paginated slice for grid view
  const totalPages = Math.max(1, Math.ceil(filteredVenues.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedGridVenues = filteredVenues.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Table columns definition
  const venueColumns: Column<Venue>[] = [
    {
      key: 'name',
      header: 'Venue & City',
      render: (venue) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 truncate" title={venue.name}>
              {venue.name}
            </h4>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="truncate">{venue.city}</span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-600 font-medium">{venue.type}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (venue) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80">
          {venue.type}
        </span>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (venue) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{venue.capacity.toLocaleString()} seats</span>
        </div>
      )
    },
    {
      key: 'soundSystem',
      header: 'Audio Setup',
      render: (venue) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-xs truncate" title={venue.soundSystem}>
          <Radio className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{venue.soundSystem}</span>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (venue) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 max-w-xs">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate" title={venue.address}>
            {venue.address}
          </span>
        </div>
      )
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (venue) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{venue.contactPerson}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (venue) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedVenue(venue);
          }}
          className="rounded-md px-2 py-1 bg-purple-50 border border-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
          title="View Venue Specifications"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </button>
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
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Venues & Stages
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Partner concert arenas, stadium capacities, audio delay rigs, and venue coordinator desks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs shadow-purple-200 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Venue</span>
        </button>
      </div>

      {/* Unified Toolbar and Content Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Search, Filter & View Switcher Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Left: Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search venues, cities, address, sound system..."
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50/70 pl-8.5 pr-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters & View Switcher */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Type Filter */}
            <div className="relative inline-flex items-center">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-md border border-slate-200 bg-slate-50/70 pl-8.5 pr-7 text-xs text-slate-700 font-medium outline-none transition-all hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-2xs"
              >
                {VENUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-purple-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table view"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Reset Filters button if filters active */}
            {(searchQuery || selectedType !== 'All Types') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All Types');
                  setCurrentPage(1);
                }}
                className="h-9 px-2.5 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Reset filters"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {filteredVenues.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No Venues Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing the type filter, or add a new partner venue.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All Types');
                  setCurrentPage(1);
                }}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
              >
                + Add Venue
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <Table
            data={filteredVenues}
            columns={venueColumns}
            keyExtractor={(venue) => venue.id}
            emptyMessage="No venues found"
            hoverClassName="hover:bg-purple-50/40 cursor-pointer"
            onRowClick={(venue) => setSelectedVenue(venue)}
            containerClassName="border-0 rounded-none shadow-none"
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredVenues.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
              pageSizeOptions: [6, 9, 15, 30],
              itemName: 'venues',
              activeColor: 'bg-purple-600 text-white'
            }}
          />
        ) : (
          <div className="p-4 sm:p-5 bg-slate-50/40 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedGridVenues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenue(venue)}
                  className="rounded-lg border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div>
                    {/* Header: Venue Icon, Name, City/Type & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-purple-600 transition-colors" title={venue.name}>
                            {venue.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {venue.city} <span className="text-slate-300">•</span>{' '}
                            <span className="text-purple-600 font-medium">{venue.type}</span>
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    </div>

                    {/* Specs: Clean 2-column key metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                          Capacity
                        </span>
                        <span className="text-xs font-semibold text-slate-900 mt-0.5 block">
                          {venue.capacity.toLocaleString()} seats
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                          Audio Setup
                        </span>
                        <span
                          className="text-xs font-semibold text-slate-800 mt-0.5 block truncate"
                          title={venue.soundSystem}
                        >
                          {venue.soundSystem.split(' with ')[0].split(' & ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 truncate" title={venue.address}>
                        {venue.address}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Contact Person and View Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-600 truncate">{venue.contactPerson}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVenue(venue);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid Pagination */}
            {filteredVenues.length > pageSize && (
              <div className="pt-2">
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={filteredVenues.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 9, 15, 30]}
                  itemName="venues"
                  activeColor="bg-purple-600 text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Venue Modal */}
      <AddVenueModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddVenue={onAddVenue}
        onShowToast={onShowToast}
      />

      {/* View Venue Specifications Modal */}
      <VenueDetailModal
        venue={selectedVenue}
        isOpen={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
