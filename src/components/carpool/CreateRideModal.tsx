import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CarpoolRide, Driver } from '../../types';
import { Modal } from '../common/Modal';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  onAddRide: (ride: CarpoolRide) => void;
}

export const CreateRideModal: React.FC<CreateRideModalProps> = ({
  isOpen,
  onClose,
  drivers,
  onAddRide
}) => {
  const verifiedDrivers = drivers.filter(d => d.verificationStatus === 'verified');

  const [originCity, setOriginCity] = useState('');
  const [originPoint, setOriginPoint] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationPoint, setDestinationPoint] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-11-01');
  const [departureTime, setDepartureTime] = useState('09:00 AM');
  const [driverId, setDriverId] = useState(verifiedDrivers[0]?.id || drivers[0]?.id || '');
  const [totalSeats, setTotalSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(30);
  const [currency, setCurrency] = useState('INR');

  // Waypoint stops
  const [waypoints, setWaypoints] = useState<{ city: string; stopName: string; estimatedTime: string }[]>([
    { city: '', stopName: '', estimatedTime: '' }
  ]);

  // Rules
  const [hasAC, setHasAC] = useState(true);
  const [allowPets, setAllowPets] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [maxTwoInBack, setMaxTwoInBack] = useState(true);
  const [luggageSize, setLuggageSize] = useState<'small' | 'medium' | 'large'>('medium');

  const addWaypoint = () => {
    setWaypoints([...waypoints, { city: '', stopName: '', estimatedTime: '' }]);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleWaypointChange = (index: number, field: string, value: string) => {
    const updated = [...waypoints];
    updated[index] = { ...updated[index], [field]: value };
    setWaypoints(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCity || !destinationCity) return;

    const selectedDriver = drivers.find(d => d.id === driverId) || drivers[0];
    const filteredWaypoints = waypoints.filter(wp => wp.city.trim() !== '');

    const newRide: CarpoolRide = {
      id: `ride-${Date.now().toString().slice(-4)}`,
      originCity,
      originPoint: originPoint || `${originCity} Central Hub`,
      destinationCity,
      destinationPoint: destinationPoint || `${destinationCity} Main Terminal`,
      departureDate,
      departureTime,
      driver: selectedDriver,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      pricePerSeat: Number(pricePerSeat),
      currency,
      status: 'active',
      waypoints: filteredWaypoints,
      rules: {
        hasAC,
        allowPets,
        allowSmoking,
        maxTwoInBack,
        luggageSize
      },
      passengers: []
    };

    onAddRide(newRide);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish New Carpool Ride"
      subtitle="Dispatch a verified intercity rideshare route on the global network"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Origin & Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Departure City *</label>
            <input
              type="text"
              required
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="e.g. Amsterdam"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Origin Pickup Point</label>
            <input
              type="text"
              value={originPoint}
              onChange={(e) => setOriginPoint(e.target.value)}
              placeholder="e.g. Central Station North Exit"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Arrival City *</label>
            <input
              type="text"
              required
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="e.g. Frankfurt"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Destination Dropoff Point</label>
            <input
              type="text"
              value={destinationPoint}
              onChange={(e) => setDestinationPoint(e.target.value)}
              placeholder="e.g. Hauptbahnhof South Gate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Departure Date & Time & Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Date *</label>
            <input
              type="date"
              required
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Departure Time</label>
            <input
              type="text"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="08:30 AM"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Assign Driver *</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id} className="bg-white text-slate-800">
                  {d.name} ({d.vehicleModel} - {d.verificationStatus})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Total Seats</label>
            <input
              type="number"
              min="1"
              max="8"
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Price per Seat</label>
            <input
              type="number"
              min="1"
              value={pricePerSeat}
              onChange={(e) => setPricePerSeat(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Intermediate Stopovers / Waypoints */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-700">Route Waypoints / Stopovers</span>
            <button
              type="button"
              onClick={addWaypoint}
              className="flex items-center gap-1 text-[11px] font-normal text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add Stopover
            </button>
          </div>
          <div className="space-y-2">
            {waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Stopover City (e.g. Utrecht)"
                  value={wp.city}
                  onChange={(e) => handleWaypointChange(idx, 'city', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pickup Spot (e.g. Highway Stop)"
                  value={wp.stopName}
                  onChange={(e) => handleWaypointChange(idx, 'stopName', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Est. Time"
                  value={wp.estimatedTime}
                  onChange={(e) => handleWaypointChange(idx, 'estimatedTime', e.target.value)}
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                {waypoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWaypoint(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ride Amenities */}
        <div className="border-t border-slate-100 pt-4">
          <span className="text-xs font-normal text-slate-700 block mb-2">Ride Policies</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAC}
                onChange={(e) => setHasAC(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0"
              />
              Air Conditioning
            </label>
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPets}
                onChange={(e) => setAllowPets(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0"
              />
              Pets Welcome
            </label>
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={allowSmoking}
                onChange={(e) => setAllowSmoking(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0"
              />
              Smoking Allowed
            </label>
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={maxTwoInBack}
                onChange={(e) => setMaxTwoInBack(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0"
              />
              Max 2 in Back
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Luggage:</span>
              <select
                value={luggageSize}
                onChange={(e) => setLuggageSize(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-normal text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
          >
            Publish Ride to Network
          </button>
        </div>
      </form>
    </Modal>
  );
};
