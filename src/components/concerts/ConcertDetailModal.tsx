import {
  Calendar,
  MapPin,
  Car
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface ConcertDetailModalProps {
  concert: ConcertEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: 'active' | 'upcoming' | 'completed' | 'cancelled') => void;
}

export const ConcertDetailModal = ({
  concert,
  isOpen,
  onClose,
  onStatusChange
}: ConcertDetailModalProps) => {
  if (!concert) return null;

  const soldPercentage = Math.round((concert.ticketsSold / concert.totalCapacity) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concert Event Manifest"
      subtitle={`Event ID: ${concert.id} • ${concert.title}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Event Visual Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={concert.image}
            alt={concert.title}
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-5">
            <div className="text-white">
              <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-normal">
                {concert.genre}
              </span>
              <h2 className="text-lg font-medium tracking-tight mt-1">
                {concert.title}
              </h2>
              <p className="text-xs text-slate-200 font-normal">
                Featuring {concert.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Date, Location, and Status Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Event Date</span>
            </div>
            <div className="text-xs font-medium text-slate-900">
              {concert.date}
            </div>
            <div className="text-[11px] text-slate-400">
              Doors open: {concert.doorsOpen}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Venue & City</span>
            </div>
            <div className="text-xs font-medium text-slate-900 truncate">
              {concert.venueName}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {concert.city}, {concert.country}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Car className="h-4 w-4 text-sky-600" />
              <span>Mobility Link</span>
            </div>
            <div className="text-xs font-medium text-sky-700">
              {concert.connectedRidesCount} Carpool Rides
            </div>
            <div className="text-[11px] text-slate-400">
              Fans sharing rides to venue
            </div>
          </div>
        </div>

        {/* Ticket Sales Capacity Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium text-slate-800">
              Ticket Sales & Crowd Capacity
            </span>
            <span className="text-purple-600 font-medium">
              {concert.ticketsSold.toLocaleString()} / {concert.totalCapacity.toLocaleString()} ({soldPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>

        {/* Ticket Tiers Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-800 mb-3 uppercase tracking-wider">
            Ticket Tiers & Allocations
          </div>
          <div className="space-y-2.5">
            {concert.ticketTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs"
              >
                <div>
                  <div className="font-medium text-slate-800">{tier.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {tier.available.toLocaleString()} tickets remaining of {tier.total.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-purple-700">
                    ₹{tier.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Badge status={concert.status} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStatusChange(concert.id, concert.status === 'active' ? 'cancelled' : 'active');
                onClose();
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {concert.status === 'active' ? 'Archive Event' : 'Reactivate Event'}
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
