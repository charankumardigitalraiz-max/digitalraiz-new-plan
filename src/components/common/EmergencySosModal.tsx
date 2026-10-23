import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  X,
  Phone,
  ShieldAlert,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  Radio,
  ExternalLink,
  Users,
  ShieldCheck,
  Flame,
  Search
} from 'lucide-react';

export interface EmergencyIncident {
  id: string;
  type: 'passenger_panic' | 'breakdown' | 'medical' | 'route_deviation';
  title: string;
  severity: 'critical' | 'high' | 'medium';
  route: string;
  locationDetails: string;
  coordinates: string;
  reportedAt: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  passengerName: string;
  passengerPhone: string;
  emergencyContact: string;
  status: 'active' | 'dispatched' | 'resolved';
  notes: string;
}

const INITIAL_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'SOS-9102',
    type: 'passenger_panic',
    title: 'In-Transit Passenger Panic Button Pressed',
    severity: 'critical',
    route: 'Mumbai ↔ Pune Expressway',
    locationDetails: 'Near Khalapur Toll Plaza, KM 48.2 (Eastbound)',
    coordinates: '18.7511° N, 73.3422° E',
    reportedAt: '3 minutes ago',
    driverName: 'Julian Vance',
    driverPhone: '+91 98201 11482',
    vehicleModel: 'Tata Nexon EV (Dark Edition)',
    vehiclePlate: 'MH 02 EK 9102',
    passengerName: 'Ananya Deshmukh',
    passengerPhone: '+91 98450 77123',
    emergencyContact: '+91 98200 99881 (Father)',
    status: 'active',
    notes: 'Passenger activated silent SOS trigger via mobile app. Rapid acceleration anomaly detected on telematics.'
  },
  {
    id: 'SOS-9088',
    type: 'breakdown',
    title: 'Highway Vehicle Breakdown & Overheating',
    severity: 'high',
    route: 'Bengaluru ↔ Mysuru Highway',
    locationDetails: 'Mandya Bypass Exit, KM 86',
    coordinates: '12.5244° N, 76.8958° E',
    reportedAt: '18 minutes ago',
    driverName: 'Aarav Patel',
    driverPhone: '+91 99801 23456',
    vehicleModel: 'Toyota Innova Hycross',
    vehiclePlate: 'KA 01 MJ 4401',
    passengerName: 'Kavita Nair (3 passengers aboard)',
    passengerPhone: '+91 94480 33219',
    emergencyContact: '+91 80 2345 6789',
    status: 'dispatched',
    notes: 'Coolant hose failure on active carpool. Highway roadside mechanics unit NH-275 dispatched to location.'
  },
  {
    id: 'SOS-8941',
    type: 'medical',
    title: 'Medical Assistance Precaution Request',
    severity: 'medium',
    route: 'Delhi ↔ Agra Expressway',
    locationDetails: 'Jewar Service Area, KM 65',
    coordinates: '28.1287° N, 77.5562° E',
    reportedAt: '42 minutes ago',
    driverName: 'Vikram Malhotra',
    driverPhone: '+91 98110 55432',
    vehicleModel: 'Hyundai Creta SX',
    vehiclePlate: 'DL 3C BC 8891',
    passengerName: 'Sanjay Mehra',
    passengerPhone: '+91 98711 22345',
    emergencyContact: '+91 11 2654 3210',
    status: 'resolved',
    notes: 'Passenger experienced mild motion sickness. Rest area medical aid administered; ride completed safely.'
  }
];

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose
}) => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(INITIAL_INCIDENTS[0].id);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleUpdateStatus = (id: string, newStatus: EmergencyIncident['status']) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    triggerToast(`Incident #${id} status changed to ${newStatus.toUpperCase()}`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setIsBroadcastSent(true);
    triggerToast('Emergency alert broadcasted to all drivers in the corridor.');
    setTimeout(() => {
      setBroadcastMessage('');
      setIsBroadcastSent(false);
    }, 2000);
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const filteredList = incidents.filter(i => {
    if (filter === 'active') return i.status !== 'resolved';
    if (filter === 'resolved') return i.status === 'resolved';
    return true;
  });

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Toast Alert */}
      {feedbackToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs shadow-xl animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-rose-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Emergency Incident Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldAlert className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Live Emergency SOS & Incident Dispatch
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-700 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                  {activeIncidents.length} Active Emergency Alerts
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Centralized platform telemetry panic monitoring, highway roadside support & rapid transit safety.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Incidents Column (40%) + Right Selected Incident Deep-Dive (60%) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Incidents List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 bg-slate-50/70 flex flex-col shrink-0">
            {/* Filter Tabs */}
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({incidents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('active')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filter === 'active'
                      ? 'bg-rose-600 text-white shadow-2xs font-bold'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Active ({activeIncidents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filter === 'resolved'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Incidents Scrollable Roster */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredList.map(incident => {
                const isSelected = incident.id === selectedIncidentId;
                const isCritical = incident.severity === 'critical';

                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-rose-400 bg-white shadow-md ring-2 ring-rose-200/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        {isCritical && incident.status === 'active' && (
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                        #{incident.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          incident.status === 'active'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : incident.status === 'dispatched'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1">
                      {incident.title}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{incident.route}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>By {incident.passengerName.split(' ')[0]}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {incident.reportedAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Incident Telemetry & Rapid Dispatch Actions */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {selectedIncident ? (
              <>
                {/* Active Incident Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        INCIDENT #{selectedIncident.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          selectedIncident.severity === 'critical'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {selectedIncident.severity} Severity
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Reported {selectedIncident.reportedAt}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedIncident.title}
                    </h3>
                  </div>

                  {/* Status Switcher Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedIncident.status === 'active'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'dispatched')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedIncident.status === 'dispatched'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dispatched
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedIncident.status === 'resolved'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                {/* Primary Quick Emergency Dispatch Action Buttons */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Direct Highway Dispatch & Emergency Triggers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <a
                      href="tel:112"
                      onClick={() => triggerToast('Dialing National Highway Police Emergency 112...')}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Police / Highway Patrol (112)</span>
                    </a>

                    <a
                      href="tel:108"
                      onClick={() => triggerToast('Requesting Emergency Medical Ambulance 108...')}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                    >
                      <Flame className="h-4 w-4" />
                      <span>Medical Ambulance (108)</span>
                    </a>

                    <a
                      href={`tel:${selectedIncident.driverPhone}`}
                      onClick={() => triggerToast(`Initiating direct voice call to driver ${selectedIncident.driverName}...`)}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Driver ({selectedIncident.driverName.split(' ')[0]})</span>
                    </a>

                    <a
                      href={`tel:${selectedIncident.passengerPhone}`}
                      onClick={() => triggerToast(`Contacting passenger ${selectedIncident.passengerName}...`)}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>Call Passenger</span>
                    </a>
                  </div>
                </div>

                {/* Telemetry & Geographic Location Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-600" />
                      <span className="text-xs font-bold text-slate-800">
                        GPS Telematics & Corridor Position
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedIncident.coordinates}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Exact Landmark:</span> {selectedIncident.locationDetails}
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="font-semibold text-rose-700">Incident Telemetry Log:</span> {selectedIncident.notes}
                  </div>
                </div>

                {/* Driver & Vehicle Details vs Passenger & Emergency Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Driver Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Car className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Vehicle & Driver Details</span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver:</span>
                        <span className="font-semibold text-slate-800">{selectedIncident.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver Contact:</span>
                        <span className="font-mono text-slate-700">{selectedIncident.driverPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Car Model:</span>
                        <span className="font-medium text-slate-800">{selectedIncident.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">License Plate:</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedIncident.vehiclePlate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Passenger & Emergency Contact</span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Passenger:</span>
                        <span className="font-semibold text-slate-800">{selectedIncident.passengerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-slate-700">{selectedIncident.passengerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Family Emergency Contact:</span>
                        <span className="font-mono font-semibold text-rose-700">{selectedIncident.emergencyContact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transit Insurance:</span>
                        <span className="font-medium text-emerald-700">Covered • Active Policy</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corridor Emergency Radio Broadcast Form */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Radio className="h-4 w-4 text-amber-600" />
                    <span>Broadcast Emergency Safety Alert to Active Drivers in Corridor</span>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="flex gap-2">
                    <input
                      type="text"
                      value={broadcastMessage}
                      onChange={e => setBroadcastMessage(e.target.value)}
                      placeholder={`Push emergency notice to all drivers along ${selectedIncident.route}...`}
                      className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isBroadcastSent || !broadcastMessage.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      {isBroadcastSent ? 'Dispatched!' : 'Broadcast Alert'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                No incident selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
