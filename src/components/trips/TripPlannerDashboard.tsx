import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Compass,
  Plus,
  Filter,
  UserCheck,
  Calendar,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import type { TripPlan, CarpoolRide } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { TripCard } from './TripCard';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';

interface TripPlannerDashboardProps {
  trips: TripPlan[];
  carpoolRides: CarpoolRide[];
  searchQuery: string;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onSelectTrip: (trip: TripPlan) => void;
  onDeleteTrip: (id: string) => void;
  onOpenCreateModal: () => void;
}

interface CompanionItem {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  tripTitle: string;
  origin: string;
  destination: string;
  startDate: string;
  creatorName: string;
  status: string;
}

export const TripPlannerDashboard: React.FC<TripPlannerDashboardProps> = ({
  trips,
  carpoolRides: _carpoolRides,
  searchQuery,
  activeSubTab = 'all-trips',
  onSubTabChange,
  onSelectTrip,
  onDeleteTrip,
  onOpenCreateModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Pagination states
  const [tripsPage, setTripsPage] = useState(1);
  const [tripsPageSize, setTripsPageSize] = useState(6);

  const [companionsPage, setCompanionsPage] = useState(1);
  const [companionsPageSize, setCompanionsPageSize] = useState(6);
  const [companionsViewMode, setCompanionsViewMode] = useState<'table' | 'cards'>('table');

  const categories = ['All', 'Roadtrip', 'Music Tour', 'City Hopping', 'Nature & Trek'];

  // Metrics
  const totalTravelersMatched = trips.reduce((acc, t) => acc + t.joinedTravelers.length, 0);
  const avgDays = trips.length > 0
    ? (trips.reduce((acc, t) => acc + t.totalDays, 0) / trips.length).toFixed(1)
    : 0;
  const linkedTripsCount = trips.filter(t => t.linkedCarpoolRideId).length;

  // Filter
  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.waypoints.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All') return trip.category === selectedCategory;
    return true;
  });

  const paginatedTrips = filteredTrips.slice(
    (tripsPage - 1) * tripsPageSize,
    tripsPage * tripsPageSize
  );

  // Extract all Joined Travel Buddies across published trips
  const allCompanions: CompanionItem[] = trips.flatMap(trip =>
    trip.joinedTravelers.map((traveler, index) => ({
      id: `${trip.id}-traveler-${index}`,
      name: traveler.name,
      avatar: traveler.avatar,
      joinedAt: traveler.joinedAt,
      tripTitle: trip.title,
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      creatorName: trip.creatorName,
      status: 'Confirmed'
    }))
  );

  const paginatedCompanions = allCompanions.slice(
    (companionsPage - 1) * companionsPageSize,
    companionsPage * companionsPageSize
  );

  const companionColumns: Column<CompanionItem>[] = [
    {
      key: 'traveler',
      header: 'Travel Companion',
      render: (companion) => (
        <div className="flex items-center gap-3">
          <img
            src={companion.avatar}
            alt={companion.name}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
          />
          <div>
            <h4 className="text-xs font-semibold text-slate-900">{companion.name}</h4>
            <span className="text-[10px] text-slate-400">
              Origin: <span className="font-medium text-slate-600">{companion.origin}</span>
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'itinerary',
      header: 'Joined Trip Itinerary',
      render: (companion) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{companion.tripTitle}</div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="truncate max-w-[200px]">{companion.destination}</span>
          </div>
        </div>
      )
    },
    {
      key: 'host',
      header: 'Host / Creator',
      className: 'whitespace-nowrap',
      render: (companion) => (
        <span className="text-xs text-slate-600">{companion.creatorName}</span>
      )
    },
    {
      key: 'joinedAt',
      header: 'Joined Date',
      className: 'whitespace-nowrap',
      render: (companion) => (
        <span className="text-xs font-medium text-slate-700">{companion.joinedAt}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (companion) => (
        <div className="flex justify-end">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100 inline-flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            <span>{companion.status}</span>
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {activeSubTab === 'companions' ? 'Travel Buddies & Companion Match' : 'Trip Itineraries & Group Tours'}
        </h1>
        <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
          {activeSubTab === 'companions'
            ? 'Verified co-travelers and companion requests across global routes'
            : 'Curated multi-day roadtrips, adventure routes, and group carpool connections'}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Published Itineraries"
          value={trips.length}
          change="+3 this week"
          isPositive={true}
          subtext="Curated community travel plans"
          icon={Compass}
          accentColor="amber"
        />
        <MetricCard
          label="Travel Buddies Joined"
          value={totalTravelersMatched}
          change="+14 members"
          isPositive={true}
          subtext="Verified companion roster"
          icon={Users}
          accentColor="indigo"
        />
        <MetricCard
          label="Average Trip Duration"
          value={`${avgDays} Days`}
          subtext="Cross-city road journeys"
          icon={Calendar}
          accentColor="emerald"
        />
        <MetricCard
          label="Paired Carpool Shuttles"
          value={linkedTripsCount}
          subtext="Linked intercity journeys"
          icon={Users}
          accentColor="purple"
        />
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Navigation Routes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSubTabChange?.('all-trips')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeSubTab === 'all-trips'
                ? 'bg-sidebar-active text-sidebar-active font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Trip Itineraries ({trips.length})</span>
          </button>

          <button
            onClick={() => onSubTabChange?.('companions')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeSubTab === 'companions'
                ? 'bg-sidebar-active text-sidebar-active font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Travel Buddies ({allCompanions.length})</span>
          </button>
        </div>

        {/* Right Action: Category Filter or View Switcher */}
        {activeSubTab === 'all-trips' ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setTripsPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${selectedCategory === cat
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Trip Plan</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {allCompanions.length} Verified Companions
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setCompanionsViewMode('table')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${companionsViewMode === 'table'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setCompanionsViewMode('cards')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${companionsViewMode === 'cards'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render View Based on Active Sub-Route */}
      {activeSubTab === 'companions' ? (
        companionsViewMode === 'table' ? (
          <Table
            data={allCompanions}
            columns={companionColumns}
            keyExtractor={(companion) => companion.id}
            emptyMessage="No travel companions found"
            emptySubtext="Joiners across travel blueprints will be indexed here."
            emptyIcon={Users}
            pagination={{
              currentPage: companionsPage,
              pageSize: companionsPageSize,
              totalItems: allCompanions.length,
              onPageChange: setCompanionsPage,
              onPageSizeChange: setCompanionsPageSize,
              pageSizeOptions: [6, 12, 24],
              itemName: 'companions'
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCompanions.map(companion => (
                <div
                  key={companion.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={companion.avatar}
                          alt={companion.name}
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{companion.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            Origin: <span className="font-medium text-slate-600">{companion.origin}</span>
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>{companion.status}</span>
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 my-2 space-y-1">
                      <div className="text-[10px] text-slate-400">Joined Trip Itinerary</div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{companion.tripTitle}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">{companion.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Joined: <strong className="text-slate-700">{companion.joinedAt}</strong></span>
                    <span className="text-[10px] text-slate-400">Host: {companion.creatorName}</span>
                  </div>
                </div>
              ))}
            </div>

            {allCompanions.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
                <Pagination
                  currentPage={companionsPage}
                  totalItems={allCompanions.length}
                  pageSize={companionsPageSize}
                  onPageChange={setCompanionsPage}
                  onPageSizeChange={setCompanionsPageSize}
                  pageSizeOptions={[6, 12, 24]}
                  itemName="companions"
                />
              </div>
            )}
          </div>
        )
      ) : (
        /* All Trips Route View */
        filteredTrips.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-medium text-slate-800">No itineraries found</h3>
            <p className="mt-1 text-xs text-slate-400">
              Try a different filter category or start a new travel blueprint.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={onSelectTrip}
                  onDelete={onDeleteTrip}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
              <Pagination
                currentPage={tripsPage}
                totalItems={filteredTrips.length}
                pageSize={tripsPageSize}
                onPageChange={setTripsPage}
                onPageSizeChange={setTripsPageSize}
                pageSizeOptions={[6, 12, 24]}
                itemName="itineraries"
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};
