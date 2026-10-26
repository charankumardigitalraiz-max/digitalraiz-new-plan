import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Star,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { StrangerMeet } from '../../types';
import { Badge } from '../common/Badge';

interface StrangerMeetCardProps {
  meet: StrangerMeet;
  onSelect: (meet: StrangerMeet) => void;
  onDelete?: (id: string) => void;
  onJoinToggle?: (id: string) => void;
}

export const StrangerMeetCard: React.FC<StrangerMeetCardProps> = ({
  meet,
  onSelect,
  onDelete,
  onJoinToggle
}) => {
  const spotsLeft = meet.maxParticipants - meet.participants.length;
  const isFull = spotsLeft <= 0;

  const getCategoryColor = (cat: StrangerMeet['category']) => {
    switch (cat) {
      case 'Coffee & Chill':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Weekend Roadtrip':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'Trek & Adventure':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Music & Nightlife':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'City Walk & Food':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div
      onClick={() => onSelect(meet)}
      className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getCategoryColor(
              meet.category
            )}`}
          >
            {meet.category}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge status={meet.status} size="sm" />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {meet.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {meet.description}
        </p>

        {/* Location & Time info */}
        <div className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-800 font-medium">{meet.city}</strong> • {meet.meetingPoint}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{meet.meetDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{meet.meetTime}</span>
            </div>
          </div>
        </div>

        {/* Vibe Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meet.vibeTags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="rounded-md bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-500"
            >
              #{tag}
            </span>
          ))}
          {meet.vibeTags.length > 3 && (
            <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">
              +{meet.vibeTags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Host & Participants Stack */}
      <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between gap-3">
        {/* Host Info */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={meet.hostAvatar}
            alt={meet.hostName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="truncate">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-800 truncate">
              <span className="truncate">{meet.hostName}</span>
              {meet.hostVerified && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-500">
              <Star className="h-2.5 w-2.5 fill-amber-400" />
              <span>{meet.hostRating}</span>
              <span className="text-slate-400 font-normal ml-0.5">Host</span>
            </div>
          </div>
        </div>

        {/* Participant Stack & Spots */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex -space-x-1.5 overflow-hidden">
            {meet.participants.slice(0, 3).map((p) => (
              <img
                key={p.id}
                src={p.avatar}
                alt={p.name}
                className="h-6 w-6 rounded-full object-cover ring-2 ring-white"
                title={`${p.name} (${p.city})`}
              />
            ))}
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isFull
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {meet.participants.length}/{meet.maxParticipants}
          </span>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meet.id);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Remove Meetup"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
