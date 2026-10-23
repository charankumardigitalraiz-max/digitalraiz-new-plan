import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TripPlan, CarpoolRide } from '../../types';
import { Modal } from '../common/Modal';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  carpoolRides: CarpoolRide[];
  onAddTrip: (trip: TripPlan) => void;
}

export const CreateTripModal = ({
  isOpen,
  onClose,
  carpoolRides,
  onAddTrip
}: CreateTripModalProps) => {
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('2026-11-05');
  const [endDate, setEndDate] = useState('2026-11-09');
  const [estimatedBudget, setEstimatedBudget] = useState(350);
  const [category, setCategory] = useState<TripPlan['category']>('Roadtrip');
  const [maxTravelers, setMaxTravelers] = useState(4);
  const [linkedRideId, setLinkedRideId] = useState<string>(carpoolRides[0]?.id || '');

  // Waypoints
  const [waypointInputs, setWaypointInputs] = useState<string[]>(['', '']);

  const handleWaypointChange = (index: number, val: string) => {
    const updated = [...waypointInputs];
    updated[index] = val;
    setWaypointInputs(updated);
  };

  const addWaypoint = () => {
    setWaypointInputs([...waypointInputs, '']);
  };

  const removeWaypoint = (index: number) => {
    setWaypointInputs(waypointInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !origin || !destination) return;

    const validWaypoints = waypointInputs.filter(w => w.trim() !== '');

    const newTrip: TripPlan = {
      id: `trip-${Date.now().toString().slice(-4)}`,
      title,
      creatorName: 'Elena Rostova',
      creatorBio: 'Adventurer & cultural enthusiast',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      origin,
      destination,
      startDate,
      endDate,
      totalDays: 4,
      estimatedBudget: Number(estimatedBudget),
      currency: 'EUR',
      category,
      maxTravelers: Number(maxTravelers),
      joinedTravelers: [
        {
          id: 'usr-self',
          name: 'Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          joinedAt: 'Creator'
        }
      ],
      waypoints: validWaypoints.length > 0 ? validWaypoints : [origin, destination],
      linkedCarpoolRideId: linkedRideId || undefined,
      status: 'active',
      itinerary: [
        {
          dayNumber: 1,
          title: 'Departure & Gateway Tour',
          destination: origin,
          description: `Journey starts from ${origin}, scenic transit and initial check-in.`,
          highlights: ['Scenic departure', 'Route rendezvous']
        },
        {
          dayNumber: 2,
          title: 'Destination Exploration & Highlights',
          destination: destination,
          description: `Exploration of ${destination} highlights, local dining, photography spots.`,
          highlights: ['City landmarks', 'Night panorama']
        }
      ]
    };

    onAddTrip(newTrip);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Community Trip Blueprint"
      subtitle="Publish multi-stop travel itinerary and link carpooling rides for fellow travelers"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Trip Plan Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coastal Route & Concert Escape"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Trip Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              <option value="Roadtrip">Roadtrip</option>
              <option value="Music Tour">Music Tour</option>
              <option value="Nature & Trek">Nature & Trek</option>
              <option value="City Hopping">City Hopping</option>
              <option value="Weekend Escape">Weekend Escape</option>
            </select>
          </div>
        </div>

        {/* Origin & Final Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Starting Origin *</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Barcelona, Spain"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Final Destination *</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Valencia & Madrid"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Dates & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 border-t border-slate-100 pt-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Budget / person</label>
            <input
              type="number"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Max Travelers</label>
            <input
              type="number"
              min="2"
              max="10"
              value={maxTravelers}
              onChange={(e) => setMaxTravelers(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Link to Carpool Ride */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3.5">
          <label className="text-xs font-normal text-slate-700">
            Link to a Carpool Ride (So interested travelers can rideshare)
          </label>
          <select
            value={linkedRideId}
            onChange={(e) => setLinkedRideId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
          >
            <option value="">No linked carpool</option>
            {carpoolRides.map(r => (
              <option key={r.id} value={r.id}>
                {r.originCity} → {r.destinationCity} (Driver: {r.driver.name}, {r.availableSeats} open seats)
              </option>
            ))}
          </select>
        </div>

        {/* Waypoints */}
        <div className="border-t border-slate-100 pt-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-700">Trip Stopover Locations</span>
            <button
              type="button"
              onClick={addWaypoint}
              className="flex items-center gap-1 text-[11px] font-normal text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add Stop
            </button>
          </div>
          <div className="space-y-2">
            {waypointInputs.map((wp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Location Stop #${idx + 1}`}
                  value={wp}
                  onChange={(e) => handleWaypointChange(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none"
                />
                {waypointInputs.length > 1 && (
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

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
          >
            Publish Travel Itinerary
          </button>
        </div>
      </form>
    </Modal>
  );
};
