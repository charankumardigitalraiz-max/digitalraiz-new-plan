import { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Sliders,
  CheckCircle2,
  Save,
  Globe
} from 'lucide-react';
import type { AdminUser } from '../auth/Login';

interface SettingsViewProps {
  currentUser?: AdminUser | null;
  onSave?: (msg: string) => void;
}

export const SettingsView = ({ currentUser, onSave }: SettingsViewProps) => {
  const [currency, setCurrency] = useState('INR');
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState('4.85');
  const [maxSeatsPerRide, setMaxSeatsPerRide] = useState('6');
  const [enableCarpoolEmailAlerts, setEnableCarpoolEmailAlerts] = useState(true);
  const [enableKycPushNotifications, setEnableKycPushNotifications] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    onSave?.('System configuration and platform preferences saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          Platform Settings & Controls
        </h1>
        <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
          Configure currency standards, automated driver KYC thresholds, and notification alerts
        </p>
      </div>

      {/* Settings Sections */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Platform & Regional Preferences</h3>
              <p className="text-xs text-slate-400">Configure core platform operating parameters</p>
            </div>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default Currency */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Platform Settlement Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="USD">US Dollar ($ USD)</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">All ride fares and ticket payouts will reflect this currency.</p>
          </div>

          {/* Auto-verify threshold */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Driver Auto-Verification Rating Threshold
            </label>
            <input
              type="text"
              value={autoVerifyThreshold}
              onChange={e => setAutoVerifyThreshold(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">Drivers above this historical rating receive expedited review.</p>
          </div>

          {/* Max seats per ride */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Maximum Passenger Seats Allowed Per Ride
            </label>
            <input
              type="number"
              value={maxSeatsPerRide}
              onChange={e => setMaxSeatsPerRide(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">Standard passenger vehicle safety limit for ridesharing.</p>
          </div>

          {/* Regional mobility zone */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary Mobility Operations Zone
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>India Intercity Corridors (Western & Southern Hubs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Audit Alerts */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Notification & Webhook Routing</h3>
            <p className="text-xs text-slate-400">Configure alerts for dispatch and compliance events</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Driver KYC Queue Alerts</div>
              <div className="text-[11px] text-slate-400">Notify admin team when 5+ driver applications are pending audit</div>
            </div>
            <input
              type="checkbox"
              checked={enableKycPushNotifications}
              onChange={e => setEnableKycPushNotifications(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Concert Arena Sell-Out Threshold</div>
              <div className="text-[11px] text-slate-400">Automatically flag concert stages reaching 90%+ capacity for carpool surge allocation</div>
            </div>
            <input
              type="checkbox"
              checked={enableCarpoolEmailAlerts}
              onChange={e => setEnableCarpoolEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Admin Profile Identity */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Administrator Profile</h3>
            <p className="text-xs text-slate-400">Authorized personnel credentials</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={currentUser?.name || 'Administrator'}
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900">{currentUser?.name || 'Administrator'}</div>
            <div className="text-xs text-slate-400">{currentUser?.role || 'Super Admin'} • {currentUser?.email || 'admin@orbita.global'}</div>
            <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Verified Security Session
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-xs transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
