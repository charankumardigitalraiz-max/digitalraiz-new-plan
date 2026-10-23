import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Tag,
  Shield,
  X
} from 'lucide-react';
import type { StrangerMeet } from '../../types';
import { Modal } from '../common/Modal';

interface CreateStrangerMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeet: (meet: StrangerMeet) => void;
}

export const CreateStrangerMeetModal: React.FC<CreateStrangerMeetModalProps> = ({
  isOpen,
  onClose,
  onAddMeet
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StrangerMeet['category']>('Coffee & Chill');
  const [city, setCity] = useState('Bengaluru');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [meetDate, setMeetDate] = useState('2026-10-31');
  const [meetTime, setMeetTime] = useState('11:00 AM');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [vibeTagsInput, setVibeTagsInput] = useState('Weekend, Icebreaker, CarpoolPlan');
  const [hostName, setHostName] = useState('Admin Lead');

  const categories: StrangerMeet['category'][] = [
    'Coffee & Chill',
    'Weekend Roadtrip',
    'Trek & Adventure',
    'Music & Nightlife',
    'City Walk & Food'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingPoint.trim()) return;

    const tags = vibeTagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newMeet: StrangerMeet = {
      id: `sm-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description:
        description.trim() ||
        `Join fellow solo travelers and locals for an engaging ${category.toLowerCase()} session in ${city}.`,
      hostName: hostName.trim() || 'Community Host',
      hostAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostRating: 5.0,
      hostVerified: true,
      category,
      city,
      meetingPoint: meetingPoint.trim(),
      meetDate,
      meetTime,
      maxParticipants: Number(maxParticipants),
      participants: [],
      safetyGuidelines: [
        'Verified Government ID required at check-in',
        'Designated public meeting spot',
        'Zero harassment and alcohol policy'
      ],
      status: 'upcoming',
      vibeTags: tags.length > 0 ? tags : ['Community', 'Meetup']
    };

    onAddMeet(newMeet);
    onClose();

    // Reset Form
    setTitle('');
    setDescription('');
    setMeetingPoint('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Host a Stranger Meetup"
      subtitle="Publish a local icebreaker, coffee meetup, or travel buddy gathering"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Meetup Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Indiranagar Sunday Coffee & Roadtrip Talk"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Category & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StrangerMeet['category'])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              City
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bengaluru, Mumbai, Delhi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Meeting Point */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Meeting Point / Landmark *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="e.g. Blue Tokai Coffee, Indiranagar 100ft Road"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Date, Time & Max Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={meetDate}
              onChange={(e) => setMeetDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Time
            </label>
            <input
              type="text"
              required
              value={meetTime}
              onChange={(e) => setMeetTime(e.target.value)}
              placeholder="e.g. 10:30 AM"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Capacity Limit
            </label>
            <input
              type="number"
              min={2}
              max={50}
              required
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Meetup Agenda & Details
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell participants what the vibe will be, what to bring, and expectations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Vibe Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Vibe Tags (Comma-separated)
          </label>
          <input
            type="text"
            value={vibeTagsInput}
            onChange={(e) => setVibeTagsInput(e.target.value)}
            placeholder="e.g. Coffee, Backpackers, RoadtripSquad"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Publish Meetup</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
