import React, { useState, useMemo } from 'react';
import {
  Music,
  Calendar,
  Ticket,
  TrendingUp,
  MapPin,
  Building2,
  Plus,
  ArrowRight,
  Eye,
  Volume2
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { ConcertAnalyticsCharts, type Timeframe } from './ConcertAnalyticsCharts';

interface ConcertsOverviewProps {
  concerts: ConcertEvent[];
  onNavigateSubTab: (subTab: 'overview' | 'all-concerts' | 'venues' | 'artists') => void;
  onSelectConcert: (concert: ConcertEvent) => void;
  onOpenUploadModal: () => void;
}

export const ConcertsOverview: React.FC<ConcertsOverviewProps> = ({
  concerts,
  onNavigateSubTab,
  onSelectConcert,
  onOpenUploadModal
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');

  // High level metrics
  const activeEvents = useMemo(() => concerts.filter(c => c.status === 'active'), [concerts]);
  const totalCapacity = useMemo(() => concerts.reduce((sum, c) => sum + c.totalCapacity, 0), [concerts]);
  const totalTicketsSold = useMemo(() => concerts.reduce((sum, c) => sum + c.ticketsSold, 0), [concerts]);

  // Financial calculations
  const totalGMV = useMemo(() => {
    return concerts.reduce((acc, c) => {
      const avgPrice = (c.minPrice + c.maxPrice) / 2;
      return acc + (c.ticketsSold * avgPrice);
    }, 0);
  }, [concerts]);

  const avgTicketPrice = totalTicketsSold > 0 ? Math.round(totalGMV / totalTicketsSold) : 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

  // Format GMV nicely
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Featured Arenas & Stadiums
  const venueStats = [
    {
      name: 'Narendra Modi Stadium',
      city: 'Ahmedabad',
      capacity: 74000,
      ticketsSold: 71800,
      fillRate: 97,
      soundSystem: 'L-Acoustics K1 Stadium Array',
      headliner: 'Coldplay • Music of the Spheres',
      status: 'Ready'
    },
    {
      name: 'Jawaharlal Nehru Stadium',
      city: 'Delhi',
      capacity: 45000,
      ticketsSold: 41200,
      fillRate: 91,
      soundSystem: 'd&b audiotechnik GSL System',
      headliner: 'Diljit Dosanjh • Dil-Luminati Tour',
      status: 'Ready'
    },
    {
      name: 'Jio World Garden',
      city: 'Mumbai',
      capacity: 22000,
      ticketsSold: 19800,
      fillRate: 90,
      soundSystem: 'Meyer Sound PANTHER Line Array',
      headliner: 'Dua Lipa • Radical Optimism',
      status: 'Ready'
    },

  ];

  // Top Trending Concerts
  const topConcerts = useMemo(() => {
    return [...concerts]
      .sort((a, b) => (b.ticketsSold / b.totalCapacity) - (a.ticketsSold / a.totalCapacity))
      .slice(0, 4);
  }, [concerts]);

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
            Concerts & Live Events Overview
          </h1>
          <p className="text-[13px] font-normal text-slate-500 mt-1 max-w-2xl">
            Real-time ticketing velocity, arena capacity utilization, genre demand analytics, and stadium manifests.
          </p>
        </div>

        {/* Action Controls & Timeframe Selector */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Timeframe pill selector */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs font-medium text-slate-600">
            {(['7D', '30D', '90D', '12M'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${timeframe === tf
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-100 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Concert Event</span>
          </button>
        </div>
      </div>

      {/* Top Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Box Office (GMV)"
          value={formatCurrency(totalGMV)}
          isPositive={true}
          subtext="Total ticket gross volume"
          icon={TrendingUp}
          accentColor="purple"
        />
        <MetricCard
          label="Active Events & Concerts"
          value={activeEvents.length}
          isPositive={true}
          subtext="Scheduled across major cities"
          icon={Music}
          accentColor="indigo"
        />
        <MetricCard
          label="Tickets Issued"
          value={totalTicketsSold.toLocaleString()}
          isPositive={true}
          subtext={`${totalCapacity.toLocaleString()} total indexed seats`}
          icon={Ticket}
          accentColor="emerald"
        />
        <MetricCard
          label="Avg. Ticket Price"
          value={`₹${avgTicketPrice.toLocaleString()}`}
          isPositive={true}
          subtext="Across GA and VIP ticket tiers"
          icon={Calendar}
          accentColor="cyan"
        />
      </div>

      {/* Main Analytics Section: ConcertAnalyticsCharts Component */}
      <ConcertAnalyticsCharts
        concerts={concerts}
        timeframe={timeframe}
        totalTicketsSold={totalTicketsSold}
        avgTicketPrice={avgTicketPrice}
        occupancyRate={occupancyRate}
        formatCurrency={formatCurrency}
      />

      {/* Middle Section: Top Demand Tours Leaderboard & Featured Arenas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demand Tours Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-semibold text-slate-900">High-Demand Tour Manifest</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fastest-selling tours ranked by stadium capacity utilization
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSubTab('all-concerts')}
              className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Manifest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tour Items List */}
          <div className="space-y-3">
            {topConcerts.map((concert) => {
              const percentSold = Math.round((concert.ticketsSold / concert.totalCapacity) * 100);
              return (
                <div
                  key={concert.id}
                  onClick={() => onSelectConcert(concert)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50/50 hover:bg-white hover:shadow-2xs transition-all gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={concert.image}
                      alt={concert.title}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                          {concert.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                          {concert.genre}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 truncate">
                        <span className="font-medium text-slate-700 shrink-0">{concert.artist}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{concert.venueName}, {concert.city}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side stats: Progress bar & Action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="w-28 sm:w-32">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-800">{percentSold}% Sold</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{ width: `${percentSold}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConcert(concert);
                      }}
                      className="p-1.5 rounded-md bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-2xs transition-all duration-200 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Stadiums & Arenas (1 Col) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-semibold text-slate-900">Featured Stadiums & Arenas</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSubTab('venues')}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
              >
                All Venues
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Soundstage management, capacity & upcoming headliners
            </p>

            <div className="space-y-3 mt-4">
              {venueStats.map((venue, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{venue.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {venue.fillRate}% Capacity
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {venue.city}
                    </span>
                    <span className="text-slate-600 font-medium truncate max-w-[150px]">
                      {venue.headliner.split('•')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{venue.soundSystem}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${venue.fillRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
