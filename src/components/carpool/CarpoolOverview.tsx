import React, { useState, useMemo } from 'react';
import {
  Car,
  Users,
  TrendingUp,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Clock,
  Plus,
  Compass,
  Star,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Route as RouteIcon
} from 'lucide-react';
import type { CarpoolRide, Driver, CarpoolCardCount } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { CarpoolAnalyticsCharts } from './CarpoolAnalyticsCharts';

interface CarpoolOverviewProps {
  rides: CarpoolRide[];
  drivers: Driver[];
  cardCount?: CarpoolCardCount | null;
  onNavigateSubTab: (subTab: 'rides' | 'verifications') => void;
  onSelectRide: (ride: CarpoolRide) => void;
  onOpenCreateModal: () => void;
}

type Timeframe = '7D' | '30D' | '90D' | 'ALL';

export const CarpoolOverview: React.FC<CarpoolOverviewProps> = ({
  rides,
  drivers,
  cardCount,
  onNavigateSubTab,
  onSelectRide,
  onOpenCreateModal
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [selectedCorridor, setSelectedCorridor] = useState<string | null>(null);

  // Derived metrics
  const activeRides = useMemo(() => rides.filter(r => r.status === 'active'), [rides]);
  const completedRides = useMemo(() => rides.filter(r => r.status === 'completed'), [rides]);

  const totalSeats = useMemo(() => rides.reduce((sum, r) => sum + r.totalSeats, 0), [rides]);
  const availableSeats = useMemo(() => activeRides.reduce((sum, r) => sum + r.availableSeats, 0), [activeRides]);
  const bookedSeats = useMemo(() => {
    return rides.reduce((sum, r) => sum + (r.totalSeats - r.availableSeats), 0);
  }, [rides]);

  const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  const totalGMV = useMemo(() => {
    return rides.reduce((sum, r) => sum + ((r.totalSeats - r.availableSeats) * r.pricePerSeat), 0);
  }, [rides]);

  const avgFare = useMemo(() => {
    return rides.length > 0
      ? Math.round(rides.reduce((sum, r) => sum + r.pricePerSeat, 0) / rides.length)
      : 0;
  }, [rides]);

  const verifiedDrivers = useMemo(() => drivers.filter(d => d.verificationStatus === 'verified'), [drivers]);
  const pendingDrivers = useMemo(() => drivers.filter(d => d.verificationStatus === 'pending'), [drivers]);

  // Aggregate Corridor Performance
  const corridorStats = useMemo(() => {
    const map = new Map<string, {
      route: string;
      origin: string;
      destination: string;
      rideCount: number;
      totalSeats: number;
      bookedSeats: number;
      avgPrice: number;
      distance: string;
    }>();

    rides.forEach(ride => {
      const key = `${ride.originCity} ↔ ${ride.destinationCity}`;
      const existing = map.get(key);
      const booked = ride.totalSeats - ride.availableSeats;
      if (existing) {
        existing.rideCount += 1;
        existing.totalSeats += ride.totalSeats;
        existing.bookedSeats += booked;
        existing.avgPrice = Math.round((existing.avgPrice + ride.pricePerSeat) / 2);
      } else {
        map.set(key, {
          route: key,
          origin: ride.originCity,
          destination: ride.destinationCity,
          rideCount: 1,
          totalSeats: ride.totalSeats,
          bookedSeats: booked,
          avgPrice: ride.pricePerSeat,
          distance: ride.distance || '180 km'
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.rideCount - a.rideCount);
  }, [rides]);

  // Top rated drivers
  const topDrivers = useMemo(() => {
    return [...verifiedDrivers]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [verifiedDrivers]);

  // Recent rides
  const recentRides = useMemo(() => {
    return rides.slice(0, 5);
  }, [rides]);

  return (
    <div className="space-y-4">
      {/* Top Banner Card & Quick Controls */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
            Carpooling Intelligence & Fleet Overview
          </h1>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Real-time corridor occupancy, route pricing efficiency, driver KYC compliance, and live dispatch rosters.
          </p>
        </div>

        {/* Action Buttons & Timeframe Selector */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs font-medium text-slate-600">
            {(['7D', '30D', '90D', 'ALL'] as Timeframe[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${timeframe === t
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Carpools"
          value={cardCount?.activeRides ?? activeRides.length}
          isPositive={true}
          icon={Car}
          accentColor="emerald"
        />
        <MetricCard
          label="Seat Occupancy Rate"
          value={`${occupancyRate}%`}
          isPositive={occupancyRate >= 70}
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          label="Gross Booking Value"
          value={`₹${totalGMV.toLocaleString()}`}
          isPositive={true}
          icon={TrendingUp}
          accentColor="indigo"
        />
        <MetricCard
          label="Verified Drivers"
          value={`${verifiedDrivers.length}`}
          isPositive={pendingDrivers.length === 0}
          icon={ShieldCheck}
          accentColor={pendingDrivers.length > 0 ? 'amber' : 'purple'}
        />
      </div>

      {/* Carpooling Ecosystem Analytical Graphs & Corridor Distribution */}
      <CarpoolAnalyticsCharts
        rides={rides}
        drivers={drivers}
      />

      {/* Secondary Quick Pulse Bar */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex items-center gap-3 px-3 py-1 border-r border-slate-100 last:border-r-0">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <RouteIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Total Rides Catalog</div>
            <div className="text-base font-semibold text-slate-800">{rides.length} Routes</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 border-r border-slate-100 last:border-r-0">
          <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Seats In Circulation</div>
            <div className="text-base font-semibold text-slate-800">{availableSeats} Open / {totalSeats} Total</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 border-r border-slate-100 last:border-r-0">
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">KYC Review Queue</div>
            <div className="text-base font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{pendingDrivers.length} Pending</span>
              {pendingDrivers.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Average Seat Fare</div>
            <div className="text-base font-semibold text-slate-800">₹{avgFare}</div>
          </div>
        </div>
      </div> */}

      {/* Main Analytics Grid: High Traffic Corridors & Occupancy Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mobility Corridors Performance (7 Cols) */}
        {/* <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Intercity Mobility Corridors</h2>
                  <p className="text-[11px] text-slate-400">Ranked by ride frequency and seat occupancy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSubTab('rides')}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Rides</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

           
            <div className="space-y-3">
              {corridorStats.slice(0, 5).map((corridor, idx) => {
                const fillPercent = corridor.totalSeats > 0
                  ? Math.round((corridor.bookedSeats / corridor.totalSeats) * 100)
                  : 0;

                return (
                  <div
                    key={corridor.route}
                    className="group rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 p-3.5 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {corridor.route}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          {corridor.distance}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">₹{corridor.avgPrice}</span>
                        <span className="text-[10px] text-slate-400 block">per seat</span>
                      </div>
                    </div>

           
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          {corridor.rideCount} {corridor.rideCount === 1 ? 'ride' : 'rides'} scheduled
                        </span>
                        <span className="font-medium text-emerald-700">
                          {fillPercent}% booked ({corridor.bookedSeats}/{corridor.totalSeats} seats)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Aggregating active intercity routes</span>
            <span className="font-medium text-slate-600">{corridorStats.length} Total Corridors Identified</span>
          </div>
        </div> */}

        {/* Right Column: Fleet Health & Seat Distribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Seat Distribution Breakdown */}
          {/* <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Seat Inventory Status</h2>
              </div>
              <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[10px] font-medium">
                {occupancyRate}% Utilization
              </span>
            </div>


            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Booked Seats
                  </span>
                  <span className="font-semibold text-slate-900">{bookedSeats} ({occupancyRate}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Available Seats
                  </span>
                  <span className="font-semibold text-slate-900">{availableSeats} ({100 - occupancyRate}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${100 - occupancyRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Active Scheduled Rides
                  </span>
                  <span className="font-semibold text-slate-900">{activeRides.length} Carpools</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.round((activeRides.length / (rides.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Need more capacity on busy routes?</span>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                + Add Ride
              </button>
            </div>
          </div> */}

          {/* Driver Compliance & Verification Status */}
          {/* <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Driver Compliance Funnel</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSubTab('verifications')}
                className="text-[11px] font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Audit KYC</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="text-base font-bold text-emerald-700">{verifiedDrivers.length}</div>
                <div className="text-[10px] font-medium text-emerald-600">Verified</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
                <div className="text-base font-bold text-amber-700">{pendingDrivers.length}</div>
                <div className="text-[10px] font-medium text-amber-600">Pending Review</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-base font-bold text-slate-700">{drivers.length}</div>
                <div className="text-[10px] font-medium text-slate-500">Total Fleet</div>
              </div>
            </div>

            {pendingDrivers.length > 0 && (
              <div className="rounded-xl bg-amber-50/90 border border-amber-200/80 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-normal text-amber-900">
                    {pendingDrivers.length} driver licenses need KYC approval
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateSubTab('verifications')}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs shrink-0 cursor-pointer transition-colors"
                >
                  Review
                </button>
              </div>
            )}
          </div> */}
        </div>
      </div>

      {/* Bottom Section: Recent Carpool Rides & Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Rides Table / Roster (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Carpool Rides</h2>
                <p className="text-[11px] text-slate-400">Live rides and upcoming scheduled departures</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSubTab('rides')}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All {rides.length} Rides</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRides.map(ride => (
              <div
                key={ride.id}
                onClick={() => onSelectRide(ride)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ride.driver.avatar}
                    alt={ride.driver.name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {ride.originCity} → {ride.destinationCity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ride.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : ride.status === 'completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-50 text-rose-600'
                        }`}>
                        {ride.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Driver: {ride.driver.name}</span>
                      <span>•</span>
                      <span>{ride.departureDate} at {ride.departureTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">₹{ride.pricePerSeat}</div>
                    <div className="text-[11px] text-emerald-600 font-medium">
                      {ride.availableSeats} of {ride.totalSeats} seats open
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Verified Drivers Roster (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Top Rated Drivers</h2>
                  <p className="text-[11px] text-slate-400">High safety and reliability records</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {topDrivers.map(driver => (
                <div
                  key={driver.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex items-center gap-3"
                >
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {driver.name}
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{driver.rating}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {driver.vehicleModel} • {driver.totalRides} trips
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateSubTab('verifications')}
            className="mt-4 w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Manage All {drivers.length} Drivers & KYC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
