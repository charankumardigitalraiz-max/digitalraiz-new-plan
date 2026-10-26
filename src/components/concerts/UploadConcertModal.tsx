import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { Modal } from '../common/Modal';

interface UploadConcertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConcert: (concert: ConcertEvent) => void;
}

export const UploadConcertModal = ({
  isOpen,
  onClose,
  onAddConcert
}: UploadConcertModalProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState<ConcertEvent['genre']>('EDM');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [doorsOpen, setDoorsOpen] = useState('18:00');
  const [totalCapacity, setTotalCapacity] = useState(15000);
  const [minPrice, setMinPrice] = useState(55);
  const [maxPrice, setMaxPrice] = useState(250);
  const [currency, setCurrency] = useState('INR');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !venueName || !city) return;

    const newConcert: ConcertEvent = {
      id: `cnc-${Date.now().toString().slice(-4)}`,
      title,
      artist,
      genre,
      venueName,
      city,
      country: city.includes(',') ? city.split(',')[1].trim() : 'Global',
      date,
      doorsOpen,
      totalCapacity: Number(totalCapacity),
      ticketsSold: Math.round(Number(totalCapacity) * 0.1), // Initial pre-sales
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      currency,
      image: imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&auto=format&fit=crop&q=80',
      status: 'active',
      organizer: 'Global Live Entertainment',
      connectedRidesCount: 0,
      ticketTiers: [
        { name: 'General Admission', price: Number(minPrice), available: Math.round(Number(totalCapacity) * 0.6), total: Math.round(Number(totalCapacity) * 0.6) },
        { name: 'VIP Circle Experience', price: Number(maxPrice), available: Math.round(Number(totalCapacity) * 0.4), total: Math.round(Number(totalCapacity) * 0.4) }
      ]
    };

    onAddConcert(newConcert);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Broadcast Music Concert"
      subtitle="Publish tour stops, festivals, and venue ticket allocations worldwide"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Artist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Tour / Concert Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Echoes in Eternity World Tour"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Headlining Artist / Band *</label>
            <input
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Swedish House Mafia"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Genre, Venue & City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Music Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            >
              <option value="EDM">EDM / Electronic</option>
              <option value="Rock">Rock / Alternative</option>
              <option value="Pop">Pop / Global</option>
              <option value="Hip-Hop">Hip-Hop / Rap</option>
              <option value="Indie">Indie / Folk</option>
              <option value="Classical">Classical</option>
              <option value="Jazz">Jazz</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Venue Name *</label>
            <input
              type="text"
              required
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. Ziggo Dome"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">City & Country *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Amsterdam, Netherlands"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Date, Doors Open & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-t border-slate-100 pt-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Event Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Doors Open Time</label>
            <input
              type="text"
              value={doorsOpen}
              onChange={(e) => setDoorsOpen(e.target.value)}
              placeholder="19:00"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Total Arena Capacity</label>
            <input
              type="number"
              min="100"
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing & Image */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Min Ticket Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">VIP Ticket Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Poster image file upload */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3.5">
          <label className="text-xs font-normal text-slate-700">Poster / Stage Visual (File Upload)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer border border-slate-200 rounded-xl bg-slate-50 p-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            />
            {imageUrl && (
              <div className="relative h-14 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group">
                <img
                  src={imageUrl}
                  alt="Poster preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 h-4 w-4 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Upload JPG, PNG, or WEBP file for stage visuals (Optional).
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-purple-600 hover:bg-purple-500 px-5 py-2 text-xs font-normal text-white shadow-xs transition-all cursor-pointer"
          >
            Upload & Publish Concert
          </button>
        </div>
      </form>
    </Modal>
  );
};
