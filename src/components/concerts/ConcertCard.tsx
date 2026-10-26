import {
  Calendar,
  MapPin,
  Car,
  Eye,
  Trash2
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { Badge } from '../common/Badge';

interface ConcertCardProps {
  concert: ConcertEvent;
  onSelect: (concert: ConcertEvent) => void;
  onDelete: (id: string) => void;
}

export const ConcertCard = ({
  concert,
  onSelect,
  onDelete
}: ConcertCardProps) => {
  const soldPercent = Math.round((concert.ticketsSold / concert.totalCapacity) * 100);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
      {/* Visual header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={concert.image}
          alt={concert.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-slate-800">
            {concert.genre}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <Badge status={concert.status} />
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-sm font-medium tracking-tight truncate drop-shadow-xs">
            {concert.title}
          </h3>
          <p className="text-xs text-slate-200 font-normal truncate">
            {concert.artist}
          </p>
        </div>
      </div>

      {/* Body details */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span>{concert.date} • Doors {concert.doorsOpen}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{concert.venueName}, {concert.city}</span>
          </div>

          {/* Carpool rides matched */}
          <div className="flex items-center gap-2 text-xs text-sky-700 bg-sky-50 rounded-lg px-2.5 py-1.5">
            <Car className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span className="font-normal">{concert.connectedRidesCount} Carpools going to this concert</span>
          </div>
        </div>

        {/* Capacity bar & Price */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Capacity Sold</span>
            <span className="text-purple-700 font-medium">{soldPercent}% ({concert.ticketsSold.toLocaleString()})</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${soldPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-slate-900">
              ₹{concert.minPrice} - ₹{concert.maxPrice}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelect(concert)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="View Concert Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(concert.id)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                title="Delete Concert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
