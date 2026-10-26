import React from 'react';
import {
  Building2,
  MapPin,
  Users,
  Phone,
  Radio,
  ExternalLink,
  Copy,
  CheckCircle2,
  Check
} from 'lucide-react';
import type { Venue } from '../../types';
import { Modal } from '../common/Modal';

export interface VenueDetailModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const VenueDetailModal: React.FC<VenueDetailModalProps> = ({
  venue,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!venue) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      onShowToast?.(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${venue.name}, ${venue.address}, ${venue.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Venue Details"
      subtitle={`ID: ${venue.id}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Optional Venue Photo Banner */}
        {venue.image && (
          <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent flex items-end p-4">
              <span className="rounded-md bg-white/20 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/20">
                {venue.type}
              </span>
            </div>
          </div>
        )}

        {/* Venue Title & Status Card */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {venue.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {venue.city}, India <span className="text-slate-300">•</span>{' '}
                <span className="text-purple-600 font-medium">{venue.type}</span>
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shrink-0 self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {venue.status === 'active' ? 'Active Partner (Ready)' : 'Under Maintenance'}
          </span>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Seating Capacity */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Users className="h-3.5 w-3.5 text-purple-600" />
              <span>Seating Capacity</span>
            </div>
            <div className="text-base font-semibold text-slate-900 pt-0.5">
              {venue.capacity.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">seats</span>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Venue Category</span>
            </div>
            <div className="text-base font-semibold text-slate-900 pt-0.5">
              {venue.type}
            </div>
          </div>
        </div>

        {/* Audio / Sound Rig */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Radio className="h-3.5 w-3.5 text-purple-600" />
            <span>Audio & Sound Rig</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
            {venue.soundSystem}
          </p>
        </div>

        {/* Physical Address Card */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-purple-600" />
              <span>Full Address</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(venue.address, 'Address')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer transition-colors"
              >
                {copiedField === 'Address' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-purple-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={openGoogleMaps}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer transition-colors"
              >
                <ExternalLink className="h-3 w-3 text-purple-500" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-700 font-normal leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
            {venue.address}
          </p>
        </div>

        {/* Coordinator Contact Card */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Phone className="h-3.5 w-3.5 text-purple-600" />
              <span>Venue Coordinator Desk</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {venue.contactPerson}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(venue.contactPerson, 'Contact info')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer transition-colors self-start sm:self-auto shrink-0"
          >
            {copiedField === 'Contact info' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-purple-500" />
                <span>Copy Contact</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified Venue Partner</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm shadow-purple-200 hover:shadow-purple-300 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
