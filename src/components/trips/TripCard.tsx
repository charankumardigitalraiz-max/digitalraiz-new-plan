import {
  ArrowRight,
  Calendar,
  Car,
  Users,
  Eye,
  Trash2
} from 'lucide-react';
import type { TripPlan, CarpoolRide } from '../../types';
import { Badge } from '../common/Badge';

interface TripCardProps {
  trip: TripPlan;
  linkedRide?: CarpoolRide;
  onSelect: (trip: TripPlan) => void;
  onDelete: (id: string) => void;
}

export const TripCard = ({
  trip,
  linkedRide,
  onSelect,
  onDelete
}: TripCardProps) => {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-normal text-amber-700">
            {trip.category}
          </span>
          <Badge status={trip.status} />
        </div>

        {/* Title & Route */}
        <h3 className="text-sm font-medium tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
          {trip.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-800">
          <span>{trip.origin}</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span>{trip.destination}</span>
        </div>

        {/* Creator Info */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-xs">
          <img
            src={trip.creatorAvatar}
            alt={trip.creatorName}
            className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div className="truncate">
            <span className="text-slate-800 font-medium">{trip.creatorName}</span>
            <span className="text-[11px] text-slate-400 block truncate">{trip.creatorBio}</span>
          </div>
        </div>

        {/* Waypoints Preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {trip.waypoints.slice(0, 3).map((w, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-normal"
            >
              • {w}
            </span>
          ))}
          {trip.waypoints.length > 3 && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
              +{trip.waypoints.length - 3} more
            </span>
          )}
        </div>

        {/* Linked Carpool Ride */}
        {linkedRide && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 border border-emerald-100">
            <Car className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Linked Ride: {linkedRide.originCity} → {linkedRide.destinationCity} ({linkedRide.availableSeats} open seats)
            </span>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            {trip.totalDays} Days ({trip.startDate.slice(5)})
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            {trip.joinedTravelers.length} / {trip.maxTravelers} buddies
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Budget: </span>
            <span className="text-xs font-medium text-amber-600">
              ₹{trip.estimatedBudget}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelect(trip)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Inspect Itinerary"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(trip.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Trip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
