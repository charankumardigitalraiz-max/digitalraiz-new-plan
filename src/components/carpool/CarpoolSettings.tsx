import React, { useState } from 'react';
import {
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Fuel,
  Scale,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  Info
} from 'lucide-react';

interface CarpoolSettingsProps {
  onShowToast?: (message: string) => void;
}

// Clean modern toggle switch
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer shrink-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
  </label>
);

export const CarpoolSettings: React.FC<CarpoolSettingsProps> = ({ onShowToast }) => {
  const [isSaved, setIsSaved] = useState(false);

  // 1. Decided Standard Per-KM Price
  const [baseRatePerKm, setBaseRatePerKm] = useState<number>(3.5);

  // 2. Negotiation Boundaries State
  const [enableFareNegotiation, setEnableFareNegotiation] = useState<boolean>(true);
  const [maxDecreasePercentage, setMaxDecreasePercentage] = useState<number>(15);
  const [maxIncreasePercentage, setMaxIncreasePercentage] = useState<number>(20);

  // 3. Interactive Simulation Distance
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState<number>(100);

  // Save handler
  const handleSave = () => {
    setIsSaved(true);
    onShowToast?.('Carpool price and negotiation settings updated successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Reset handler
  const handleReset = () => {
    setBaseRatePerKm(3.5);
    setEnableFareNegotiation(true);
    setMaxDecreasePercentage(15);
    setMaxIncreasePercentage(20);
    setSimulatedDistanceKm(100);
    onShowToast?.('Settings restored to standard defaults.');
  };

  // Live calculations
  const floorRatePerKm = +(baseRatePerKm * (1 - maxDecreasePercentage / 100)).toFixed(2);
  const ceilingRatePerKm = +(baseRatePerKm * (1 + maxIncreasePercentage / 100)).toFixed(2);

  const simulatedStandardFare = Math.round(simulatedDistanceKm * baseRatePerKm);
  const simulatedFloorFare = Math.round(simulatedDistanceKm * floorRatePerKm);
  const simulatedCeilingFare = Math.round(simulatedDistanceKm * ceilingRatePerKm);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Screen Header Banner */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sliders className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
                Carpool Pricing & Negotiation Settings
              </h1>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>
            <p className="text-[13px] font-normal text-slate-500 mt-0.5">
              Set the official per-kilometer rate and configure the allowed percentage discount and markup for passenger negotiations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-2xs hover:shadow-indigo-200"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>Saved Changes</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Official Decided Per-Kilometer Price */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Decided Standard Price per Kilometer
              </h2>
              <span className="rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                Official Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              The platform benchmark rate used to calculate standard trip fares and set the baseline for all passenger negotiations.
            </p>
          </div>

          <div className="relative w-44">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              step="0.1"
              min="0.5"
              value={baseRatePerKm}
              onChange={e => setBaseRatePerKm(Math.max(0.5, Number(e.target.value)))}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-14 text-base font-extrabold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">/ km</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400">Quick Presets:</span>
          {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(rate => (
            <button
              key={rate}
              type="button"
              onClick={() => setBaseRatePerKm(rate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${baseRatePerKm === rate
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              ₹{rate.toFixed(1)}/km
            </button>
          ))}
        </div>
      </div>

      {/* 2. Fare Negotiation Boundaries (Decrease & Increase %) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Fare Negotiation Boundaries
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${enableFareNegotiation
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                {enableFareNegotiation ? 'Negotiation Enabled' : 'Fixed Pricing Only'}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Enable users to negotiate below or above the decided standard price. Set strict allowed decrease (% discount) and increase (% markup) limits.
            </p>
          </div>

          <ToggleSwitch
            checked={enableFareNegotiation}
            onChange={setEnableFareNegotiation}
          />
        </div>

        {enableFareNegotiation ? (
          <div className="space-y-6">
            {/* Decrease and Increase Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Allowed Decrease (-%) */}
              <div className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/30 to-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                      <ArrowDownRight className="h-4 w-4" />
                    </div>
                    <span>Allowed Decrease Percentage (-%)</span>
                  </div>
                  {/* <span className="rounded-lg bg-rose-100/80 border border-rose-200 px-2.5 py-1 text-xs font-extrabold text-rose-700">
                    -{maxDecreasePercentage}% Max Below
                  </span> */}
                </div>

                <p className="text-xs text-slate-500">
                  How much a user can negotiate <strong>below</strong> the decided price of ₹{baseRatePerKm}/km.
                </p>

                {/* Direct Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Decrease Percentage Limit</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-500">-</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxDecreasePercentage}
                      onChange={e => setMaxDecreasePercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full h-11 rounded-xl border border-rose-200 bg-white pl-8 pr-12 text-base font-bold text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs"
                      placeholder="0"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[5, 10, 15, 20, 25, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMaxDecreasePercentage(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${maxDecreasePercentage === pct
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white border border-rose-200/80 text-rose-800 hover:bg-rose-100/50'
                        }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-rose-200/50 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Floor Price (Lowest Offer):</span>
                  <strong className="text-rose-700 text-sm font-extrabold">
                    ₹{floorRatePerKm}/km
                  </strong>
                </div>
              </div>

              {/* Allowed Increase (+%) */}
              <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 to-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <span>Allowed Increase Percentage (+%)</span>
                  </div>
                  {/* <span className="rounded-lg bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    +{maxIncreasePercentage}% Max Above
                  </span> */}
                </div>

                <p className="text-xs text-slate-500">
                  How much a user/driver can negotiate <strong>above</strong> the decided price of ₹{baseRatePerKm}/km.
                </p>

                {/* Direct Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Increase Percentage Limit</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">+</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxIncreasePercentage}
                      onChange={e => setMaxIncreasePercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full h-11 rounded-xl border border-emerald-200 bg-white pl-8 pr-12 text-base font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all shadow-2xs"
                      placeholder="0"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[5, 10, 15, 20, 25, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMaxIncreasePercentage(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${maxIncreasePercentage === pct
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/50'
                        }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-emerald-200/50 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Ceiling Price (Highest Bid):</span>
                  <strong className="text-emerald-700 text-sm font-extrabold">
                    ₹{ceilingRatePerKm}/km
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Live Trip Negotiation Simulator */}
            <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Live Trip Negotiation Simulation
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Simulated Distance:</span>
                  {[50, 100, 150, 250, 400].map(dist => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setSimulatedDistanceKm(dist)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${simulatedDistanceKm === dist
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {dist} km
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Price Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Node 1: Floor Offer */}
                <div className="bg-white rounded-xl p-4 border border-rose-100 shadow-2xs text-center space-y-1">
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    Lowest Acceptable Offer (-{maxDecreasePercentage}%)
                  </div>
                  <div className="text-2xl font-black text-rose-700">
                    ₹{simulatedFloorFare}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    ₹{floorRatePerKm} / km
                  </div>
                </div>

                {/* Node 2: Decided Standard Benchmark */}
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-600 shadow-2xs text-center space-y-1 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Official Decided Fare
                  </span>
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Standard Fare Benchmark
                  </div>
                  <div className="text-2xl font-black text-indigo-950">
                    ₹{simulatedStandardFare}
                  </div>
                  <div className="text-xs text-indigo-600 font-semibold">
                    ₹{baseRatePerKm.toFixed(2)} / km (Standard)
                  </div>
                </div>

                {/* Node 3: Ceiling Offer */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs text-center space-y-1">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    Highest Acceptable Bid (+{maxIncreasePercentage}%)
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    ₹{simulatedCeilingFare}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    ₹{ceilingRatePerKm} / km
                  </div>
                </div>
              </div>

              {/* Visual Range Indicator Bar */}
              <div className="pt-2">
                <div className="h-2.5 w-full bg-gradient-to-r from-rose-400 via-indigo-500 to-emerald-500 rounded-full"></div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-1.5">
                  <span>Min: ₹{simulatedFloorFare} (-{maxDecreasePercentage}%)</span>
                  <span>Decided Benchmark: ₹{simulatedStandardFare}</span>
                  <span>Max: ₹{simulatedCeilingFare} (+{maxIncreasePercentage}%)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center pt-1">
                Any counter-offer below <strong className="text-slate-800">₹{simulatedFloorFare}</strong> or above <strong className="text-slate-800">₹{simulatedCeilingFare}</strong> for a {simulatedDistanceKm} km trip will be rejected automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Fare negotiations are disabled. All passenger bookings must be placed at the standard rate of ₹{baseRatePerKm}/km.</span>
          </div>
        )}
      </div>

      {/* Helper Footer Card */}
      {/* <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 text-slate-600">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            Changes take effect in real-time across the carpool booking APIs and mobile apps upon saving.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 shrink-0">
          <span>Decided Rate: ₹{baseRatePerKm}/km</span>
          <span>•</span>
          <span>Negotiation: {enableFareNegotiation ? `-${maxDecreasePercentage}% to +${maxIncreasePercentage}%` : 'Disabled'}</span>
        </div>
      </div> */}
    </div>
  );
};
