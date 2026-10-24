import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Car,
  Music,
  Compass,
  ArrowUpRight,
  Info,
  PieChart as PieIcon,
  CheckCircle2,
  Layers
} from 'lucide-react';
import type { CarpoolRide, ConcertEvent, TripPlan } from '../../types';

interface EcosystemChartsProps {
  rides: CarpoolRide[];
  concerts: ConcertEvent[];
  trips: TripPlan[];
}

type Timeframe = '7D' | '30D' | '90D' | '12M';
type MetricType = 'revenue' | 'volume';
type ModuleFilter = 'all' | 'carpooling' | 'concerts' | 'trips';

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

export const EcosystemCharts = ({
  rides,
  concerts,
  trips
}: EcosystemChartsProps) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [metric, setMetric] = useState<MetricType>('revenue');
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Timeframe series data
  const seriesData = useMemo(() => {
    if (timeframe === '7D') {
      return [
        { label: 'Mon', fullDate: 'Mon, Oct 17', current: 18200, prev: 14500, volume: 215, prevVolume: 172 },
        { label: 'Tue', fullDate: 'Tue, Oct 18', current: 21400, prev: 16800, volume: 254, prevVolume: 201 },
        { label: 'Wed', fullDate: 'Wed, Oct 19', current: 20100, prev: 18200, volume: 238, prevVolume: 216 },
        { label: 'Thu', fullDate: 'Thu, Oct 20', current: 27900, prev: 21300, volume: 332, prevVolume: 254 },
        { label: 'Fri', fullDate: 'Fri, Oct 21', current: 36400, prev: 28500, volume: 432, prevVolume: 340 },
        { label: 'Sat', fullDate: 'Sat, Oct 22', current: 43800, prev: 34200, volume: 520, prevVolume: 408 },
        { label: 'Sun', fullDate: 'Sun, Oct 23 (Today)', current: 39800, prev: 31200, volume: 472, prevVolume: 372 }
      ];
    }
    if (timeframe === '90D') {
      return [
        { label: 'Aug W1', fullDate: 'Aug 1-7, 2026', current: 52000, prev: 42000, volume: 620, prevVolume: 500 },
        { label: 'Aug W3', fullDate: 'Aug 15-21, 2026', current: 67000, prev: 54000, volume: 800, prevVolume: 645 },
        { label: 'Sep W1', fullDate: 'Sep 1-7, 2026', current: 78000, prev: 63000, volume: 930, prevVolume: 750 },
        { label: 'Sep W3', fullDate: 'Sep 15-21, 2026', current: 98000, prev: 77000, volume: 1170, prevVolume: 920 },
        { label: 'Oct W1', fullDate: 'Oct 1-7, 2026', current: 115000, prev: 91000, volume: 1370, prevVolume: 1085 },
        { label: 'Oct W3', fullDate: 'Oct 15-21, 2026', current: 142000, prev: 110000, volume: 1690, prevVolume: 1310 },
        { label: 'Current', fullDate: 'Oct 22-23, 2026', current: 158000, prev: 124000, volume: 1880, prevVolume: 1480 }
      ];
    }
    if (timeframe === '12M') {
      return [
        { label: 'Nov', fullDate: 'Nov 2025', current: 125000, prev: 98000, volume: 1490, prevVolume: 1170 },
        { label: 'Jan', fullDate: 'Jan 2026', current: 148000, prev: 116000, volume: 1760, prevVolume: 1380 },
        { label: 'Mar', fullDate: 'Mar 2026', current: 182000, prev: 139000, volume: 2170, prevVolume: 1660 },
        { label: 'May', fullDate: 'May 2026', current: 224000, prev: 172000, volume: 2670, prevVolume: 2050 },
        { label: 'Jul', fullDate: 'Jul 2026', current: 289000, prev: 221000, volume: 3440, prevVolume: 2630 },
        { label: 'Sep', fullDate: 'Sep 2026', current: 338000, prev: 258000, volume: 4020, prevVolume: 3070 },
        { label: 'Oct', fullDate: 'Oct 2026', current: 378000, prev: 288000, volume: 4500, prevVolume: 3430 }
      ];
    }
    // Default: '30D'
    return [
      { label: 'Oct 1', fullDate: 'Wednesday, Oct 1', current: 21500, prev: 17500, volume: 256, prevVolume: 208 },
      { label: 'Oct 5', fullDate: 'Sunday, Oct 5', current: 25800, prev: 20900, volume: 307, prevVolume: 249 },
      { label: 'Oct 9', fullDate: 'Thursday, Oct 9', current: 30400, prev: 24800, volume: 362, prevVolume: 295 },
      { label: 'Oct 13', fullDate: 'Monday, Oct 13', current: 28600, prev: 26100, volume: 340, prevVolume: 311 },
      { label: 'Oct 17', fullDate: 'Friday, Oct 17', current: 35900, prev: 29400, volume: 427, prevVolume: 350 },
      { label: 'Oct 20', fullDate: 'Monday, Oct 20', current: 43200, prev: 33700, volume: 514, prevVolume: 401 },
      { label: 'Oct 23', fullDate: 'Thursday, Oct 23', current: 48600, prev: 37200, volume: 579, prevVolume: 443 }
    ];
  }, [timeframe]);

  // Total current and previous metrics
  const totalMetricCurrent = useMemo(() => {
    return seriesData.reduce((acc, pt) => acc + (metric === 'revenue' ? pt.current : pt.volume), 0);
  }, [seriesData, metric]);

  const totalMetricPrev = useMemo(() => {
    return seriesData.reduce((acc, pt) => acc + (metric === 'revenue' ? pt.prev : pt.prevVolume), 0);
  }, [seriesData, metric]);

  const percentageGrowth = useMemo(() => {
    if (totalMetricPrev === 0) return 0;
    return (((totalMetricCurrent - totalMetricPrev) / totalMetricPrev) * 100).toFixed(1);
  }, [totalMetricCurrent, totalMetricPrev]);

  // Synchronized Donut segments matching the active timeframe total
  const segments = useMemo(() => {
    // Allocation ratios: Carpooling 47%, Concerts 33%, Expeditions 20%
    const carpoolRatio = 0.47;
    const concertRatio = 0.33;
    const tripsRatio = 0.20;

    const carpoolVal = Math.round(totalMetricCurrent * carpoolRatio);
    const concertVal = Math.round(totalMetricCurrent * concertRatio);
    const tripsVal = totalMetricCurrent - carpoolVal - concertVal;

    return [
      {
        id: 'carpooling',
        name: 'Carpool Rides',
        subtext: `${rides.length} active routes`,
        value: carpoolVal,
        percentage: 47,
        startAngle: 0,
        endAngle: 0.47 * 360,
        color: '#10B981', // Emerald 500
        hoverColor: '#059669',
        icon: Car,
        accentBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        badge: 'Top Mover'
      },
      {
        id: 'concerts',
        name: 'Concert Stages',
        subtext: `${concerts.length} stadium events`,
        value: concertVal,
        percentage: 33,
        startAngle: 0.47 * 360,
        endAngle: (0.47 + 0.33) * 360,
        color: '#8B5CF6', // Purple 500
        hoverColor: '#7C3AED',
        icon: Music,
        accentBg: 'bg-purple-50 text-purple-600 border-purple-200',
        badge: 'High Margin'
      },
      {
        id: 'trips',
        name: 'Expedition Trips',
        subtext: `${trips.length} curated plans`,
        value: tripsVal,
        percentage: 20,
        startAngle: (0.47 + 0.33) * 360,
        endAngle: 360,
        color: '#F59E0B', // Amber 500
        hoverColor: '#D97706',
        icon: Compass,
        accentBg: 'bg-amber-50 text-amber-600 border-amber-200',
        badge: 'Trending'
      }
    ];
  }, [totalMetricCurrent, rides.length, concerts.length, trips.length]);

  // Donut geometry - compactly proportioned
  const donutCenter = 90;
  const donutOuterRadius = 74;
  const donutInnerRadius = 50;

  // Active donut segment on hover
  const activeDonut = hoveredSegment ? segments.find(s => s.id === hoveredSegment) : null;

  // Area Graph SVG geometry - compactly scaled
  const chartWidth = 660;
  const chartHeight = 220;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 16;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Multi-module point value calculations
  const getPointValue = (raw: number, moduleKey: ModuleFilter) => {
    switch (moduleKey) {
      case 'carpooling': return Math.round(raw * 0.47);
      case 'concerts': return Math.round(raw * 0.33);
      case 'trips': return Math.round(raw * 0.20);
      default: return raw;
    }
  };

  const valuesCurrent = seriesData.map(d => {
    const raw = metric === 'revenue' ? d.current : d.volume;
    return getPointValue(raw, moduleFilter);
  });

  const valuesPrev = seriesData.map(d => {
    const raw = metric === 'revenue' ? d.prev : d.prevVolume;
    return getPointValue(raw, moduleFilter);
  });

  const maxValue = Math.max(...valuesCurrent, ...valuesPrev) * 1.15;
  const minValue = 0;

  // Points for active filter
  const pointsCurrent = seriesData.map((d, i) => {
    const rawVal = metric === 'revenue' ? d.current : d.volume;
    const val = getPointValue(rawVal, moduleFilter);
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, data: d, val, rawVal };
  });

  const pointsPrev = seriesData.map((d, i) => {
    const rawVal = metric === 'revenue' ? d.prev : d.prevVolume;
    const val = getPointValue(rawVal, moduleFilter);
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, val };
  });

  // Smooth spline generator
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
  const areaPathCurrent = `${linePathCurrent} L ${pointsCurrent[pointsCurrent.length - 1].x},${paddingTop + innerHeight} L ${pointsCurrent[0].x},${paddingTop + innerHeight} Z`;

  // Secondary sub-module curves for "All Modules" view
  const pointsCarpool = seriesData.map((d, i) => {
    const raw = metric === 'revenue' ? d.current : d.volume;
    const val = Math.round(raw * 0.47);
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, val };
  });

  const pointsConcerts = seriesData.map((d, i) => {
    const raw = metric === 'revenue' ? d.current : d.volume;
    const val = Math.round(raw * 0.33);
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, val };
  });

  const pointsTrips = seriesData.map((d, i) => {
    const raw = metric === 'revenue' ? d.current : d.volume;
    const val = Math.round(raw * 0.20);
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, val };
  });

  const linePathCarpool = createCurvedPath(pointsCarpool);
  const linePathConcerts = createCurvedPath(pointsConcerts);
  const linePathTrips = createCurvedPath(pointsTrips);

  // Grid steps
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }).map((_, i) => {
    const stepRatio = i / gridSteps;
    const y = paddingTop + innerHeight - stepRatio * innerHeight;
    const value = minValue + stepRatio * (maxValue - minValue);
    const label = metric === 'revenue'
      ? `₹${Math.round(value / 1000)}k`
      : `${Math.round(value)}`;
    return { y, label };
  });

  // Current display aggregate according to moduleFilter
  const displayCurrentTotal = useMemo(() => {
    switch (moduleFilter) {
      case 'carpooling': return Math.round(totalMetricCurrent * 0.47);
      case 'concerts': return Math.round(totalMetricCurrent * 0.33);
      case 'trips': return Math.round(totalMetricCurrent * 0.20);
      default: return totalMetricCurrent;
    }
  }, [totalMetricCurrent, moduleFilter]);

  // Color theme per active filter
  const activeColorTheme = useMemo(() => {
    switch (moduleFilter) {
      case 'carpooling':
        return {
          strokeStart: '#10B981',
          strokeEnd: '#059669',
          areaFillStart: '#10B981',
          glowDot: '#10B981',
          name: 'Carpool Rides Only'
        };
      case 'concerts':
        return {
          strokeStart: '#8B5CF6',
          strokeEnd: '#7C3AED',
          areaFillStart: '#8B5CF6',
          glowDot: '#8B5CF6',
          name: 'Concert Stages Only'
        };
      case 'trips':
        return {
          strokeStart: '#F59E0B',
          strokeEnd: '#D97706',
          areaFillStart: '#F59E0B',
          glowDot: '#F59E0B',
          name: 'Expedition Trips Only'
        };
      default:
        return {
          strokeStart: '#4F46E5',
          strokeEnd: '#7C3AED',
          areaFillStart: '#4F46E5',
          glowDot: '#4F46E5',
          name: 'All Modules Ecosystem'
        };
    }
  }, [moduleFilter]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
      {/* 1. Main Graph: Ecosystem Booking Velocity & Growth (Left Card) */}
      <div className="xl:col-span-2 rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full">
        <div>
          {/* Top Header: Title & Timeframe + Metric Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ecosystem Booking Velocity & Growth
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live telemetry across Carpooling, Concerts & Itineraries
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Toggle + Timeframe Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMetric('revenue')}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${metric === 'revenue'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Gross GMV (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setMetric('volume')}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${metric === 'volume'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Bookings Count
                </button>
              </div>

              {/* <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
                {(['7D', '30D', '90D', '12M'] as Timeframe[]).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${timeframe === tf
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div> */}
            </div>
          </div>


          {/* Quick Metrics Bar with Live Value & Module Distribution Badges */}
          <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {metric === 'revenue'
                  ? `₹${displayCurrentTotal.toLocaleString()}`
                  : `${displayCurrentTotal.toLocaleString()} bookings`}
              </span>
              {/* <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                <ArrowUpRight className="h-3 w-3" />
                +{percentageGrowth}%
              </span>
              <span className="text-xs text-slate-400">
                vs prior {timeframe}
              </span> */}
            </div>

            {/* Quick 3-module pill banner: always clearly shows all module stats */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/60 px-2 py-1 text-emerald-800">
                <Car className="h-3 w-3 text-emerald-600" />
                <span className="font-medium">Carpool:</span>
                <span className="font-semibold">
                  {metric === 'revenue'
                    ? `₹${(Math.round(totalMetricCurrent * 0.47) / 1000).toFixed(1)}k`
                    : `${Math.round(totalMetricCurrent * 0.47)}`}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/60 px-2 py-1 text-purple-800">
                <Music className="h-3 w-3 text-purple-600" />
                <span className="font-medium">Concerts:</span>
                <span className="font-semibold">
                  {metric === 'revenue'
                    ? `₹${(Math.round(totalMetricCurrent * 0.33) / 1000).toFixed(1)}k`
                    : `${Math.round(totalMetricCurrent * 0.33)}`}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50/60 px-2 py-1 text-amber-800">
                <Compass className="h-3 w-3 text-amber-600" />
                <span className="font-medium">Trips:</span>
                <span className="font-semibold">
                  {metric === 'revenue'
                    ? `₹${(Math.round(totalMetricCurrent * 0.20) / 1000).toFixed(1)}k`
                    : `${Math.round(totalMetricCurrent * 0.20)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Responsive SVG Area Chart - Adjusted height to ensure both cards match */}
          <div className="relative mt-2 w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Dynamic Area Gradient Fill */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColorTheme.areaFillStart} stopOpacity="0.25" />
                  <stop offset="60%" stopColor={activeColorTheme.strokeEnd} stopOpacity="0.06" />
                  <stop offset="100%" stopColor={activeColorTheme.strokeStart} stopOpacity="0.0" />
                </linearGradient>

                {/* Dynamic Line Gradient */}
                <linearGradient id="lineStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={activeColorTheme.strokeStart} />
                  <stop offset="100%" stopColor={activeColorTheme.strokeEnd} />
                </linearGradient>

                {/* Drop shadow for hover dot */}
                <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={activeColorTheme.glowDot} floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {gridLines.map((gl, i) => (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={gl.y}
                    x2={chartWidth - paddingRight}
                    y2={gl.y}
                    stroke="#F1F5F9"
                    strokeDasharray={i === 0 ? undefined : '3 3'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={gl.y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                    fontFamily="Inter, sans-serif"
                  >
                    {gl.label}
                  </text>
                </g>
              ))}

              {/* Prior Period Reference Line (Dashed) */}
              <path
                d={linePathPrev}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />

              {/* Current Period Area Fill */}
              <path
                d={areaPathCurrent}
                fill="url(#areaGradient)"
              />

              {/* If "All Modules" is selected, render subtle sub-module lines so all verticals are visible */}
              {moduleFilter === 'all' && (
                <>
                  <path
                    d={linePathCarpool}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.65"
                  />
                  <path
                    d={linePathConcerts}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.65"
                  />
                  <path
                    d={linePathTrips}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.65"
                  />
                </>
              )}

              {/* Current Period Main Curve */}
              <path
                d={linePathCurrent}
                fill="none"
                stroke="url(#lineStrokeGradient)"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X-Axis Dates */}
              {pointsCurrent.map((pt, i) => (
                <text
                  key={i}
                  x={pt.x}
                  y={paddingTop + innerHeight + 18}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="#64748B"
                  fontWeight="500"
                  fontFamily="Inter, sans-serif"
                >
                  {pt.data.label}
                </text>
              ))}

              {/* Hover Indicator Line & Dot */}
              {hoveredDataIndex !== null && pointsCurrent[hoveredDataIndex] && (
                <g>
                  <line
                    x1={pointsCurrent[hoveredDataIndex].x}
                    y1={paddingTop}
                    x2={pointsCurrent[hoveredDataIndex].x}
                    y2={paddingTop + innerHeight}
                    stroke={activeColorTheme.glowDot}
                    strokeWidth="1.25"
                    strokeDasharray="2 2"
                    opacity="0.75"
                  />
                  <circle
                    cx={pointsPrev[hoveredDataIndex].x}
                    cy={pointsPrev[hoveredDataIndex].y}
                    r="3.5"
                    fill="#94A3B8"
                  />
                  <circle
                    cx={pointsCurrent[hoveredDataIndex].x}
                    cy={pointsCurrent[hoveredDataIndex].y}
                    r="5"
                    fill={activeColorTheme.glowDot}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    filter="url(#dotGlow)"
                  />
                </g>
              )}

              {/* Interactive Hit Areas */}
              {pointsCurrent.map((pt, i) => {
                const sliceWidth = innerWidth / (pointsCurrent.length - 1);
                const xStart = i === 0 ? paddingLeft : pt.x - sliceWidth / 2;
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

            {/* Dynamic Multi-Module Tooltip */}
            {hoveredDataIndex !== null && pointsCurrent[hoveredDataIndex] && (
              <div
                className="pointer-events-none absolute z-20 -top-1 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-3 text-xs shadow-lg transition-all min-w-[210px]"
                style={{
                  left: `${Math.min(
                    Math.max(
                      (pointsCurrent[hoveredDataIndex].x / chartWidth) * 100,
                      15
                    ),
                    78
                  )}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center justify-between">
                  <span>{pointsCurrent[hoveredDataIndex].data.fullDate}</span>
                  <span className="font-bold text-indigo-600">
                    {metric === 'revenue'
                      ? `₹${pointsCurrent[hoveredDataIndex].val.toLocaleString()}`
                      : `${pointsCurrent[hoveredDataIndex].val}`}
                  </span>
                </div>

                {/* All modules breakdown inside tooltip */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Carpool (47%)
                    </span>
                    <span className="font-semibold">
                      {metric === 'revenue'
                        ? `₹${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.47).toLocaleString()}`
                        : `${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.47)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-purple-700">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      Concerts (33%)
                    </span>
                    <span className="font-semibold">
                      {metric === 'revenue'
                        ? `₹${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.33).toLocaleString()}`
                        : `${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.33)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Trips (20%)
                    </span>
                    <span className="font-semibold">
                      {metric === 'revenue'
                        ? `₹${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.20).toLocaleString()}`
                        : `${Math.round(pointsCurrent[hoveredDataIndex].rawVal * 0.20)}`}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Prior Baseline</span>
                  <span>
                    {metric === 'revenue'
                      ? `₹${pointsPrev[hoveredDataIndex].val.toLocaleString()}`
                      : `${pointsPrev[hoveredDataIndex].val}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info pill */}
        {/* <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-slate-400" />
            <span>Updated with live settlements every 15 minutes</span>
          </div>
          <span className="font-medium text-indigo-600">99.98% Telemetry Sync</span>
        </div> */}
      </div>

      {/* 2. Donut / Pie Chart: Operational Domain Breakdown (Right Card) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Domain Distribution
                </h3>
                {/* <p className="text-xs text-slate-400">
                  {metric === 'revenue' ? 'Revenue split by vertical' : 'Bookings volume by vertical'}
                </p> */}
              </div>
            </div>
            {/* <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              Live Share
            </span> */}
          </div>

          {/* SVG Pie / Donut Container - Compactly scaled & balanced */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative h-[180px] w-[180px]">
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                className="overflow-visible"
              >
                {/* Segments rendered as clean SVG donut arc paths */}
                {segments.map(seg => {
                  const isHovered = hoveredSegment === seg.id || moduleFilter === seg.id;
                  const isOtherHovered = (hoveredSegment !== null || moduleFilter !== 'all') && !isHovered;
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
                      onClick={() => setModuleFilter(moduleFilter === seg.id ? 'all' : (seg.id as ModuleFilter))}
                      onMouseEnter={() => setHoveredSegment(seg.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut KPI - Sized properly with clear values on hover */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                {activeDonut ? (
                  <>
                    <span
                      className="text-[10px] font-semibold tracking-wide uppercase truncate max-w-[90px]"
                      style={{ color: activeDonut.color }}
                    >
                      {activeDonut.name}
                    </span>
                    <span className="text-base font-bold tracking-tight text-slate-900 my-0.5">
                      {metric === 'revenue'
                        ? `₹${(activeDonut.value / 1000).toFixed(1)}k`
                        : `${activeDonut.value.toLocaleString()}`}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-semibold"
                      style={{
                        backgroundColor: `${activeDonut.color}15`,
                        color: activeDonut.color
                      }}
                    >
                      {activeDonut.percentage}% share
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-400">
                      Total {metric === 'revenue' ? 'GMV' : 'Bookings'}
                    </span>
                    <span className="text-base font-bold tracking-tight text-slate-900 my-0.5">
                      {metric === 'revenue'
                        ? `₹${(totalMetricCurrent / 1000).toFixed(1)}k`
                        : `${totalMetricCurrent.toLocaleString()}`}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      3 Verticals
                    </span>
                  </>
                )}
              </div>

              {/* Floating Tooltip for Hovered Donut Slice */}
              {activeDonut && (
                <div
                  className="pointer-events-none absolute -top-3 z-30 transform -translate-x-1/2 rounded-lg border border-slate-200/90 bg-slate-900 text-white px-2.5 py-1 shadow-lg transition-all duration-200"
                  style={{
                    left: `${Math.min(
                      Math.max(
                        (polarToCartesian(donutCenter, donutCenter, donutOuterRadius + 10, (activeDonut.startAngle + activeDonut.endAngle) / 2).x / 180) * 100,
                        20
                      ),
                      80
                    )}%`
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] whitespace-nowrap">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: activeDonut.color }}
                    />
                    <span className="font-semibold">{activeDonut.name}:</span>
                    <span className="font-bold text-white">
                      {metric === 'revenue'
                        ? `₹${(activeDonut.value / 1000).toFixed(1)}k`
                        : `${activeDonut.value.toLocaleString()}`}
                    </span>
                    <span className="text-slate-300">({activeDonut.percentage}%)</span>
                  </div>
                  {/* Tooltip downward indicator triangle */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              )}
            </div>
          </div>

          {/* Domain Indicators: Clean color-to-module legend as a grid */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
            {segments.map(seg => {
              const Icon = seg.icon;
              const isHovered = hoveredSegment === seg.id || moduleFilter === seg.id;
              return (
                <div
                  key={seg.id}
                  onClick={() => setModuleFilter(moduleFilter === seg.id ? 'all' : (seg.id as ModuleFilter))}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`flex flex-col bg-slate-100 text-slate-900 sm:flex-row items-center justify-center gap-1.5 rounded-lg p-1.5 text-center sm:text-left transition-all cursor-pointer ${isHovered
                    ? 'bg-slate-100 text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-white shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  {/* <div className={`flex h-5 w-5 items-center justify-center rounded border ${seg.accentBg} shrink-0`}>
                    <Icon className="h-3 w-3" />
                  </div> */}
                  <span className="text-[11px] font-semibold text-slate-800 truncate">
                    {seg.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info pill */}
        {/* <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>3 Verticals Synchronized</span>
          </div>
          <span className="text-emerald-700 font-medium">100% Balanced</span>
        </div> */}
      </div>
    </div>
  );
};
