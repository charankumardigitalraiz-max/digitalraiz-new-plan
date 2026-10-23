import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Filter,
  Plus,
  ShieldCheck,
  Star,
  Search,
  MessageCircle,
  UserCheck,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import type { StrangerMeet, StrangerMeetParticipant } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { StrangerMeetCard } from './StrangerMeetCard';
import { Table, type Column } from '../common/Table';
import { Badge } from '../common/Badge';

interface StrangerMeetDashboardProps {
  meets: StrangerMeet[];
  searchQuery?: string;
  activeSubTab?: 'all-meets' | 'buddies';
  onSubTabChange?: (tab: 'all-meets' | 'buddies') => void;
  onSelectMeet: (meet: StrangerMeet) => void;
  onDeleteMeet: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const StrangerMeetDashboard: React.FC<StrangerMeetDashboardProps> = ({
  meets,
  searchQuery = '',
  activeSubTab = 'all-meets',
  onSubTabChange,
  onSelectMeet,
  onDeleteMeet,
  onOpenCreateModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [buddySearch, setBuddySearch] = useState('');

  // Extract all participants across all meets into flat roster
  const allBuddies: StrangerMeetParticipant[] = Array.from(
    new Map(
      meets.flatMap((m) => m.participants).map((p) => [p.id, p])
    ).values()
  );

  const categories = [
    'All',
    'Coffee & Chill',
    'Weekend Roadtrip',
    'Trek & Adventure',
    'Music & Nightlife',
    'City Walk & Food'
  ];

  // Filtered Meets
  const filteredMeets = meets.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.meetingPoint.toLowerCase().includes(q) ||
      m.hostName.toLowerCase().includes(q) ||
      m.vibeTags.some((tag) => tag.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    return true;
  });

  // Filtered Buddies
  const filteredBuddies = allBuddies.filter((b) => {
    const q = buddySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.interests.some((i) => i.toLowerCase().includes(q))
    );
  });

  // Metrics
  const activeMeetsCount = meets.filter(
    (m) => m.status === 'active' || m.status === 'upcoming'
  ).length;
  const totalBuddiesMatched = allBuddies.length;
  const avgCapacity =
    meets.length > 0
      ? Math.round(
          meets.reduce((acc, m) => acc + m.maxParticipants, 0) / meets.length
        )
      : 8;

  const buddyColumns: Column<StrangerMeetParticipant>[] = [
    {
      key: 'user',
      header: 'Travel Buddy Profile',
      render: (b) => (
        <div className="flex items-center gap-3">
          <img
            src={b.avatar}
            alt={b.name}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
              <span>{b.name}</span>
              {b.verifiedKYC && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {b.age} yrs • {b.city}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'bio',
      header: 'Bio & Travel Vibe',
      render: (b) => (
        <p className="text-xs text-slate-600 max-w-xs truncate">{b.bio}</p>
      )
    },
    {
      key: 'interests',
      header: 'Shared Interests',
      render: (b) => (
        <div className="flex flex-wrap gap-1">
          {b.interests.map((int, i) => (
            <span
              key={i}
              className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {int}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'score',
      header: 'Social Trust Score',
      render: (b) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {b.socialScore}% Match
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'KYC Status',
      render: (b) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Verified
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          Stranger Meets & Buddy Hub
        </h1>
        <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
          Discover local icebreaker meetups, pre-carpool coffee sessions, and safety-verified travel companion circles
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Stranger Meets"
          value={activeMeetsCount}
          change="+4 this week"
          isPositive={true}
          subtext="Community gatherings scheduled"
          icon={Sparkles}
          accentColor="indigo"
        />
        <MetricCard
          label="Verified Travel Buddies"
          value={totalBuddiesMatched}
          change="+18 new"
          isPositive={true}
          subtext="ID-verified companions roster"
          icon={Users}
          accentColor="emerald"
        />
        <MetricCard
          label="Safety Compliance Rate"
          value="100%"
          subtext="All meets in vetted public spaces"
          icon={ShieldCheck}
          accentColor="cyan"
        />
        <MetricCard
          label="Avg Meetup Group Size"
          value={`${avgCapacity} Members`}
          subtext="Optimal social bonding ratio"
          icon={UserCheck}
          accentColor="amber"
        />
      </div>

      {/* Sub-Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSubTabChange?.('all-meets')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'all-meets'
                ? 'bg-sidebar-active text-sidebar-active'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community Meets ({meets.length})</span>
          </button>

          <button
            onClick={() => onSubTabChange?.('buddies')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'buddies'
                ? 'bg-sidebar-active text-sidebar-active'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Travel Buddies ({allBuddies.length})</span>
          </button>
        </div>

        {/* Right Action: Category Filters or Create Button */}
        {activeSubTab === 'all-meets' ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Host Meetup</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={buddySearch}
                onChange={(e) => setBuddySearch(e.target.value)}
                placeholder="Search buddies, city, interests..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Community Meets */}
      {activeSubTab === 'all-meets' && (
        <>
          {filteredMeets.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
              <h3 className="mt-3 text-sm font-semibold text-slate-800">
                No Stranger Meets Found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No meetups matched your criteria. Try switching categories or create a new community icebreaker.
              </p>
              <button
                onClick={onOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Host the First Meetup</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMeets.map((meet) => (
                <StrangerMeetCard
                  key={meet.id}
                  meet={meet}
                  onSelect={onSelectMeet}
                  onDelete={onDeleteMeet}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Travel Buddies */}
      {activeSubTab === 'buddies' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <Table
            data={filteredBuddies}
            columns={buddyColumns}
            keyExtractor={(b) => b.id}
            emptyMessage="No travel buddies found"
            emptySubtext="Adjust your search criteria to find compatible verified travel companions."
          />
        </div>
      )}
    </div>
  );
};
