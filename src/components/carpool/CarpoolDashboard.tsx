import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Car,
  Users,
  TrendingUp,
  Route as RouteIcon,
  Filter,
  Plus,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import type { CarpoolRide, CarpoolCardCount, CarpoolPagination } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { RideTable } from './RideTable';
import { carpoolService } from '../../services';

interface CarpoolDashboardProps {
  rides?: CarpoolRide[];
  cardCount?: CarpoolCardCount | null;
  pagination?: CarpoolPagination | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectRide: (ride: CarpoolRide) => void;
  onDeleteRide: (rideId: string) => void;
  onOpenCreateModal: () => void;
}

export const CarpoolDashboard: React.FC<CarpoolDashboardProps> = ({
  rides: initialRides = [],
  cardCount: initialCardCount,
  pagination: initialPagination,
  searchQuery = '',
  onSearchChange,
  onSelectRide,
  onDeleteRide,
  onOpenCreateModal
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Dynamic Data & Loading State
  const [liveRides, setLiveRides] = useState<CarpoolRide[]>(initialRides);
  const [liveCardCount, setLiveCardCount] = useState<CarpoolCardCount | null>(initialCardCount || null);
  const [livePagination, setLivePagination] = useState<CarpoolPagination | null>(initialPagination || null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial props if they update externally
  useEffect(() => {
    if (initialRides && initialRides.length > 0) {
      setLiveRides(initialRides);
    }
  }, [initialRides]);

  useEffect(() => {
    if (initialCardCount) {
      setLiveCardCount(initialCardCount);
    }
  }, [initialCardCount]);

  useEffect(() => {
    if (initialPagination) {
      setLivePagination(initialPagination);
    }
  }, [initialPagination]);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keep parent search query in sync if provided
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1); // Reset to first page on search
    onSearchChange?.(val);
  };

  const handleStatusFilterChange = (val: 'all' | 'active' | 'upcoming' | 'completed' | 'cancelled') => {
    setStatusFilter(val);
    setPage(1); // Reset to first page on filter change
  };

  // Perform dynamic backend fetch with query parameters
  const isInitialMount = useRef(true);

  const executeQuery = useCallback(async () => {
    setIsLoading(true);
    try {
      // Dynamic query sent directly to backend:
      // GET /api/admin/carpool/rides?status=...&search=...&page=...&limit=...
      const result = await carpoolService.getRidesWithMeta({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit
      });

      if (result.rides) {
        setLiveRides(result.rides);
      }
      if (result.cardCount) {
        setLiveCardCount(result.cardCount);
      }
      if (result.pagination) {
        setLivePagination(result.pagination);
      }
    } catch (err) {
      console.warn('Dynamic carpool query notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, limit]);

  useEffect(() => {
    executeQuery();
  }, [debouncedSearch, statusFilter, page, limit, executeQuery]);

  // Handle local deletion and update live rides
  const handleDelete = (rideId: string) => {
    onDeleteRide(rideId);
    setLiveRides((prev) => prev.filter((r) => r.id !== rideId));
    if (liveCardCount) {
      setLiveCardCount({
        ...liveCardCount,
        totalRides: Math.max(0, liveCardCount.totalRides - 1)
      });
    }
  };

  // Metrics (computed from real backend cardCount when available)
  const activeRidesCount = liveCardCount?.activeRides ?? liveRides.filter((r) => r.status === 'active').length;
  const totalOpenSeats = liveRides.filter((r) => r.status === 'active').reduce((acc, r) => acc + r.availableSeats, 0);
  const avgPrice =
    liveRides.length > 0 ? Math.round(liveRides.reduce((acc, r) => acc + r.pricePerSeat, 0) / liveRides.length) : 0;
  const totalRidesCount = liveCardCount?.totalRides ?? livePagination?.total ?? liveRides.length;
  const upcomingRidesCount = liveCardCount?.upcomingRides ?? 0;
  const completedRidesCount = liveCardCount?.completedRides ?? 0;
  const cancelledRidesCount = liveCardCount?.cancelledRides ?? 0;

  return (
    <div className="space-y-4">
      {/* Top Banner Card & Quick Controls */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Carpool Network
            </h1>
            {/* {liveCardCount && (
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {liveCardCount.totalRides} Live Ride{liveCardCount.totalRides === 1 ? '' : 's'}
              </span>
            )}
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            )} */}
          </div>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Manage long-distance intercity rides, drivers, seat occupancy & pricing with real-time dynamic query filters.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Publish New Ride</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Carpools"
          value={totalRidesCount}
          isPositive={true}
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          label="Active Carpools"
          value={activeRidesCount}
          isPositive={true}
          icon={Car}
          accentColor="emerald"
        />

        <MetricCard
          label="Completed Carpools"
          value={completedRidesCount}
          icon={TrendingUp}
          accentColor="indigo"
        />
        <MetricCard
          label="Cancelled Carpools"
          value={cancelledRidesCount}
          isPositive={true}
          icon={RouteIcon}
          accentColor="purple"
        />
      </div>

      {/* Interactive Status Pill Filter Bar (Sends dynamic query on click) */}
      {/* <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => handleStatusFilterChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all cursor-pointer shadow-2xs ${statusFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
        >
          <span className={`h-2 w-2 rounded-full ${statusFilter === 'all' ? 'bg-white' : 'bg-slate-400'}`} />
          <span>All Rides:</span>
          <strong className="font-semibold">{totalRidesCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all cursor-pointer shadow-2xs ${statusFilter === 'active'
            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
        >
          <span className={`h-2 w-2 rounded-full ${statusFilter === 'active' ? 'bg-white' : 'bg-emerald-500'}`} />
          <span>Active:</span>
          <strong className="font-semibold">{activeRidesCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('upcoming')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all cursor-pointer shadow-2xs ${statusFilter === 'upcoming'
            ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/20'
            : 'bg-indigo-50/70 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
            }`}
        >
          <Clock className="h-3 w-3" />
          <span>Upcoming:</span>
          <strong className="font-semibold">{upcomingRidesCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all cursor-pointer shadow-2xs ${statusFilter === 'completed'
            ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/20'
            : 'bg-sky-50/70 border-sky-200 text-sky-800 hover:bg-sky-100'
            }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Completed:</span>
          <strong className="font-semibold">{completedRidesCount}</strong>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('cancelled')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all cursor-pointer shadow-2xs ${statusFilter === 'cancelled'
            ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/20'
            : 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
        >
          <XCircle className="h-3 w-3" />
          <span>Cancelled:</span>
          <strong className="font-semibold">{cancelledRidesCount}</strong>
        </button>
      </div> */}

      {/* Unified Attached Card: Header, Controls & Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header: Search & Filter Controls */}
        <div className="px-4 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          {/* Dynamic Search Input Bar */}
          <div className="relative w-full sm:w-80">
            {isLoading ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 animate-spin pointer-events-none" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search origin, destination, driver by query..."
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9.5 pr-9 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Status Filters Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(
                    e.target.value as 'all' | 'active' | 'upcoming' | 'completed' | 'cancelled'
                  )
                }
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Rides</option>
                <option value="upcoming">Upcoming Rides</option>
                <option value="completed">Completed Rides</option>
                <option value="cancelled">Cancelled Rides</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Card Body: Directly Attached Table with Server-side Pagination & Loading */}
        <RideTable
          rides={liveRides}
          isLoading={isLoading}
          onSelectRide={onSelectRide}
          onDeleteRide={handleDelete}
          containerClassName="border-0 rounded-none shadow-none"
          serverPagination={
            livePagination
              ? {
                page: livePagination.page,
                limit: livePagination.limit,
                total: livePagination.total,
                totalPages: livePagination.totalPages,
                onPageChange: (newPage) => setPage(newPage),
                onPageSizeChange: (newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }
              }
              : undefined
          }
        />
      </div>
    </div>
  );
};
