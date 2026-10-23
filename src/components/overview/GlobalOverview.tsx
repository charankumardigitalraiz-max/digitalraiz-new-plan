import {
  Car,
  Music,
  Compass,
  ShieldCheck,
  Globe2,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Ticket,
  CreditCard,
  Users
} from 'lucide-react';
import type { CarpoolRide, ConcertEvent, TripPlan, Driver, NavigationTab } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { EcosystemCharts } from './EcosystemCharts';
import { ModuleAnalyticsCharts } from './ModuleAnalyticsCharts';

interface GlobalOverviewProps {
  rides: CarpoolRide[];
  concerts: ConcertEvent[];
  trips: TripPlan[];
  drivers: Driver[];
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenCreateRide: () => void;
  onOpenUploadConcert: () => void;
  onOpenCreateTrip: () => void;
}

export const GlobalOverview = ({
  rides,
  concerts,
  trips,
  drivers,
  onNavigateTab,
  onOpenCreateRide,
  onOpenUploadConcert,
  onOpenCreateTrip
}: GlobalOverviewProps) => {
  const activeRides = rides.filter(r => r.status === 'active');
  const pendingDrivers = drivers.filter(d => d.verificationStatus === 'pending');
  const totalTicketsSold = concerts.reduce((a, b) => a + b.ticketsSold, 0);
  const totalBuddiesJoined = trips.reduce((a, b) => a + b.joinedTravelers.length, 0);
  const totalSeatsBooked = rides.reduce((sum, r) => sum + (r.totalSeats - r.availableSeats), 0);
  const avgRidePrice = rides.length > 0
    ? Math.round(rides.reduce((sum, r) => sum + r.pricePerSeat, 0) / rides.length)
    : 35;

  return (
    <div className="space-y-4">
      {/* Screen Title & Subtitle Banner Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Key metrics and live activity across your network
          </p>
        </div>

        {/* Real-time System Pulse Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-emerald-50 border border-emerald-200/90 rounded-full px-3 py-1 text-xs font-medium text-emerald-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>All Services Operational</span>
        </div>
      </div>
      {/* <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30 p-6 md:p-8 shadow-2xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3 py-1 text-xs font-normal text-indigo-700 mb-3 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Ecosystem Command Center Active</span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Global Mobility, Live Music & Travel Itineraries
          </h2>
          <p className="mt-1.5 text-xs md:text-sm font-normal text-slate-500 leading-relaxed">
            Unifying intercity carpool rideshare routes, world concert stadium tours, and community travel plans into a synchronized worldwide platform.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCreateRide}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
            >
              <Car className="h-3.5 w-3.5" />
              <span>Dispatch Carpool</span>
            </button>
            <button
              onClick={onOpenUploadConcert}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
            >
              <Music className="h-3.5 w-3.5" />
              <span>Upload Concert</span>
            </button>
            <button
              onClick={onOpenCreateTrip}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Create Trip Plan</span>
            </button>
          </div>
        </div>

     
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Globe2 className="h-72 w-72 text-indigo-900" />
        </div>
      </div> */}

      {/* Core Ecosystem Metrics (Operations & Performance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Operations */}
        <MetricCard
          label="Active Carpools"
          value={activeRides.length}
          icon={Car}
          accentColor="emerald"
        />
        {/* <MetricCard
          label="Live Concert Stages"
          value={concerts.length}
          icon={Music}
          accentColor="purple"
        /> */}
        <MetricCard
          label="Community Trip Plans"
          value={trips.length}
          icon={Compass}
          accentColor="amber"
        />
        {/* <MetricCard
          label="Driver Verification Queue"
          value={`${pendingDrivers.length}`}
          icon={ShieldCheck}
          accentColor={pendingDrivers.length > 0 ? "amber" : "cyan"}
        /> */}

        {/* Row 2: Performance & Revenue Stats */}
        <MetricCard
          label="Gross Platform GMV"
          value="₹2,34,000"
          icon={TrendingUp}
          accentColor="indigo"
        />
        {/* <MetricCard
          label="Passenger Seats Booked"
          value={`${totalSeatsBooked} Seats`}
          icon={Users}
          accentColor="emerald"
        /> */}
        {/* <MetricCard
          label="Concert Tickets Sold"
          value={totalTicketsSold.toLocaleString()}
          icon={Ticket}
          accentColor="purple"
        /> */}
        <MetricCard
          label="Average Seat Fare"
          value={`₹${avgRidePrice}`}
          icon={CreditCard}
          accentColor="cyan"
        />
      </div>







      {/* Three Pillars Overview Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
     
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Car className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Carpool Rides</h3>
              </div>
              <button
                onClick={() => onNavigateTab('carpooling')}
                className="flex items-center font-semibold gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {rides.slice(0, 3).map(ride => (
                <div key={ride.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span>{ride.originCity} → {ride.destinationCity}</span>
                    <span className="text-emerald-600 font-medium">
                      ₹{ride.pricePerSeat}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Driver: {ride.driver.name}</span>
                    <span className="text-sky-600">{ride.availableSeats} of {ride.totalSeats} seats open</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified routes active</span>
            <span className="text-emerald-700 font-medium">{activeRides.length} Live on grid</span>
          </div>
        </div>

       
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <Music className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Music Festivals & Shows</h3>
              </div>
              <button
                onClick={() => onNavigateTab('concerts')}
                className="flex items-center font-semibold gap-1 text-[11px] text-purple-700 hover:text-purple-800 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {concerts.slice(0, 3).map(concert => (
                <div key={concert.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="truncate max-w-[170px]">{concert.title}</span>
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700 font-normal">
                      {concert.genre}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{concert.city} • {concert.date.slice(5)}</span>
                    <span className="text-purple-700 font-medium">
                      {Math.round((concert.ticketsSold / concert.totalCapacity) * 100)}% sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Stadiums & Arenas</span>
            <span className="text-purple-700 font-medium">{concerts.length} Tours Listed</span>
          </div>
        </div>

      
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Trip Planner Itineraries</h3>
              </div>
              <button
                onClick={() => onNavigateTab('trips')}
                className="flex items-center font-semibold gap-1 text-[11px] text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {trips.slice(0, 3).map(trip => (
                <div key={trip.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="truncate max-w-[170px]">{trip.title}</span>
                    <span className="text-amber-700 font-medium">
                      ₹{trip.estimatedBudget}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{trip.totalDays} Days • {trip.category}</span>
                    <span className="text-sky-600">{trip.joinedTravelers.length} buddies joined</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Community Curations</span>
            <span className="text-amber-700 font-medium">{trips.length} Expeditions</span>
          </div>
        </div>
      </div> */}










      {/* Ecosystem Analytical Graphs & Category Distribution */}
      <EcosystemCharts
        rides={rides}
        concerts={concerts}
        trips={trips}
      />

      {/* Deep-Dive Module Analytics, Corridors & System Health Gauges */}
      <ModuleAnalyticsCharts
        rides={rides}
        concerts={concerts}
        trips={trips}
        drivers={drivers}
      />


      {/* Live System Activity Feed */}
      {/* <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-800">Live Ecosystem Activity Feed</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time sync</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <div className="flex-1">
              <span className="font-medium text-slate-800">Julian Vance</span> published a new carpool route from <span className="text-slate-800 font-medium">Paris to Brussels</span> with stops at Compiègne and Lille.
              <span className="text-[11px] text-slate-400 ml-2">12m ago</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
            <div className="flex-1">
              <span className="font-medium text-slate-800">LiveNation Global</span> updated ticket tiers for <span className="text-slate-800 font-medium">Anyma & Tale of Us at Accor Arena</span> with 42 connected carpool rides.
              <span className="text-[11px] text-slate-400 ml-2">45m ago</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
            <div className="flex-1">
              <span className="font-medium text-slate-800">Maya Lin</span> uploaded the <span className="text-slate-800 font-medium">Pacific Coast Highway Expedition</span> itinerary, linking it with Marcus Chen's SF to LA carpool ride.
              <span className="text-[11px] text-slate-400 ml-2">1h ago</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
            <div className="flex-1">
              <span className="font-medium text-slate-800">Sofia Al-Mansoor</span> submitted verification documents (Emirates ID & Volvo XC60) for driver audit.
              <span className="text-[11px] text-slate-400 ml-2">2h ago</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};
