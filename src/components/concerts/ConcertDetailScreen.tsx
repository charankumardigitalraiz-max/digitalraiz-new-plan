import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Car,
  Ticket,
  TrendingUp,
  Music,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Trash2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import type { ConcertEvent } from '../../types';
import { concertService } from '../../services/concertService';
import { Badge } from '../common/Badge';

interface ConcertDetailScreenProps {
  concerts?: ConcertEvent[];
  onStatusChange?: (id: string, status: 'active' | 'upcoming' | 'completed' | 'cancelled') => void;
  onDeleteConcert?: (id: string) => void;
}

export const ConcertDetailScreen: React.FC<ConcertDetailScreenProps> = ({
  concerts,
  onStatusChange,
  onDeleteConcert
}) => {
  const { concertId } = useParams<{ concertId: string }>();
  const navigate = useNavigate();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [fetchedConcert, setFetchedConcert] = useState<ConcertEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!concerts || !concerts.find(c => c.id === concertId));

  const concert = concerts?.find(c => c.id === concertId) || fetchedConcert;

  useEffect(() => {
    if (concertId) {
      setIsLoading(true);
      concertService
        .getConcertById(concertId)
        .then((res) => {
          if (res) {
            setFetchedConcert(res);
          }
        })
        .catch(() => { })
        .finally(() => setIsLoading(false));
    }
  }, [concertId]);

  const handleStatusUpdate = async (newStatus: 'active' | 'upcoming' | 'completed' | 'cancelled') => {
    if (!concert) return;
    try {
      await concertService.updateConcertStatus(concert.id, newStatus);
      setFetchedConcert(prev => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      console.warn('Failed to update concert status:', err);
    }
    if (onStatusChange) {
      onStatusChange(concert.id, newStatus);
    }
  };

  const handleDelete = async () => {
    if (!concert) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${concert.title}"?`)) return;

    try {
      await concertService.deleteConcert(concert.id);
    } catch (err) {
      console.warn('Failed to delete concert:', err);
    }
    if (onDeleteConcert) {
      onDeleteConcert(concert.id);
    }
    navigate('/concerts/all-concerts');
  };

  const handleCopyId = () => {
    if (!concert) return;
    navigator.clipboard.writeText(concert.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <span className="text-xs text-slate-500 font-medium">Loading concert manifest...</span>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/concerts/all-concerts')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Concerts
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <Music className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Concert Not Found</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            The concert event ID #{concertId} could not be located in the official box office registry.
          </p>
          <button
            onClick={() => navigate('/concerts/all-concerts')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
          >
            Return to Concerts List
          </button>
        </div>
      </div>
    );
  }

  const soldPercentage = Math.round((concert.ticketsSold / (concert.totalCapacity || 1)) * 100);
  const avgPrice = (concert.minPrice + concert.maxPrice) / 2;
  const estimatedGross = concert.ticketsSold * avgPrice;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-4 pb-10">
      {/* 1. Header Card with Back Button, Breadcrumbs & Actions */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/concerts/overview" className="hover:text-purple-600 transition-colors">
              Concerts
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link to="/concerts/all-concerts" className="hover:text-purple-600 transition-colors">
              Live Concerts
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {concert.title}
            </span>
          </div> */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/concerts/all-concerts')}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
              title="Back to list"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 truncate">
              {concert.title}
            </h1>
            <Badge status={concert.status} />
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            title="Share Concert Link"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100 shadow-2xs transition-all cursor-pointer"
            title="Delete Concert"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Event</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Visual Showcase Card (Image Left, Details & Key Metrics Right) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 lg:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Column 1: Left Poster Artwork Frame */}
          <div className="relative w-full sm:w-60 lg:w-64 aspect-[4/3] shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group">
            <img
              src={concert.image}
              alt={concert.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50" />

            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
              <span className="rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-slate-900 shadow-xs">
                {concert.genre}
              </span>
              {concert.ageRestriction && (
                <span className="rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
                  {concert.ageRestriction}
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Center Details & Event Metadata */}
          <div className="flex-1 min-w-0 space-y-5 w-full">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge status={concert.status} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                <Music className="h-3 w-3 text-purple-600" />
                {concert.genre} Tour
              </span>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {concert.ticketTiers.length} Active Tiers
              </span>
            </div>

            {/* Concert Title & Lineup */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-2xl font-semibold tracking-tight text-slate-900 leading-snug">
                {concert.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-0.5 text-[12px] font-semibold">
                <span className="text-slate-600">
                  Headliner: <span className="font-semibold text-purple-700 text-[13px]">{concert.artist}</span>
                </span>
                {concert.supportingActs && concert.supportingActs.length > 0 && (
                  <span className="text-slate-500 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span>
                      Featuring: <span className="text-slate-800 font-medium">{concert.supportingActs.join(', ')}</span>
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Event Highlights Strip */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2  text-xs">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="font-semibold text-slate-900">{concert.date}</span>
                <span className="text-slate-400 font-normal">· Gate {concert.doorsOpen}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900">{concert.venueName}</span>
                <span className="text-slate-400 font-normal">({concert.city})</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <Ticket className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-900">
                  ₹{concert.minPrice.toLocaleString()} - ₹{concert.maxPrice.toLocaleString()}
                </span>
                <span className="text-slate-400 font-normal">· Avg ₹{Math.round(avgPrice).toLocaleString()}</span>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* 3. Main Details Grid: Left 8 Cols (Tiers & Venue) + Right 4 Cols (Controls & Organizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: 2 Spans */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket Tiers Breakdown */}
          <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-purple-600" />
                  Ticket Tiers & Quota Allocations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official box office passes broken down by seating class and stage visibility.
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 self-start sm:self-auto">
                {concert.ticketTiers.length} Active Tiers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Tier Category</th>
                    <th className="py-3 px-4">Price / Pass</th>
                    <th className="py-3 px-4 min-w-[150px]">Quota & Sales</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Gross Inflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {concert.ticketTiers.map((tier, idx) => {
                    const tierSold = tier.total - tier.available;
                    const tierPercent = Math.round((tierSold / (tier.total || 1)) * 100);
                    const tierRevenue = tierSold * tier.price;
                    const isSoldOut = tier.available === 0;
                    const isSellingFast = tierPercent >= 80 && !isSoldOut;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-purple-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-xs shrink-0">
                              {tier.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{tier.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {tier.available.toLocaleString()} available of {tier.total.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          ₹{tier.price.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">{tierSold.toLocaleString()} sold</span>
                            <span className="text-slate-400 font-semibold">{tierPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-purple-600 transition-all duration-500"
                              style={{ width: `${tierPercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isSoldOut ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Sold Out
                            </span>
                          ) : isSellingFast ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Selling Fast
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Available
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right font-semibold text-purple-700 whitespace-nowrap">
                          ₹{tierRevenue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Venue & Location Soundstage Card */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-600" />
                Venue & Arena Logistics
              </h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                On-Site Operations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Venue Location */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    Venue Location
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Arena
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-snug">{concert.venueName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {concert.venueAddress ? `${concert.venueAddress}, ` : ''}{concert.city}, {concert.country}
                  </div>
                </div>
              </div>

              {/* Card 2: Gate Timings & Schedule */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    Schedule & Gates
                  </span>
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Gate {concert.doorsOpen}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {new Date(concert.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Doors open at {concert.doorsOpen} · Show starts {concert.showTime || '20:00 (Expected)'}
                  </div>
                </div>
              </div>

              {/* Card 3: Fan Mobility & Carpools */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-blue-600" />
                    Fan Mobility & Transit
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {concert.connectedRidesCount} Rides Linked
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    Dedicated Arena Carpool Hub
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ride drop-off & pickup active at Arena Gate 4 / Mobility Lane
                  </div>
                </div>
              </div>

              {/* Card 4: Audio System & Entry Protocol */}
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                    Entry & Safety Protocol
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {concert.ageRestriction || 'All Ages Entry'}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {concert.soundSystem || 'L-Acoustics K1 Stadium Array'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {concert.totalCapacity.toLocaleString()} Max Capacity · Valid photo ID required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1 Span (Operational Controls & Organizer) */}
        <div className="space-y-5">
          {/* Status & Lifecycle Control */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Event Status & Lifecycle
            </h3>
            <p className="text-xs text-slate-500">
              Update the real-time operational status for this concert across the public fan app and ticketing portal.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStatusUpdate('active')}
                className={`w-full flex items-center justify-between p-2.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${concert.status === 'active'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Active (Live Box Office)</span>
                </div>
                {concert.status === 'active' && (
                  <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-semibold text-emerald-900">
                    Current
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('upcoming')}
                className={`w-full flex items-center justify-between p-2.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${concert.status === 'upcoming'
                  ? 'border-sky-300 bg-sky-50 text-sky-800 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-600" />
                  <span>Upcoming (Pre-Registration)</span>
                </div>
                {concert.status === 'upcoming' && (
                  <span className="text-[10px] bg-sky-200/80 px-2 py-0.5 rounded-full font-semibold text-sky-900">
                    Current
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('completed')}
                className={`w-full flex items-center justify-between p-2.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${concert.status === 'completed'
                  ? 'border-purple-300 bg-purple-50 text-purple-800 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-600" />
                  <span>Completed (Concluded)</span>
                </div>
                {concert.status === 'completed' && (
                  <span className="text-[10px] bg-purple-200/80 px-2 py-0.5 rounded-full font-semibold text-purple-900">
                    Current
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('cancelled')}
                className={`w-full flex items-center justify-between p-2.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${concert.status === 'cancelled'
                  ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>Cancelled (Refund Portal Open)</span>
                </div>
                {concert.status === 'cancelled' && (
                  <span className="text-[10px] bg-rose-200/80 px-2 py-0.5 rounded-full font-semibold text-rose-900">
                    Current
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              Event Organizer & Promoter
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm shrink-0">
                {concert.organizer.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">{concert.organizer}</div>
                <div className="text-[11px] text-slate-500">Authorized Tour Promoter</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              All box office payouts and arena settlement reports are cleared through the official promoter ledger.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
