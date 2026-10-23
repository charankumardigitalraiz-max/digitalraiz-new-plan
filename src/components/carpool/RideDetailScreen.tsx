import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Car,
  User,
  ShieldCheck,
  Star,
  Luggage,
  CheckCircle2,
  XCircle,
  Trash2,
  Share2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  CreditCard,
  Users
} from 'lucide-react';
import type { CarpoolRide, BackendPassenger } from '../../types';
import { carpoolService } from '../../services';
import { Badge } from '../common/Badge';

interface RideDetailScreenProps {
  rides: CarpoolRide[];
  onStatusChange: (rideId: string, newStatus: 'active' | 'completed' | 'cancelled') => void;
  onDeleteRide: (rideId: string) => void;
}

export const RideDetailScreen: React.FC<RideDetailScreenProps> = ({
  rides,
  onStatusChange,
  onDeleteRide
}) => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [backendPassengerList, setBackendPassengerList] = useState<BackendPassenger[]>([]);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | string | null>(null);

  const ride = rides.find((r) => r.id === rideId);

  useEffect(() => {
    if (rideId) {
      carpoolService.getRideById(rideId).then((res) => {
        if (res?.data?.passengerList && Array.isArray(res.data.passengerList)) {
          setBackendPassengerList(res.data.passengerList);
        }
      }).catch(() => {});
    }
  }, [rideId]);

  const handleCancelBooking = async (bookingId: number | string) => {
    if (!window.confirm(`Cancel booking #${bookingId} and restore seat allocation back to this ride?`)) return;
    try {
      setCancellingBookingId(bookingId);
      await carpoolService.cancelBooking(bookingId);
      setBackendPassengerList((prev) =>
        prev.map((p) => (p.bookingId === bookingId ? { ...p, bookingStatus: 'cancelled' } : p))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyLicense = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  const handleDelete = () => {
    if (!ride) return;
    if (window.confirm(`Are you sure you want to remove ride #${ride.id} (${ride.originCity} to ${ride.destinationCity})?`)) {
      onDeleteRide(ride.id);
      navigate('/carpooling/rides');
    }
  };

  if (!ride) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/carpooling/rides')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Carpool Network</span>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Car className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Ride Manifest Not Found</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            The carpool ride with ID "{rideId}" could not be located or has been archived from the fleet.
          </p>
          <button
            onClick={() => navigate('/carpooling/rides')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Live Rides
          </button>
        </div>
      </div>
    );
  }

  const bookedSeats = ride.totalSeats - ride.availableSeats;
  const occupancyPercentage = Math.round((bookedSeats / ride.totalSeats) * 100);
  const totalRevenue = bookedSeats * ride.pricePerSeat;

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Back Button */}
        <Link
          to="/carpooling/rides"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
          <span>Back</span>
        </Link>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            title="Copy Direct Link to this Manifest"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-2xs hover:bg-rose-100 transition-all cursor-pointer"
            title="Delete this ride"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Screen Header & Dispatch Controls */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge status={ride.status} size="md" />
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                ID: {ride.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {ride.departureDate}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {ride.departureTime}
              </span>
            </div>

            <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900">
              {ride.originCity} <span className="text-slate-400 font-normal">→</span> {ride.destinationCity}
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              Intercity route departing from <span className="text-slate-700 font-medium">{ride.originPoint}</span>, scheduled for drop-off at <span className="text-slate-700 font-medium">{ride.destinationPoint}</span>.
            </p>
          </div>

          {/* Operational Status Transitions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {ride.status === 'active' && (
              <>
                <button
                  onClick={() => onStatusChange(ride.id, 'completed')}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Mark Trip Completed
                </button>
                <button
                  onClick={() => onStatusChange(ride.id, 'cancelled')}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-rose-600" />
                  Cancel Ride
                </button>
              </>
            )}

            {ride.status !== 'active' && (
              <button
                onClick={() => onStatusChange(ride.id, 'active')}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-700 shadow-2xs hover:bg-indigo-100 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Reactivate Ride
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rate Per Seat
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            ₹{ride.pricePerSeat}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Base fare per passenger seat
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Seat Occupancy
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {bookedSeats} / {ride.totalSeats} <span className="text-xs text-slate-400 font-normal">({occupancyPercentage}%)</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {ride.availableSeats === 0 ? 'Vehicle fully booked' : `${ride.availableSeats} open seat(s) remaining`}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Manifest Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            ₹{totalRevenue}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Current booking yield to date
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Driver Rating
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xl font-semibold tracking-tight text-slate-900">
            <span>{ride.driver.rating}</span>
            <span className="text-xs text-amber-500 font-medium">★</span>
            <span className="text-xs text-slate-400 font-normal ml-1">({ride.driver.totalRides} trips)</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 capitalize">
            {ride.driver.verificationStatus} driver partner
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Route Timeline & Passenger Manifest */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route & Stopover Itinerary */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Route & Stopover Itinerary
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed route navigation checkpoints and estimated milestone arrivals
                </p>
              </div>
              <span className="rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {ride.waypoints.length} waypoint{ride.waypoints.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-6 pl-2">
              {/* Origin */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 shadow-2xs">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="h-12 w-0.5 bg-gradient-to-b from-emerald-400 to-indigo-300" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      Departure Origin
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      {ride.departureTime}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-0.5">
                    {ride.originCity}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ride.originPoint}
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              {ride.waypoints.map((wp, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 border-2 border-sky-400 text-sky-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    </div>
                    <div className="h-12 w-0.5 bg-slate-200" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-sky-700">
                        Stopover #{index + 1}: {wp.city}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Est. {wp.estimatedTime}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {wp.stopName}
                    </div>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 border-2 border-rose-500 text-rose-700 shadow-2xs">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                      Final Destination
                    </span>
                    <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                      Terminal Drop
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-0.5">
                    {ride.destinationCity}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ride.destinationPoint}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booked Passengers & Seat Allocation */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Passenger Roster & Manifest
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirmed passenger seat reservations and pickup points
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-700">
                  {bookedSeats} / {ride.totalSeats} Booked
                </span>
              </div>
            </div>

            {/* Visual Seat Representation */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 mb-5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2.5">
                Vehicle Seat Map
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Driver Seat */}
                <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 font-medium">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Driver ({ride.driver.name.split(' ')[0]})</span>
                </div>

                {/* Passenger Seats */}
                {Array.from({ length: ride.totalSeats }).map((_, i) => {
                  const isBooked = i < bookedSeats;
                  const passenger = ride.passengers[i];
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${isBooked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium'
                        : 'border-dashed border-slate-300 bg-white text-slate-400'
                        }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isBooked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>
                        Seat #{i + 1}: {isBooked ? (passenger ? passenger.name.split(' ')[0] : 'Reserved') : 'Open'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passenger Cards */}
            {backendPassengerList.length > 0 ? (
              <div className="space-y-3">
                {backendPassengerList.map((passenger) => (
                  <div
                    key={passenger.bookingId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white p-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {passenger.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{passenger.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              passenger.bookingStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {passenger.bookingStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{passenger.phone}</span>
                          <span>•</span>
                          <span>{passenger.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>
                            From: <strong className="text-slate-700 font-medium">{passenger.from}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-right">
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 font-mono text-xs font-medium text-indigo-700">
                          {passenger.seatsBooked} Seat{passenger.seatsBooked > 1 ? 's' : ''}
                        </span>
                        <div className="text-[11px] text-emerald-600 font-medium mt-1">
                          Paid ₹{passenger.totalAmount} ({passenger.paymentStatus})
                        </div>
                      </div>

                      {passenger.bookingStatus !== 'cancelled' && (
                        <button
                          type="button"
                          disabled={cancellingBookingId === passenger.bookingId}
                          onClick={() => handleCancelBooking(passenger.bookingId)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {cancellingBookingId === passenger.bookingId ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : ride.passengers.length === 0 ? (
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-6 text-center">
                <Users className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="mt-2 text-xs font-medium text-slate-700">No Passengers Booked Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Seats are currently open on this route for commuter reservations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ride.passengers.map((passenger, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white p-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={passenger.avatar}
                        alt={passenger.name}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {passenger.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          <span>Boarding: <strong className="text-slate-700 font-medium">{passenger.pickupStop}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-right">
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 font-mono text-xs font-medium text-indigo-700">
                          {passenger.seatsBooked} Seat{passenger.seatsBooked > 1 ? 's' : ''}
                        </span>
                        <div className="text-[11px] text-emerald-600 font-medium mt-1">
                          Paid ₹{passenger.seatsBooked * ride.pricePerSeat}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Driver Profile, Vehicle Details & Compliance */}
        <div className="space-y-6">
          {/* Driver Profile Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Driver Profile
              </span>
              {ride.driver.verificationStatus === 'verified' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  KYC Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src={ride.driver.avatar}
                alt={ride.driver.name}
                className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {ride.driver.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {ride.driver.rating}
                  </span>
                  <span>•</span>
                  <span>{ride.driver.totalRides} trips</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Partner since {ride.driver.joinedDate}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone
                </span>
                <span className="font-mono text-slate-700 font-medium">{ride.driver.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </span>
                <span className="text-slate-700 truncate max-w-[150px]">{ride.driver.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> Driving License
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-700 font-medium">{ride.driver.drivingLicenseNumber}</span>
                  <button
                    onClick={() => handleCopyLicense(ride.driver.drivingLicenseNumber)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Copy License Number"
                  >
                    {copiedLicense ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <Link
              to="/carpooling/verifications"
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>View Driver KYC Document</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </Link>
          </div>

          {/* Vehicle Specifications & Ride Rules */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vehicle & Travel Rules
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {ride.driver.vehicleModel}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Plate: <span className="font-mono text-slate-800 font-medium">{ride.driver.vehiclePlate}</span> • {ride.driver.vehicleColor}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.hasAC ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>AC Available</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.allowPets ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Pets Allowed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${ride.rules.maxTwoInBack ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Max 2 In Back</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Luggage className="h-3.5 w-3.5 text-slate-400" />
                <span className="capitalize">{ride.rules.luggageSize} Luggage</span>
              </div>
            </div>
          </div>

          {/* Platform Safety Guarantee Notice */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-xs text-emerald-800">
            <div className="flex items-center gap-1.5 font-medium text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Platform Protection Active</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 leading-relaxed">
              Every passenger seat is covered under platform trip transit protection. In-transit emergency dispatch contacts are verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
