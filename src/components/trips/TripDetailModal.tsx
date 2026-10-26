import {
  Calendar,
  MapPin,
  Car,
  Users
} from 'lucide-react';
import type { TripPlan, CarpoolRide } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface TripDetailModalProps {
  trip: TripPlan | null;
  isOpen: boolean;
  onClose: () => void;
  linkedRide?: CarpoolRide;
  onSelectRide?: (ride: CarpoolRide) => void;
}

export const TripDetailModal = ({
  trip,
  isOpen,
  onClose,
  linkedRide,
  onSelectRide
}: TripDetailModalProps) => {
  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trip Itinerary Blueprint"
      subtitle={`Trip ID: ${trip.id} • ${trip.origin} to ${trip.destination}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-700 font-normal">
                {trip.category}
              </span>
              <Badge status={trip.status} />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Est. Budget per traveler:</span>
              <div className="text-base font-medium text-amber-600">
                ₹{trip.estimatedBudget}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{trip.startDate} to {trip.endDate} ({trip.totalDays} Days)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>{trip.joinedTravelers.length} of {trip.maxTravelers} buddies joined</span>
            </div>
          </div>
        </div>

        {/* Creator & Linked Carpool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Creator Profile */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-[11px] font-normal text-slate-400 uppercase tracking-wider mb-2.5">
              Itinerary Organizer
            </div>
            <div className="flex items-center gap-3">
              <img
                src={trip.creatorAvatar}
                alt={trip.creatorName}
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div>
                <div className="text-xs font-medium text-slate-900">{trip.creatorName}</div>
                <div className="text-[11px] text-slate-500 font-normal line-clamp-1">{trip.creatorBio}</div>
              </div>
            </div>
          </div>

          {/* Connected Carpool ride */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-[11px] font-normal text-slate-400 uppercase tracking-wider mb-2.5">
              Linked Carpool Ride
            </div>
            {linkedRide ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{linkedRide.originCity} → {linkedRide.destinationCity}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Driver: {linkedRide.driver.name} ({linkedRide.availableSeats} seats left)
                  </div>
                </div>
                {onSelectRide && (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectRide(linkedRide);
                    }}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    View Ride
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No direct carpool ride linked yet.</p>
            )}
          </div>
        </div>

        {/* Waypoint Route Highlights */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-normal text-slate-400 uppercase tracking-wider mb-2.5">
            Key Stops & Destinations Uploaded
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.waypoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 font-normal"
              >
                <MapPin className="h-3 w-3 text-amber-500" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Day-by-Day Detailed Itinerary */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="text-[11px] font-normal text-slate-400 uppercase tracking-wider">
            Day-by-Day Plan Timeline
          </div>

          <div className="space-y-4">
            {trip.itinerary.map((day) => (
              <div key={day.dayNumber} className="border-l-2 border-indigo-200 pl-4 space-y-1 relative">
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-indigo-700">Day {day.dayNumber}:</span>
                  <span className="text-xs font-medium text-slate-900">{day.title}</span>
                  <span className="text-[11px] text-slate-400">({day.destination})</span>
                </div>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  {day.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {day.highlights.map((h, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-normal"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Joined Travel Companions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-normal text-slate-400 uppercase tracking-wider mb-3">
            Joined Travel Buddies ({trip.joinedTravelers.length} / {trip.maxTravelers})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {trip.joinedTravelers.map((traveler) => (
              <div
                key={traveler.id}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs"
              >
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="text-xs font-medium text-slate-800">{traveler.name}</div>
                  <div className="text-[10px] text-slate-400">{traveler.joinedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            Close Itinerary
          </button>
        </div>
      </div>
    </Modal>
  );
};
