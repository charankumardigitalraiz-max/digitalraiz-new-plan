import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2,
  ArrowRight,
  Eye,
  Trash2,
  Star,
  MapPin
} from 'lucide-react';
import type { CarpoolRide, CarpoolCardCount, CarpoolPagination } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { Badge } from '../common/Badge';
import { Table, type Column } from '../common/Table';
import { carpoolService } from '../../services';

export interface CarpoolDashboardProps {
  rides?: CarpoolRide[];
  cardCount?: CarpoolCardCount | null;
  pagination?: CarpoolPagination | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectRide: (ride: CarpoolRide) => void;
  onDeleteRide: (rideId: string) => void;
  onOpenCreateModal?: () => void;
}

export const CarpoolBookingList: React.FC<CarpoolDashboardProps> = ({
  rides: initialRides = [],
  cardCount: initialCardCount,
  pagination: initialPagination,
  searchQuery = '',
  onSearchChange,
  onSelectRide,
  onDeleteRide,
  onOpenCreateModal
}) => {
  const navigate = useNavigate();

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

  const handleViewRide = (ride: CarpoolRide) => {
    if (onSelectRide) {
      onSelectRide(ride);
    }
    navigate(`/carpooling/rides/${ride.id}`);
  };

  // Metrics (computed directly from real backend cardCount when available)
  const activeRidesCount = liveCardCount?.activeRides ?? liveRides.filter((r) => r.status === 'active').length;
  const totalRidesCount = liveCardCount?.totalRides ?? livePagination?.total ?? liveRides.length;
  const completedRidesCount = liveCardCount?.completedRides ?? 0;
  const cancelledRidesCount = liveCardCount?.cancelledRides ?? 0;

  // Table Columns Definition
  const columns: Column<CarpoolRide>[] = [
    {
      key: 'route',
      header: 'Route & Stops',
      render: (ride) => (
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-medium text-xs">
            <span>{ride.originCity}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span>{ride.destinationCity}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>{ride.originPoint}</span>
          </div>
          {ride.waypoints && ride.waypoints.length > 0 && (
            <div className="mt-1 text-[11px] text-sky-600 font-normal">
              Via: {ride.waypoints.map((w) => w.city).join(', ')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'schedule',
      header: 'Schedule',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <div>
          <div className="text-slate-800 font-normal">{ride.departureDate}</div>
          <div className="text-[11px] text-slate-400">{ride.departureTime}</div>
        </div>
      )
    },
    {
      key: 'driver',
      header: 'Driver & Vehicle',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <div className="flex items-center gap-2.5">
          <img
            src={ride.driver.avatar}
            alt={ride.driver.name}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="text-slate-800 font-medium text-xs">{ride.driver.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-2.5 w-2.5 fill-amber-400" />
                {ride.driver.rating}
              </span>
              <span>•</span>
              <span className="truncate max-w-[120px]">{ride.driver.vehicleModel}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'occupancy',
      header: 'Seat Occupancy',
      className: 'whitespace-nowrap',
      render: (ride) => {
        const bookedSeats = ride.totalSeats - ride.availableSeats;
        const isFull = ride.availableSeats === 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {Array.from({ length: ride.totalSeats }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full border border-white flex items-center justify-center text-[9px] ${i < bookedSeats
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                    }`}
                />
              ))}
            </div>
            <span
              className={`text-[11px] font-normal ${isFull ? 'text-amber-600 font-medium' : 'text-slate-600'
                }`}
            >
              {ride.availableSeats} of {ride.totalSeats} open
            </span>
          </div>
        );
      }
    },
    {
      key: 'price',
      header: 'Rate / Seat',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <span className="text-sm font-medium text-emerald-600">₹{ride.pricePerSeat}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (ride) => <Badge status={ride.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (ride) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleViewRide(ride)}
            className="rounded-md p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs transition-all cursor-pointer"
            title="View Ride Manifest"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(ride.id)}
            className="rounded-md p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
            title="Remove Ride"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Card & Quick Controls */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Carpool Network
            </h1>
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Manage long-distance intercity rides, drivers, seat occupancy & pricing with real-time dynamic query filters.
          </p>
        </div>

        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 rounded-md btn-carpool px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Publish New Ride</span>
          </button>
        )}
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
                <option value="all">All Statuses ({totalRidesCount})</option>
                <option value="active">Active Rides ({activeRidesCount})</option>
                <option value="upcoming">Upcoming Rides</option>
                <option value="completed">Completed Rides ({completedRidesCount})</option>
                <option value="cancelled">Cancelled Rides ({cancelledRidesCount})</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Card Body: Directly Attached Table with Dynamic Server Pagination & Loading */}
        <Table
          data={liveRides}
          columns={columns}
          containerClassName="border-0 rounded-none shadow-none"
          keyExtractor={(ride) => ride.id}
          emptyMessage="No carpool rides found"
          emptySubtext="Try adjusting your search criteria or publish a new carpool trip."
          emptyIcon={Car}
          isLoading={isLoading}
          onRowClick={(ride) => handleViewRide(ride)}
          pagination={{
            currentPage: livePagination?.page ?? page,
            pageSize: livePagination?.limit ?? limit,
            totalItems: livePagination?.total ?? liveRides.length,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
            pageSizeOptions: [10, 20, 50],
            itemName: 'rides',
            autoSlice: false
          }}
        />
      </div>
    </div>
  );
};
