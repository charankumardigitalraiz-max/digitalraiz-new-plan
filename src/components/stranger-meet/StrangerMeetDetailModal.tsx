import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield,
  Tag,
  Share2
} from 'lucide-react';
import type { StrangerMeet } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface StrangerMeetDetailModalProps {
  meet: StrangerMeet | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: StrangerMeet['status']) => void;
}

export const StrangerMeetDetailModal: React.FC<StrangerMeetDetailModalProps> = ({
  meet,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!meet) return null;

  const spotsLeft = meet.maxParticipants - meet.participants.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meet.title}
      subtitle={`Meetup ID: ${meet.id} • Hosted by ${meet.hostName}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Overview Banner */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Badge status={meet.status} size="md" />
              <span className="rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {meet.category}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">
                {meet.participants.length} of {meet.maxParticipants} Spots Claimed
              </span>
              <div className="text-xs font-semibold text-emerald-600">
                {spotsLeft > 0 ? `${spotsLeft} open slot(s)` : 'Session at Full Capacity'}
              </div>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>
                <strong className="text-slate-800">{meet.city}</strong> • {meet.meetingPoint}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 sm:justify-end">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{meet.meetDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{meet.meetTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Vibe Tags */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Meetup Agenda & About
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg border border-slate-100 p-3.5">
            {meet.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {meet.vibeTags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md bg-indigo-50/60 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Host Profile & Safety Protocol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Host Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Event Host
            </div>
            <div className="flex items-center gap-3">
              <img
                src={meet.hostAvatar}
                alt={meet.hostName}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800">
                    {meet.hostName}
                  </span>
                  {meet.hostVerified && (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span className="font-medium">{meet.hostRating}</span>
                  <span className="text-slate-400 font-normal">• Verified Community Lead</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Safety & Trust Standards</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-emerald-700">
              {meet.safetyGuidelines.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Confirmed Attendees Roster */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Travelers & Icebreaker Buddies ({meet.participants.length})
            </h4>
            <span className="text-xs text-slate-400 font-normal">
              100% KYC ID Verified
            </span>
          </div>

          {meet.participants.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
              No participants have joined yet. Be the first to RSVP!
            </div>
          ) : (
            <div className="space-y-2.5">
              {meet.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900">{p.name}</span>
                        <span className="text-[11px] text-slate-400">({p.age}y, {p.city})</span>
                        {p.verifiedKYC && (
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {p.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                    {p.interests.map((int, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {int}
                      </span>
                    ))}
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                      Score: {p.socialScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">
            Meetup Lifecycle Management
          </span>

          <div className="flex items-center gap-2">
            {onStatusChange && meet.status === 'upcoming' && (
              <>
                <button
                  onClick={() => {
                    onStatusChange(meet.id, 'completed');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Completed
                </button>
                <button
                  onClick={() => {
                    onStatusChange(meet.id, 'cancelled');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Meetup
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
