import React from 'react';
import {
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  Star,
  ShieldCheck,
  Luggage
} from 'lucide-react';
import type { CarpoolRide } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface RideDetailModalProps {
  ride: CarpoolRide | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (rideId: string, newStatus: 'active' | 'completed' | 'cancelled') => void;
}

export const RideDetailModal: React.FC<RideDetailModalProps> = ({
  ride,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!ride) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carpool Ride Manifest"
      subtitle={`Ride ID: ${ride.id} • ${ride.originCity} to ${ride.destinationCity}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Route Header Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2">
              <Badge status={ride.status} size="md" />
              <span className="text-xs text-slate-500 font-normal">
                {ride.departureDate} at {ride.departureTime}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-normal">Rate per seat:</span>
              <div className="text-xl font-medium text-emerald-600">
                ₹{ride.pricePerSeat}
              </div>
            </div>
          </div>

          {/* Route timeline visualizer */}
          <div className="mt-5 space-y-4">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="h-10 w-0.5 bg-gradient-to-b from-emerald-300 to-slate-300" />
              </div>
              <div className="pt-0.5">
                <div className="text-sm font-medium text-slate-900">{ride.originCity}</div>
                <div className="text-xs text-slate-500 font-normal">{ride.originPoint}</div>
              </div>
            </div>

            {/* Waypoints */}
            {ride.waypoints.map((wp, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border border-slate-300 text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  </div>
                  <div className="h-10 w-0.5 bg-slate-200" />
                </div>
                <div className="pt-0.5">
                  <div className="text-xs font-normal text-slate-700">
                    Stopover: <span className="text-sky-700 font-medium">{wp.city}</span> ({wp.stopName})
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    Est. arrival {wp.estimatedTime}
                  </div>
                </div>
              </div>
            ))}

            {/* Destination */}
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 border border-rose-300 text-rose-600">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="pt-0.5">
                <div className="text-sm font-medium text-slate-900">{ride.destinationCity}</div>
                <div className="text-xs text-slate-500 font-normal">{ride.destinationPoint}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver & Vehicle Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-normal text-slate-400 uppercase tracking-wider mb-3">
              Driver Details
            </div>
            <div className="flex items-center gap-3">
              <img
                src={ride.driver.avatar}
                alt={ride.driver.name}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-800">
                    {ride.driver.name}
                  </span>
                  {ride.driver.verificationStatus === 'verified' && (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {ride.driver.rating}
                  </span>
                  <span>•</span>
                  <span>{ride.driver.totalRides} trips</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="text-slate-700 font-mono">{ride.driver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>License:</span>
                <span className="text-slate-700 font-mono">{ride.driver.drivingLicenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-emerald-600 capitalize font-medium">{ride.driver.verificationStatus}</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Ride Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-normal text-slate-400 uppercase tracking-wider mb-3">
              Vehicle & Ride Rules
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-indigo-600">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {ride.driver.vehicleModel}
                </div>
                <div className="text-xs text-slate-500">
                  Plate: <span className="font-mono text-slate-700">{ride.driver.vehiclePlate}</span> • {ride.driver.vehicleColor}
                </div>
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.hasAC ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                AC Available
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.allowPets ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Pets Allowed
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.maxTwoInBack ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Max 2 in Back Seat
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Luggage className="h-3.5 w-3.5 text-slate-400" />
                {ride.rules.luggageSize} Luggage
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Roster & Seat Occupancy */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-normal text-slate-500 uppercase tracking-wider">
              Booked Passengers ({ride.totalSeats - ride.availableSeats} of {ride.totalSeats} seats booked)
            </div>
            <span className="text-xs text-sky-600 font-medium">
              {ride.availableSeats} seats open
            </span>
          </div>

          {ride.passengers.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No passengers have booked yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ride.passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="text-xs font-medium text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400">Boarding at {p.pickupStop}</div>
                    </div>
                  </div>
                  <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                    {p.seatsBooked} seat{p.seatsBooked > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Operational Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            Ride Dispatch Controls
          </span>
          <div className="flex items-center gap-2.5">
            {ride.status === 'active' && (
              <>
                <button
                  onClick={() => {
                    onStatusChange(ride.id, 'completed');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-normal text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Trip Completed
                </button>
                <button
                  onClick={() => {
                    onStatusChange(ride.id, 'cancelled');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-normal text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Ride
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-normal text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
