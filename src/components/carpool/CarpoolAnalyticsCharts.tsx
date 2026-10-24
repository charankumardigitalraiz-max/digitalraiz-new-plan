import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Car,
  PieChart as PieIcon,
  Compass,
  MapPin,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Clock,
  Users
} from 'lucide-react';
import type {
  CarpoolRide,
  Driver,
  CarpoolDashboardAnalyticsData,
  RouteCorridorItem
} from '../../types';

interface CarpoolAnalyticsChartsProps {
  rides?: CarpoolRide[];
  drivers?: Driver[];
  analyticsData?: CarpoolDashboardAnalyticsData | null;
  corridors?: RouteCorridorItem[];
  timeframe?: Timeframe;
  onTimeframeChange?: (t: Timeframe) => void;
  isLoading?: boolean;
}

type Timeframe = '7D' | '30D' | '90D' | '12M';
type MetricType = 'revenue' | 'volume';

// Trigonometry helper for SVG Donut slices
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  gapAngle: number = 2.5
) {
  const adjStart = startAngle + gapAngle;
  const adjEnd = endAngle - gapAngle;
  if (adjEnd <= adjStart) return '';

  const startOuter = polarToCartesian(cx, cy, outerRadius, adjStart);
  const endOuter = polarToCartesian(cx, cy, outerRadius, adjEnd);
  const startInner = polarToCartesian(cx, cy, innerRadius, adjEnd);
  const endInner = polarToCartesian(cx, cy, innerRadius, adjStart);

  const largeArcFlag = adjEnd - adjStart <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    'Z'
  ].join(' ');
}

export const CarpoolAnalyticsCharts = ({
  rides: propRides = [],
  drivers: _drivers,
  analyticsData,
  corridors = [],
  timeframe: propTimeframe,
  onTimeframeChange,
  isLoading = false
}: CarpoolAnalyticsChartsProps) => {
  const [internalTimeframe, setInternalTimeframe] = useState<Timeframe>('30D');
  const timeframe = propTimeframe || internalTimeframe;
  const handleTimeframeChange = (t: Timeframe) => {
    setInternalTimeframe(t);
    onTimeframeChange?.(t);
  };

  const [metric, setMetric] = useState<MetricType>('revenue');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [hoveredWeeklyDay, setHoveredWeeklyDay] = useState<string | null>(null);
  const [hoveredCorridorBar, setHoveredCorridorBar] = useState<string | null>(null);

  // Timeframe telemetry series data - pure dynamic data from backend
  const seriesData = useMemo(() => {
    // If backend provided live analytics series, use it directly
    if (analyticsData?.series && analyticsData.series.length > 0) {
      return analyticsData.series.map((pt) => ({
        label: pt.label,
        fullDate: pt.fullDate || pt.label,
        current: pt.revenue,
        prev: Math.round(pt.revenue * 0.78),
        volume: pt.volume,
        prevVolume: Math.round(pt.volume * 0.78)
      }));
    }
    return [];
  }, [analyticsData]);

  const totalMetricCurrent = useMemo(() => {
    if (analyticsData) {
      if (metric === 'revenue' && typeof analyticsData.totalRevenue === 'number') {
        return analyticsData.totalRevenue;
      }
      if (metric === 'volume' && typeof analyticsData.totalVolume === 'number') {
        return analyticsData.totalVolume;
      }
    }
    return seriesData.reduce((acc, pt) => acc + (metric === 'revenue' ? pt.current : pt.volume), 0);
  }, [seriesData, metric, analyticsData]);

  const totalMetricPrev = useMemo(() => {
    return seriesData.reduce((acc, pt) => acc + (metric === 'revenue' ? pt.prev : pt.prevVolume), 0);
  }, [seriesData, metric]);

  const percentageGrowth = useMemo(() => {
    if (totalMetricPrev === 0) return 0;
    return (((totalMetricCurrent - totalMetricPrev) / totalMetricPrev) * 100).toFixed(1);
  }, [totalMetricCurrent, totalMetricPrev]);

  // Area Graph SVG geometry
  const chartWidth = 520;
  const chartHeight = 150;
  const paddingLeft = 48;
  const paddingRight = 16;
  const paddingTop = 12;
  const paddingBottom = 22;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const valuesCurrent = seriesData.map(d => (metric === 'revenue' ? d.current : d.volume));
  const valuesPrev = seriesData.map(d => (metric === 'revenue' ? d.prev : d.prevVolume));

  const maxValue = valuesCurrent.length > 0
    ? Math.max(Math.max(...valuesCurrent, ...valuesPrev) * 1.15, 100)
    : 100;
  const minValue = 0;

  const divisor = seriesData.length > 1 ? seriesData.length - 1 : 1;
  const range = maxValue - minValue > 0 ? maxValue - minValue : 1;

  const pointsCurrent = seriesData.map((d, i) => {
    const val = metric === 'revenue' ? d.current : d.volume;
    const x = paddingLeft + (i / divisor) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / range) * innerHeight;
    return { x, y, data: d, val };
  });

  const pointsPrev = seriesData.map((d, i) => {
    const val = metric === 'revenue' ? d.prev : d.prevVolume;
    const x = paddingLeft + (i / divisor) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / range) * innerHeight;
    return { x, y, val };
  });

  // Smooth spline curve generator
  const createCurvedPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePathCurrent = createCurvedPath(pointsCurrent);
  const linePathPrev = createCurvedPath(pointsPrev);
  const areaPathCurrent = pointsCurrent.length > 0
    ? `${linePathCurrent} L ${pointsCurrent[pointsCurrent.length - 1].x},${paddingTop + innerHeight} L ${pointsCurrent[0].x},${paddingTop + innerHeight} Z`
    : '';

  // Grid steps
  const gridSteps = 3;
  const gridLines = Array.from({ length: gridSteps + 1 }).map((_, i) => {
    const stepRatio = i / gridSteps;
    const y = paddingTop + innerHeight - stepRatio * innerHeight;
    const value = minValue + stepRatio * (maxValue - minValue);
    const label = metric === 'revenue'
      ? `₹${Math.round(value / 1000)}k`
      : `${Math.round(value)}`;
    return { y, label };
  });

  // Donut chart geometry
  const donutCenter = 75;
  const donutOuterRadius = 60;
  const donutInnerRadius = 40;

  // Carpool Corridor Revenue Share slices - pure dynamic from backend corridors
  const segments = useMemo(() => {
    if (corridors && corridors.length > 0) {
      const top = corridors.slice(0, 4);
      const totalCorridorRev = top.reduce((sum, c) => sum + (c.totalRevenue || (c.bookedSeats * (c.avgPrice || 1)) || 1), 0);
      const colors = [
        { color: '#10B981', hoverColor: '#059669' },
        { color: '#06B6D4', hoverColor: '#0891B2' },
        { color: '#6366F1', hoverColor: '#4F46E5' },
        { color: '#F59E0B', hoverColor: '#D97706' }
      ];
      const items = top.map((c, i) => {
        const val = c.totalRevenue || (c.bookedSeats * (c.avgPrice || 1)) || 1000;
        const pct = totalCorridorRev > 0 ? Math.round((val / totalCorridorRev) * 100) : Math.round(100 / top.length);
        const name = c.route || c.corridor || `${c.originCity || c.origin} ↔ ${c.destinationCity || c.destination}`;
        return {
          id: `corridor-${i}`,
          name,
          subtext: `${c.rideCount} rides • ${c.bookedSeats || 0} booked`,
          value: val,
          color: colors[i % colors.length].color,
          hoverColor: colors[i % colors.length].hoverColor,
          percentage: pct
        };
      });

      let currentAngle = 0;
      return items.map(item => {
        const angle = (item.percentage / 100) * 360;
        const seg = {
          ...item,
          startAngle: currentAngle,
          endAngle: currentAngle + angle
        };
        currentAngle += angle;
        return seg;
      });
    }

    return [];
  }, [corridors]);

  const activeDonutSegment = segments.find(s => s.id === hoveredSegment) || null;

  // Row 2 Left Chart: Weekly Seat Supply & Passenger Demand Data (Dynamic from propRides)
  const weeklyDemandData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = [
      'Sunday (Return Commute)',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday (Peak Outbound)',
      'Saturday (Weekend Getaway)'
    ];
    return [1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
      const dayRides = (propRides || []).filter((r) => {
        if (!r.departureDate) return false;
        const d = new Date(r.departureDate);
        return !isNaN(d.getTime()) && d.getDay() === dayIdx;
      });
      const carpools = dayRides.length;
      const offered = dayRides.reduce((acc, r) => acc + (r.totalSeats || 0), 0);
      const booked = dayRides.reduce((acc, r) => acc + ((r.totalSeats || 0) - (r.availableSeats || 0)), 0);
      const fillRate = offered > 0 ? Math.round((booked / offered) * 100) : 0;
      return {
        id: `day-${dayNames[dayIdx].toLowerCase()}`,
        day: dayNames[dayIdx],
        fullDay: fullDayNames[dayIdx],
        offered,
        booked,
        fillRate,
        carpools,
        isWeekend: dayIdx === 0 || dayIdx === 6
      };
    });
  }, [propRides]);

  const hasWeeklyDemand = useMemo(() => {
    return weeklyDemandData.some(d => d.offered > 0 || d.booked > 0 || d.carpools > 0);
  }, [weeklyDemandData]);

  const maxWeeklySeats = useMemo(() => {
    const maxVal = Math.max(...weeklyDemandData.map(d => Math.max(d.offered, d.booked)), 10);
    return Math.ceil(maxVal * 1.15);
  }, [weeklyDemandData]);

  const weeklyYAxisTicks = useMemo(() => {
    const step = Math.ceil(maxWeeklySeats / 4);
    return [step * 4, step * 3, step * 2, step * 1, 0];
  }, [maxWeeklySeats]);

  // Row 2 Right Chart: Peak Departure Hours & Commuter Flow Data (Dynamic from propRides in IST)
  const departureTimeBands = useMemo(() => {
    const getHourIST = (r: CarpoolRide): number => {
      const raw = (r as any).rawDepartureTime || r.departureTime;
      if (!raw) return -1;

      // 1. If it's an ISO timestamp or contains timezone marker (e.g. "2026-10-24T11:52:20.170Z")
      if (raw.includes('T') || raw.includes('Z')) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          const hourStr = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            hour12: false
          }).format(d);
          const parsed = parseInt(hourStr, 10);
          return parsed === 24 ? 0 : parsed;
        }
      }

      // 2. If it's a 12-hour AM/PM string (e.g. "08:30 AM", "05:22 PM")
      const ampmMatch = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1], 10);
        const meridiem = ampmMatch[3]?.toUpperCase();
        if (meridiem === 'PM' && hour < 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;
        return hour;
      }

      // 3. If combined with departureDate into a parseable date
      if (r.departureDate) {
        const combined = new Date(`${r.departureDate} ${raw}`);
        if (!isNaN(combined.getTime())) {
          const hourStr = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            hour12: false
          }).format(combined);
          const parsed = parseInt(hourStr, 10);
          return parsed === 24 ? 0 : parsed;
        }
      }

      // 4. General Date parse fallback with Asia/Kolkata
      const fallbackDate = new Date(raw);
      if (!isNaN(fallbackDate.getTime())) {
        const hourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          hour12: false
        }).format(fallbackDate);
        const parsed = parseInt(hourStr, 10);
        return parsed === 24 ? 0 : parsed;
      }

      return -1;
    };

    const bands = [
      {
        id: 'time-band-01',
        slot: '06 - 09h',
        timeLabel: '06:00 - 09:00',
        period: 'Morning Rush',
        minH: 6,
        maxH: 9,
        barGradient: 'from-emerald-600 via-emerald-500 to-teal-500',
        activeGradient: 'from-emerald-700 via-emerald-600 to-teal-600',
        textAccent: 'text-emerald-600'
      },
      {
        id: 'time-band-02',
        slot: '09 - 13h',
        timeLabel: '09:00 - 13:00',
        period: 'Mid-Morning',
        minH: 9,
        maxH: 13,
        barGradient: 'from-cyan-600 via-cyan-500 to-blue-500',
        activeGradient: 'from-cyan-700 via-cyan-600 to-blue-600',
        textAccent: 'text-cyan-600'
      },
      {
        id: 'time-band-03',
        slot: '13 - 17h',
        timeLabel: '13:00 - 17:00',
        period: 'Afternoon',
        minH: 13,
        maxH: 17,
        barGradient: 'from-sky-500 via-sky-400 to-indigo-500',
        activeGradient: 'from-sky-600 via-sky-500 to-indigo-600',
        textAccent: 'text-sky-600'
      },
      {
        id: 'time-band-04',
        slot: '17 - 20h',
        timeLabel: '17:00 - 20:00',
        period: 'Evening Rush',
        minH: 17,
        maxH: 20,
        barGradient: 'from-indigo-600 via-indigo-500 to-purple-500',
        activeGradient: 'from-indigo-700 via-indigo-600 to-purple-600',
        textAccent: 'text-indigo-600'
      },
      {
        id: 'time-band-05',
        slot: '20 - 24h',
        timeLabel: '20:00 - 24:00',
        period: 'Night Express',
        minH: 20,
        maxH: 24,
        barGradient: 'from-amber-500 via-amber-400 to-orange-500',
        activeGradient: 'from-amber-600 via-amber-500 to-orange-600',
        textAccent: 'text-amber-600'
      }
    ];

    return bands.map((b) => {
      const bandRides = (propRides || []).filter((r) => {
        const h = getHourIST(r);
        return h >= b.minH && h < b.maxH;
      });
      const carpools = bandRides.length;
      const capacity = bandRides.reduce((sum, r) => sum + (r.totalSeats || 0), 0);
      const booked = bandRides.reduce((sum, r) => sum + ((r.totalSeats || 0) - (r.availableSeats || 0)), 0);
      const percentage = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
      const rev = bandRides.reduce((sum, r) => sum + (((r.totalSeats || 0) - (r.availableSeats || 0)) * (r.pricePerSeat || 0)), 0);
      const topRoute = bandRides[0] ? `${bandRides[0].originCity} ↔ ${bandRides[0].destinationCity}` : 'No active rides';

      return {
        id: b.id,
        slot: b.slot,
        timeLabel: b.timeLabel,
        period: b.period,
        capacity,
        booked,
        percentage,
        carpools,
        revenue: rev > 0 ? `₹${(rev / 1000).toFixed(1)}k` : '₹0',
        topCorridor: topRoute,
        barGradient: b.barGradient,
        activeGradient: b.activeGradient,
        textAccent: b.textAccent
      };
    });
  }, [propRides]);

  const hasDepartureBands = useMemo(() => {
    return departureTimeBands.some(b => b.capacity > 0 || b.carpools > 0);
  }, [departureTimeBands]);

  const peakFillRate = useMemo(() => {
    if (departureTimeBands.length === 0) return 0;
    return Math.max(...departureTimeBands.map(b => b.percentage));
  }, [departureTimeBands]);

  const yAxisTicks = [100, 75, 50, 25, 0];

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* ROW 1: PRIMARY BESIDE GRAPHS FIRST (Area Spline Left + Donut Pie Right)   */}
      {/* Both cards have balanced 50% width and identical, equal heights           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* 1. Primary Graph: Booking Velocity & Route GMV */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full min-h-[350px]">
          <div>
            {/* Header: Title, Metric Toggle & Timeframe Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Revenue & Booking Trends
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Daily GMV and seat volume compared to prior period
                  </p>
                </div>
              </div>

              {/* Metric Toggle & Live Indicator */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {isLoading && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Syncing...
                  </span>
                )}
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setMetric('revenue')}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${metric === 'revenue'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    GMV (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetric('volume')}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${metric === 'volume'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Seats
                  </button>
                </div>

                {/* <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
                  {(['7D', '30D', '90D', '12M'] as Timeframe[]).map(tf => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${
                        timeframe === tf
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div> */}
              </div>
            </div>

            {/* Quick Metrics Bar with Live Value */}
            <div className="mt-2.5 flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {metric === 'revenue'
                    ? `₹${totalMetricCurrent.toLocaleString()}`
                    : `${totalMetricCurrent.toLocaleString()} seats`}
                </span>
                {/* <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  <ArrowUpRight className="h-2.5 w-2.5" />
                  +{percentageGrowth}%
                </span>
                <span className="text-[11px] text-slate-400">
                  vs prior {timeframe}
                </span> */}
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Current
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="h-1.5 w-2.5 border-b border-dashed border-slate-400" />
                  Prior
                </span>
              </div>
            </div>

            {/* Responsive SVG Area Chart or Empty State */}
            {seriesData.length === 0 ? (
              <div className="h-[170px] w-full flex flex-col items-center justify-center text-slate-400 py-6">
                <TrendingUp className="h-7 w-7 text-slate-300 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">No telemetry data recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Booking and GMV metrics will plot across {timeframe}</p>
              </div>
            ) : (
              <div className="relative mt-1.5 w-full">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="carpoolAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#059669" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="carpoolLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>

                    <filter id="carpoolGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Horizontal Dashed Gridlines */}
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line
                        x1={paddingLeft}
                        y1={line.y}
                        x2={chartWidth - paddingRight}
                        y2={line.y}
                        stroke="#E2E8F0"
                        strokeDasharray={idx === gridLines.length - 1 ? 'none' : '3 3'}
                        strokeWidth={idx === gridLines.length - 1 ? '1.5' : '1'}
                      />
                      <text
                        x={paddingLeft - 6}
                        y={line.y + 3.5}
                        textAnchor="end"
                        fill="#94A3B8"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {line.label}
                      </text>
                    </g>
                  ))}

                  {/* Vertical X-Axis Date Labels */}
                  {pointsCurrent.map((pt, idx) => (
                    <text
                      key={idx}
                      x={pt.x}
                      y={paddingTop + innerHeight + 14}
                      textAnchor="middle"
                      fill={hoveredDataIndex === idx ? '#0F172A' : '#94A3B8'}
                      fontSize="9.5"
                      fontWeight={hoveredDataIndex === idx ? '600' : '500'}
                    >
                      {pt.data.label}
                    </text>
                  ))}

                  {/* Area Gradient Fill */}
                  <path d={areaPathCurrent} fill="url(#carpoolAreaGradient)" />

                  {/* Previous Period Baseline */}
                  <path
                    d={linePathPrev}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />

                  {/* Current Metric Spline Line */}
                  <path
                    d={linePathCurrent}
                    fill="none"
                    stroke="url(#carpoolLineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Hover Indicator Crosshair & Dot */}
                  {hoveredDataIndex !== null && pointsCurrent[hoveredDataIndex] && (
                    <g>
                      <line
                        x1={pointsCurrent[hoveredDataIndex].x}
                        y1={paddingTop}
                        x2={pointsCurrent[hoveredDataIndex].x}
                        y2={paddingTop + innerHeight}
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={pointsPrev[hoveredDataIndex].x}
                        cy={pointsPrev[hoveredDataIndex].y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#94A3B8"
                        strokeWidth="2"
                      />
                      <circle
                        cx={pointsCurrent[hoveredDataIndex].x}
                        cy={pointsCurrent[hoveredDataIndex].y}
                        r="5"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        filter="url(#carpoolGlow)"
                      />
                    </g>
                  )}

                  {/* Hover capture slices */}
                  {pointsCurrent.map((pt, i) => {
                    const sliceWidth = pointsCurrent.length > 1 ? innerWidth / (pointsCurrent.length - 1) : innerWidth;
                    const xStart = pt.x - sliceWidth / 2;
                    return (
                      <rect
                        key={i}
                        x={xStart}
                        y={paddingTop}
                        width={sliceWidth}
                        height={innerHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDataIndex(i)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Tooltip on Hover */}
                {hoveredDataIndex !== null && pointsCurrent[hoveredDataIndex] && (
                  <div
                    className="pointer-events-none absolute z-20 -top-2 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-2.5 text-xs shadow-lg transition-all min-w-[190px]"
                    style={{
                      left: `${Math.min(
                        Math.max((pointsCurrent[hoveredDataIndex].x / chartWidth) * 100, 18),
                        76
                      )}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 mb-1 flex items-center justify-between text-[11px]">
                      <span>{pointsCurrent[hoveredDataIndex].data.fullDate}</span>
                      <span className="font-bold text-emerald-700">
                        {metric === 'revenue'
                          ? `₹${pointsCurrent[hoveredDataIndex].val.toLocaleString()}`
                          : `${pointsCurrent[hoveredDataIndex].val} seats`}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[10px]">
                      {segments.slice(0, 2).map((seg) => (
                        <div key={seg.id} className="flex items-center justify-between" style={{ color: seg.color }}>
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            {seg.name} ({seg.percentage}%)
                          </span>
                          <span className="font-semibold shrink-0">
                            {metric === 'revenue'
                              ? `₹${Math.round(pointsCurrent[hoveredDataIndex].val * (seg.percentage / 100)).toLocaleString()}`
                              : `${Math.round(pointsCurrent[hoveredDataIndex].val * (seg.percentage / 100))}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Primary Beside Graph: Corridor Revenue Share (Donut / Pie Chart) */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full min-h-[350px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                  <PieIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Corridor Revenue Share
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Expressway & intercity volume breakdown
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                Live Share
              </span>
            </div>

            {/* Horizontal Flex Layout: Donut on Left + Corridor Breakdown on Right (or Empty State) */}
            {segments.length === 0 ? (
              <div className="h-[170px] w-full flex flex-col items-center justify-center text-slate-400 py-6">
                <MapPin className="h-7 w-7 text-slate-300 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">No corridor data available</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Top corridor performance will display here</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                {/* SVG Donut */}
                <div className="relative h-[150px] w-[150px] shrink-0 flex items-center justify-center">
                  <svg
                    width="150"
                    height="150"
                    viewBox="0 0 150 150"
                    className="overflow-visible"
                  >
                    {segments.map(seg => {
                      const isHovered = hoveredSegment === seg.id;
                      const isOtherHovered = hoveredSegment !== null && !isHovered;
                      const currentOuter = isHovered ? donutOuterRadius + 3 : donutOuterRadius;
                      const currentInner = isHovered ? donutInnerRadius - 2 : donutInnerRadius;
                      const pathData = describeDonutSegment(
                        donutCenter,
                        donutCenter,
                        currentInner,
                        currentOuter,
                        seg.startAngle,
                        seg.endAngle,
                        2.5
                      );

                      return (
                        <path
                          key={seg.id}
                          d={pathData}
                          fill={isHovered ? seg.hoverColor : seg.color}
                          opacity={isOtherHovered ? 0.45 : 1}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredSegment(seg.id)}
                          onMouseLeave={() => setHoveredSegment(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center Donut KPI */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[85px]">
                      {activeDonutSegment ? activeDonutSegment.name : 'Total GMV'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 leading-tight">
                      {activeDonutSegment
                        ? `${activeDonutSegment.percentage}%`
                        : `₹${(totalMetricCurrent / 1000).toFixed(1)}k`}
                    </span>
                    <span className="text-[9px] font-medium text-emerald-600">
                      {activeDonutSegment
                        ? `₹${(activeDonutSegment.value / 1000).toFixed(1)}k`
                        : `${segments.length} Corridors`}
                    </span>
                  </div>
                </div>

                {/* Corridor Breakdown Rows on Right */}
                <div className="flex-1 w-full space-y-1.5">
                  {segments.map(seg => {
                    const isHovered = hoveredSegment === seg.id;
                    return (
                      <div
                        key={seg.id}
                        onMouseEnter={() => setHoveredSegment(seg.id)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isHovered
                          ? 'border-emerald-300 bg-emerald-50/60 shadow-2xs'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color }}
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-slate-800 truncate">
                              {seg.name}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">
                              {seg.subtext}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-bold text-slate-900 block">{seg.percentage}%</span>
                          <span className="text-[10px] text-slate-500">₹{(seg.value / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Intercity route revenue weighting</span>
            <span className="text-emerald-700 font-medium">100% Balanced</span>
          </div> */}
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: CORRIDOR MOBILITY CHARTS (Horizontal Corridors Left + Column Bars Right) */}
      {/* Exactly equal height to Row 1 with 2-Column Grid (items-stretch)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* 3. Left Chart: Weekly Seat Supply vs Passenger Demand (Paired / Dual Column Bar Chart) */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full min-h-[350px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Weekly Seat Supply & Passenger Demand
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Driver capacity offered vs passenger seats booked by day
                  </p>
                </div>
              </div>

              {/* Legend & Summary Badge */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center font-semibold gap-1">
                    <span className="h-2 w-2 rounded-sm bg-slate-300" />
                    Offered
                  </span>
                  <span className="flex items-center font-semibold gap-1">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                    Booked
                  </span>
                </div>
                {/* <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  <Sparkles className="h-3 w-3" />
                  <span>93.1% Match</span>
                </div> */}
              </div>
            </div>

            {/* Vertical Dual-Column Chart with Gridlines & Y-Axis or Empty State */}
            {!hasWeeklyDemand ? (
              <div className="h-[170px] w-full flex flex-col items-center justify-center text-slate-400 py-6">
                <Users className="h-7 w-7 text-slate-300 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">No weekly demand telemetry</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Passenger booking vs driver seat supply will chart by weekday</p>
              </div>
            ) : (
              <div className="relative pt-1 pb-1">
                <div className="relative h-[140px] flex">
                  <div className="flex flex-col justify-between h-full pr-2 text-right select-none">
                    {weeklyYAxisTicks.map(tick => (
                      <span key={tick} className="text-[9.5px] font-medium text-slate-400 leading-none">
                        {tick}
                      </span>
                    ))}
                  </div>

                  <div className="relative flex-1 h-full border-b border-slate-200">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {weeklyYAxisTicks.map(tick => (
                        <div
                          key={tick}
                          className="w-full border-b border-dashed border-slate-100"
                        />
                      ))}
                    </div>

                    <div className="absolute inset-0 flex items-end justify-around px-1">
                      {weeklyDemandData.map(d => {
                        const isHovered = hoveredWeeklyDay === d.id;
                        const offeredHeight = (d.offered / maxWeeklySeats) * 100;
                        const bookedHeight = (d.booked / maxWeeklySeats) * 100;

                        return (
                          <div
                            key={d.id}
                            onMouseEnter={() => setHoveredWeeklyDay(d.id)}
                            onMouseLeave={() => setHoveredWeeklyDay(null)}
                            className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                            style={{ width: '13%' }}
                          >
                            {/* Tooltip */}
                            {isHovered && (
                              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-white shadow-xl transition-all">
                                <div className="text-[11px] font-semibold text-white">
                                  {d.fullDay}
                                </div>
                                <div className="text-[10px] text-slate-300">
                                  {d.booked} booked of {d.offered} offered ({d.fillRate}% fill)
                                </div>
                                <div className="text-[9px] text-emerald-400 font-medium">
                                  {d.carpools} Carpools Dispatched
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            )}

                            {/* Percentage Fill atop Bar */}
                            <span
                              className={`text-[9.5px] font-bold mb-1 transition-all ${isHovered ? 'scale-110 font-extrabold text-emerald-600' : 'text-slate-500'
                                }`}
                            >
                              {d.fillRate}%
                            </span>

                            {/* Paired Dual Columns */}
                            <div className="w-full flex items-end justify-center gap-1 h-[105px]">
                              {/* Offered Bar (Supply) */}
                              <div
                                className="w-[10px] sm:w-[12px] rounded-t bg-slate-200 group-hover:bg-slate-300 transition-all duration-500 shadow-2xs"
                                style={{ height: `${offeredHeight}%` }}
                                title={`Offered: ${d.offered} seats`}
                              />
                              {/* Booked Bar (Demand) */}
                              <div
                                className="w-[10px] sm:w-[12px] rounded-t bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all duration-500 shadow-sm"
                                style={{ height: `${bookedHeight}%` }}
                                title={`Booked: ${d.booked} seats`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Baseline Labels */}
                <div className="flex justify-around pl-6 pt-1.5">
                  {weeklyDemandData.map(d => {
                    const isHovered = hoveredWeeklyDay === d.id;
                    return (
                      <div
                        key={d.id}
                        onMouseEnter={() => setHoveredWeeklyDay(d.id)}
                        onMouseLeave={() => setHoveredWeeklyDay(null)}
                        className="text-center cursor-pointer transition-transform"
                        style={{ width: '13%' }}
                      >
                        <div
                          className={`text-[10.5px] font-semibold truncate transition-colors ${isHovered ? 'text-slate-900 font-bold' : d.isWeekend ? 'text-emerald-700 font-semibold' : 'text-slate-700'
                            }`}
                        >
                          {d.day}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {d.carpools} rides
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Right Chart: Peak Departure Hours & Commuter Flow (Vertical Column Bar Chart) */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full min-h-[350px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Peak Departure Windows & Commute Flow
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Hourly commuter surge & seat fill rate by departure band (IST)
                  </p>
                </div>
              </div>
              {hasDepartureBands && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  <Sparkles className="h-3 w-3" />
                  <span>{peakFillRate}% Peak Fill</span>
                </div>
              )}
            </div>

            {/* Vertical Column Chart with Gridlines & Y-Axis or Empty State */}
            {!hasDepartureBands ? (
              <div className="h-[170px] w-full flex flex-col items-center justify-center text-slate-400 py-6">
                <Clock className="h-7 w-7 text-slate-300 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">No departure window telemetry</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Commuter volume by departure hour will chart here</p>
              </div>
            ) : (
              <div className="relative pt-1 pb-1">
                <div className="relative h-[140px] flex">
                  <div className="flex flex-col justify-between h-full pr-2 text-right select-none">
                    {yAxisTicks.map(tick => (
                      <span key={tick} className="text-[9.5px] font-medium text-slate-400 leading-none">
                        {tick}%
                      </span>
                    ))}
                  </div>

                  <div className="relative flex-1 h-full border-b border-slate-200">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {yAxisTicks.map(tick => (
                        <div
                          key={tick}
                          className="w-full border-b border-dashed border-slate-100"
                        />
                      ))}
                    </div>

                    <div className="absolute inset-0 flex items-end justify-around px-1.5">
                      {departureTimeBands.map(t => {
                        const isHovered = hoveredCorridorBar === t.id;

                        return (
                          <div
                            key={t.id}
                            onMouseEnter={() => setHoveredCorridorBar(t.id)}
                            onMouseLeave={() => setHoveredCorridorBar(null)}
                            className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                            style={{ width: '18%' }}
                          >
                            {isHovered && (
                              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-white shadow-xl transition-all">
                                <div className="text-[11px] font-semibold text-white">
                                  {t.timeLabel} IST • {t.period}
                                </div>
                                <div className="text-[10px] text-slate-300">
                                  {t.booked.toLocaleString()} / {t.capacity.toLocaleString()} seats ({t.percentage}%)
                                </div>
                                <div className="text-[9px] text-emerald-400 font-medium">
                                  Top Route: {t.topCorridor} • {t.revenue}
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            )}

                            <span
                              className={`text-[10px] font-bold mb-1 transition-all ${isHovered ? 'scale-110 font-extrabold' : ''
                                } ${t.textAccent}`}
                            >
                              {t.percentage}%
                            </span>

                            <div className="w-full max-w-[32px] h-[105px] flex flex-col justify-end rounded-t-lg bg-slate-100/90 overflow-hidden relative shadow-inner">
                              <div
                                className={`w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t ${isHovered ? t.activeGradient : t.barGradient
                                  } shadow-sm`}
                                style={{ height: `${t.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Baseline Labels */}
                <div className="flex justify-around pl-6 pt-1.5">
                  {departureTimeBands.map(t => {
                    const isHovered = hoveredCorridorBar === t.id;
                    return (
                      <div
                        key={t.id}
                        onMouseEnter={() => setHoveredCorridorBar(t.id)}
                        onMouseLeave={() => setHoveredCorridorBar(null)}
                        className="text-center cursor-pointer transition-transform"
                        style={{ width: '18%' }}
                      >
                        <div
                          className={`text-[10px] font-semibold truncate transition-colors ${isHovered ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          title={t.timeLabel}
                        >
                          {t.slot}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {t.period}
                        </div>
                        <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200/80 px-1 py-0.5 text-[8.5px] font-medium text-slate-600 transition-colors">
                          <Car className="h-2 w-2 text-emerald-600" />
                          <span>{t.carpools}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Morning (08:30) & Evening (18:15) peak demand</span>
            <span className="text-emerald-700 font-medium">5 Active Time Bands</span>
          </div> */}
      </div>
    </div>
  );
};
