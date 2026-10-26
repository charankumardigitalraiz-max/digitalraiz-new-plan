import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Loader2
} from 'lucide-react';
import { pricingService } from '../../services';

interface CarpoolSettingsProps {
  onShowToast?: (message: string) => void;
}

export const CarpoolSettings: React.FC<CarpoolSettingsProps> = ({ onShowToast }) => {
  // Loading & Saving States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Core API Fields (matching public/pricing.txt)
  // 1. pricePerKm: Standard benchmark rate charged per kilometer
  const [baseRatePerKm, setBaseRatePerKm] = useState<number | ''>(5.0);

  // 2. minAllowedDeviationPercent: Percentage flexibility allowed below decided price (-%)
  const [minAllowedDeviationPercent, setMinAllowedDeviationPercent] = useState<number | ''>(30.0);

  // 3. maxAllowedDeviationPercent: Percentage flexibility allowed above decided price (+%)
  const [maxAllowedDeviationPercent, setMaxAllowedDeviationPercent] = useState<number | ''>(30.0);

  // 4. platformCharge: Platform fee added to passenger bookings (default 0.0)
  const [platformCharge, setPlatformCharge] = useState<number | ''>(0.0);

  // Interactive Simulation Distance
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState<number>(100);

  // Fetch current carpool pricing configuration on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    pricingService
      .getPricingConfig()
      .then((config) => {
        if (!isMounted) return;
        if (typeof config.pricePerKm === 'number') {
          setBaseRatePerKm(config.pricePerKm);
        }
        if (typeof config.minAllowedDeviationPercent === 'number') {
          setMinAllowedDeviationPercent(config.minAllowedDeviationPercent);
        } else if (typeof config.allowedDeviationPercent === 'number') {
          setMinAllowedDeviationPercent(config.allowedDeviationPercent);
        }
        if (typeof config.maxAllowedDeviationPercent === 'number') {
          setMaxAllowedDeviationPercent(config.maxAllowedDeviationPercent);
        } else if (typeof config.allowedDeviationPercent === 'number') {
          setMaxAllowedDeviationPercent(config.allowedDeviationPercent);
        }
        if (typeof config.platformCharge === 'number') {
          setPlatformCharge(config.platformCharge);
        }
      })
      .catch((err) => {
        console.warn('Notice loading pricing config from backend:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Numbers used for calculations and API persistence
  const numBaseRate = baseRatePerKm === '' ? 0 : Number(baseRatePerKm);
  const numMinDev = minAllowedDeviationPercent === '' ? 0 : Number(minAllowedDeviationPercent);
  const numMaxDev = maxAllowedDeviationPercent === '' ? 0 : Number(maxAllowedDeviationPercent);
  const numPlatformCharge = platformCharge === '' ? 0 : Number(platformCharge);

  // Save handler - calls PUT /api/admin/pricing (public/pricing.txt)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await pricingService.updatePricingConfig({
        pricePerKm: numBaseRate || 5.0,
        minAllowedDeviationPercent: numMinDev,
        maxAllowedDeviationPercent: numMaxDev,
        allowedDeviationPercent: Math.round((numMinDev + numMaxDev) / 2),
        platformCharge: numPlatformCharge
      });

      if (updated) {
        setBaseRatePerKm(updated.pricePerKm);
        if (typeof updated.minAllowedDeviationPercent === 'number') {
          setMinAllowedDeviationPercent(updated.minAllowedDeviationPercent);
        }
        if (typeof updated.maxAllowedDeviationPercent === 'number') {
          setMaxAllowedDeviationPercent(updated.maxAllowedDeviationPercent);
        }
        setPlatformCharge(updated.platformCharge);
      }

      setIsSaved(true);
      onShowToast?.('Carpool pricing configuration updated successfully.');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to update pricing config:', err);
      onShowToast?.(err?.message || 'Failed to update pricing configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    setBaseRatePerKm(5.0);
    setMinAllowedDeviationPercent(30.0);
    setMaxAllowedDeviationPercent(30.0);
    setPlatformCharge(0.0);
    setSimulatedDistanceKm(100);
    onShowToast?.('Pricing settings restored to system defaults (₹5/km, -30% / +30% deviation).');
  };

  // Live calculations based on backend formulas:
  // suggestedPrice = Math.round(distanceKm * pricePerKm)
  // minAllowedPrice = suggestedPrice * (1 - minAllowedDeviationPercent / 100)
  // maxAllowedPrice = suggestedPrice * (1 + maxAllowedDeviationPercent / 100)
  const floorRatePerKm = +(numBaseRate * (1 - numMinDev / 100)).toFixed(2);
  const ceilingRatePerKm = +(numBaseRate * (1 + numMaxDev / 100)).toFixed(2);

  const simulatedStandardFare = Math.round(simulatedDistanceKm * numBaseRate);
  const simulatedFloorFare = Math.round(simulatedStandardFare * (1 - numMinDev / 100));
  const simulatedCeilingFare = Math.round(simulatedStandardFare * (1 + numMaxDev / 100));

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
            </div>
            <p className="text-[13px] font-normal text-slate-500 mt-0.5">
              Set standard price per km, negotiation decrease/increase percentage boundaries, and platform booking fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-2xs hover:shadow-indigo-200 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
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
                Standard Price per Kilometer
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Standard rate per kilometer used to calculate benchmark fares for intercity carpools.
            </p>
          </div>

          <label
            htmlFor="baseRatePerKmInput"
            className="relative flex items-center w-full sm:w-48 shrink-0 cursor-text group"
          >
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none select-none">
              ₹
            </span>
            <input
              id="baseRatePerKmInput"
              type="number"
              step="0.1"
              min="0"
              value={baseRatePerKm}
              onChange={e => {
                const val = e.target.value;
                if (val === '') {
                  setBaseRatePerKm('');
                  return;
                }
                const num = Number(val);
                if (!isNaN(num)) {
                  setBaseRatePerKm(Math.max(0, num));
                }
              }}
              onBlur={() => {
                if (baseRatePerKm === '' || Number(baseRatePerKm) <= 0) {
                  setBaseRatePerKm(5.0);
                }
              }}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50/70 pl-8.5 pr-14 text-base font-extrabold text-slate-900 outline-none hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 group-focus-within:text-slate-600 transition-colors pointer-events-none select-none">
              / km
            </span>
          </label>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400">Quick Presets:</span>
          {[5.0, 10.0, 15.0, 25.0, 50.0, 100.0].map(rate => (
            <button
              key={rate}
              type="button"
              onClick={() => setBaseRatePerKm(rate)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${numBaseRate === rate
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              ₹{rate.toFixed(1)}/km
            </button>
          ))}
        </div>
      </div>

      {/* 2. Fare Negotiation Boundaries */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Fare Negotiation Boundaries
              </h2>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold">
                {numMinDev === numMaxDev
                  ? `±${numMinDev}% Allowed Deviation`
                  : `-${numMinDev}% / +${numMaxDev}% Allowed Deviation`}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Configure how much passengers can negotiate below the standard price, and how much drivers can bid above it.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Decrease and Increase Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Allowed Decrease (-%) */}
            <div className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/30 to-white p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                  <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                  <span>Can Decrease Percentage (-%)</span>
                </div>
              </div>
              {/* 
              <p className="text-xs text-slate-500">
                Maximum discount a passenger can negotiate <strong>below</strong> the decided price of ₹{numBaseRate}/km.
              </p> */}

              {/* Direct Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Decrease Percentage Limit</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-rose-500">-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minAllowedDeviationPercent}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setMinAllowedDeviationPercent('');
                        return;
                      }
                      const num = Number(val);
                      if (!isNaN(num)) {
                        setMinAllowedDeviationPercent(Math.min(100, Math.max(0, num)));
                      }
                    }}
                    onBlur={() => {
                      if (minAllowedDeviationPercent === '') {
                        setMinAllowedDeviationPercent(0);
                      }
                    }}
                    className="w-full h-11 rounded-xl border border-rose-200 bg-white pl-8 pr-12 text-base font-semibold text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">%</span>
                </div>
              </div>

              {/* Quick Presets for Decrease */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-medium text-slate-400">Presets:</span>
                {[10, 15, 20, 25, 30, 40, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMinAllowedDeviationPercent(pct)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${numMinDev === pct
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
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
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <span>Can Increase Percentage (+%)</span>
                </div>
              </div>

              {/* <p className="text-xs text-slate-500">
                Maximum markup a user/driver can negotiate <strong>above</strong> the decided price of ₹{numBaseRate}/km.
              </p> */}

              {/* Direct Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Increase Percentage Limit</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-500">+</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={maxAllowedDeviationPercent}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setMaxAllowedDeviationPercent('');
                        return;
                      }
                      const num = Number(val);
                      if (!isNaN(num)) {
                        setMaxAllowedDeviationPercent(Math.min(100, Math.max(0, num)));
                      }
                    }}
                    onBlur={() => {
                      if (maxAllowedDeviationPercent === '') {
                        setMaxAllowedDeviationPercent(0);
                      }
                    }}
                    className="w-full h-11 rounded-xl border border-emerald-200 bg-white pl-8 pr-12 text-base font-semibold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all shadow-2xs"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">%</span>
                </div>
              </div>

              {/* Quick Presets for Increase */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-medium text-slate-400">Presets:</span>
                {[10, 15, 20, 25, 30, 40, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMaxAllowedDeviationPercent(pct)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${numMaxDev === pct
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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

          {/* 3. Platform Booking Fee */}
          {/* <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-900">
                  Platform Booking Fee
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fixed surcharge added to passenger ride bookings.
              </p>
            </div>

            <div className="relative w-36">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={platformCharge}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setPlatformCharge('');
                    return;
                  }
                  const num = Number(val);
                  if (!isNaN(num)) {
                    setPlatformCharge(Math.max(0, num));
                  }
                }}
                onBlur={() => {
                  if (platformCharge === '') {
                    setPlatformCharge(0);
                  }
                }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>
          </div> */}

          {/* 4. Live Trip Negotiation Simulator */}
          <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
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
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${simulatedDistanceKm === dist
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
                <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                  Lowest Acceptable Offer (-{numMinDev}%)
                </div>
                <div className="text-2xl font-semibold text-rose-700">
                  ₹{simulatedFloorFare}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  ₹{floorRatePerKm} / km
                </div>
              </div>

              {/* Node 2: Decided Standard Benchmark */}
              <div className="bg-white rounded-xl p-4 border-2 border-indigo-600 shadow-2xs text-center space-y-1 relative">
                <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Standard Fare Benchmark
                </div>
                <div className="text-2xl font-semibold text-indigo-950">
                  ₹{simulatedStandardFare}
                </div>
                <div className="text-xs text-indigo-600 font-semibold">
                  ₹{numBaseRate.toFixed(2)} / km (Standard)
                </div>
              </div>

              {/* Node 3: Ceiling Offer */}
              <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs text-center space-y-1">
                <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Highest Acceptable Bid (+{numMaxDev}%)
                </div>
                <div className="text-2xl font-semibold text-emerald-700">
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
                <span>Min: ₹{simulatedFloorFare} (-{numMinDev}%)</span>
                <span>Standard: ₹{simulatedStandardFare}</span>
                <span>Max: ₹{simulatedCeilingFare} (+{numMaxDev}%)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              Offers and counter-bids outside this range will not be permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
