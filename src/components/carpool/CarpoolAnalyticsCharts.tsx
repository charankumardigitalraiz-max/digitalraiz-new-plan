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
import type { CarpoolRide, Driver } from '../../types';

interface CarpoolAnalyticsChartsProps {
  rides: CarpoolRide[];
  drivers: Driver[];
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
  rides: _rides,
  drivers: _drivers
}: CarpoolAnalyticsChartsProps) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [metric, setMetric] = useState<MetricType>('revenue');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [hoveredWeeklyDay, setHoveredWeeklyDay] = useState<string | null>(null);
  const [hoveredCorridorBar, setHoveredCorridorBar] = useState<string | null>(null);

  // Timeframe telemetry series data
  const seriesData = useMemo(() => {
    if (timeframe === '7D') {
      return [
        { label: 'Mon', fullDate: 'Mon, Oct 17', current: 14200, prev: 11500, volume: 168, prevVolume: 135 },
        { label: 'Tue', fullDate: 'Tue, Oct 18', current: 16800, prev: 13200, volume: 198, prevVolume: 156 },
        { label: 'Wed', fullDate: 'Wed, Oct 19', current: 15900, prev: 14100, volume: 187, prevVolume: 168 },
        { label: 'Thu', fullDate: 'Thu, Oct 20', current: 21800, prev: 16900, volume: 256, prevVolume: 198 },
        { label: 'Fri', fullDate: 'Fri, Oct 21', current: 28600, prev: 22400, volume: 342, prevVolume: 268 },
        { label: 'Sat', fullDate: 'Sat, Oct 22', current: 34500, prev: 26800, volume: 412, prevVolume: 320 },
        { label: 'Sun', fullDate: 'Sun, Oct 23 (Today)', current: 31200, prev: 24500, volume: 374, prevVolume: 295 }
      ];
    }
    if (timeframe === '90D') {
      return [
        { label: 'Aug W1', fullDate: 'Aug 1-7, 2026', current: 41000, prev: 33000, volume: 490, prevVolume: 395 },
        { label: 'Aug W3', fullDate: 'Aug 15-21, 2026', current: 52800, prev: 42500, volume: 630, prevVolume: 510 },
        { label: 'Sep W1', fullDate: 'Sep 1-7, 2026', current: 61500, prev: 49800, volume: 735, prevVolume: 595 },
        { label: 'Sep W3', fullDate: 'Sep 15-21, 2026', current: 77200, prev: 61000, volume: 920, prevVolume: 730 },
        { label: 'Oct W1', fullDate: 'Oct 1-7, 2026', current: 91000, prev: 72000, volume: 1085, prevVolume: 860 },
        { label: 'Oct W3', fullDate: 'Oct 15-21, 2026', current: 112000, prev: 87000, volume: 1335, prevVolume: 1040 },
        { label: 'Current', fullDate: 'Oct 22-23, 2026', current: 124800, prev: 98000, volume: 1488, prevVolume: 1170 }
      ];
    }
    if (timeframe === '12M') {
      return [
        { label: 'Nov', fullDate: 'Nov 2025', current: 98000, prev: 77000, volume: 1170, prevVolume: 920 },
        { label: 'Jan', fullDate: 'Jan 2026', current: 116000, prev: 91000, volume: 1380, prevVolume: 1090 },
        { label: 'Mar', fullDate: 'Mar 2026', current: 142000, prev: 109000, volume: 1700, prevVolume: 1310 },
        { label: 'May', fullDate: 'May 2026', current: 176000, prev: 135000, volume: 2100, prevVolume: 1615 },
        { label: 'Jul', fullDate: 'Jul 2026', current: 228000, prev: 174000, volume: 2715, prevVolume: 2075 },
        { label: 'Sep', fullDate: 'Sep 2026', current: 266000, prev: 203000, volume: 3170, prevVolume: 2420 },
        { label: 'Oct', fullDate: 'Oct 2026', current: 298000, prev: 227000, volume: 3550, prevVolume: 2710 }
      ];
    }
    // Default: '30D'
    return [
      { label: 'Oct 1', fullDate: 'Wednesday, Oct 1', current: 16800, prev: 13800, volume: 202, prevVolume: 164 },
      { label: 'Oct 5', fullDate: 'Sunday, Oct 5', current: 20400, prev: 16500, volume: 243, prevVolume: 196 },
      { label: 'Oct 9', fullDate: 'Thursday, Oct 9', current: 23900, prev: 19500, volume: 285, prevVolume: 232 },
      { label: 'Oct 13', fullDate: 'Monday, Oct 13', current: 22600, prev: 20500, volume: 268, prevVolume: 245 },
      { label: 'Oct 17', fullDate: 'Friday, Oct 17', current: 28300, prev: 23100, volume: 337, prevVolume: 275 },
      { label: 'Oct 20', fullDate: 'Monday, Oct 20', current: 34100, prev: 26500, volume: 405, prevVolume: 316 },
      { label: 'Oct 23', fullDate: 'Thursday, Oct 23', current: 38400, prev: 29300, volume: 457, prevVolume: 349 }
    ];
  }, [timeframe]);

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

  const maxValue = Math.max(...valuesCurrent, ...valuesPrev) * 1.15;
  const minValue = 0;

  const pointsCurrent = seriesData.map((d, i) => {
    const val = metric === 'revenue' ? d.current : d.volume;
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, data: d, val };
  });

  const pointsPrev = seriesData.map((d, i) => {
    const val = metric === 'revenue' ? d.prev : d.prevVolume;
    const x = paddingLeft + (i / (seriesData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
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
  const areaPathCurrent = `${linePathCurrent} L ${pointsCurrent[pointsCurrent.length - 1].x},${paddingTop + innerHeight} L ${pointsCurrent[0].x},${paddingTop + innerHeight} Z`;

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

  // Carpool Corridor Revenue Share slices
  const segments = useMemo(() => {
    const baseTotal = totalMetricCurrent;
    const s1 = Math.round(baseTotal * 0.38);
    const s2 = Math.round(baseTotal * 0.27);
    const s3 = Math.round(baseTotal * 0.19);
    const s4 = baseTotal - s1 - s2 - s3;

    const items = [
      {
        id: 'mumbai-pune',
        name: 'Mumbai ↔ Pune',
        subtext: 'Expressway',
        value: s1,
        color: '#10B981',
        hoverColor: '#059669',
        percentage: 38
      },
      {
        id: 'bengaluru-mysuru',
        name: 'Bengaluru ↔ Mysuru',
        subtext: 'Highway NH-275',
        value: s2,
        color: '#06B6D4',
        hoverColor: '#0891B2',
        percentage: 27
      },
      {
        id: 'delhi-agra',
        name: 'Delhi ↔ Agra',
        subtext: 'Taj Expressway',
        value: s3,
        color: '#6366F1',
        hoverColor: '#4F46E5',
        percentage: 19
      },
      {
        id: 'other-corridors',
        name: 'Hyderabad & Other',
        subtext: 'Regional Links',
        value: s4,
        color: '#F59E0B',
        hoverColor: '#D97706',
        percentage: 16
      }
    ];

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
  }, [totalMetricCurrent]);

  const activeDonutSegment = segments.find(s => s.id === hoveredSegment) || null;

  // Row 2 Left Chart: Weekly Seat Supply & Passenger Demand Data
  const weeklyDemandData = [
    {
      id: 'day-mon',
      day: 'Mon',
      fullDay: 'Monday',
      offered: 340,
      booked: 298,
      fillRate: 88,
      carpools: 85,
      isWeekend: false
    },
    {
      id: 'day-tue',
      day: 'Tue',
      fullDay: 'Tuesday',
      offered: 380,
      booked: 342,
      fillRate: 90,
      carpools: 95,
      isWeekend: false
    },
    {
      id: 'day-wed',
      day: 'Wed',
      fullDay: 'Wednesday',
      offered: 360,
      booked: 328,
      fillRate: 91,
      carpools: 90,
      isWeekend: false
    },
    {
      id: 'day-thu',
      day: 'Thu',
      fullDay: 'Thursday',
      offered: 450,
      booked: 418,
      fillRate: 93,
      carpools: 112,
      isWeekend: false
    },
    {
      id: 'day-fri',
      day: 'Fri',
      fullDay: 'Friday (Peak Outbound)',
      offered: 540,
      booked: 524,
      fillRate: 97,
      carpools: 135,
      isWeekend: false
    },
    {
      id: 'day-sat',
      day: 'Sat',
      fullDay: 'Saturday (Weekend Getaway)',
      offered: 510,
      booked: 488,
      fillRate: 96,
      carpools: 128,
      isWeekend: true
    },
    {
      id: 'day-sun',
      day: 'Sun',
      fullDay: 'Sunday (Return Commute)',
      offered: 480,
      booked: 461,
      fillRate: 96,
      carpools: 120,
      isWeekend: true
    }
  ];

  const maxWeeklySeats = 600;
  const weeklyYAxisTicks = [600, 450, 300, 150, 0];

  // Row 2 Right Chart: Peak Departure Hours & Commuter Flow Data
  const departureTimeBands = [
    {
      id: 'time-band-01',
      slot: '06 - 09h',
      timeLabel: '06:00 - 09:00',
      period: 'Morning Rush',
      capacity: 1480,
      booked: 1421,
      percentage: 96,
      carpools: 370,
      revenue: '₹49.7k',
      topCorridor: 'Mumbai ↔ Pune',
      barGradient: 'from-emerald-600 via-emerald-500 to-teal-500',
      activeGradient: 'from-emerald-700 via-emerald-600 to-teal-600',
      textAccent: 'text-emerald-600'
    },
    {
      id: 'time-band-02',
      slot: '09 - 13h',
      timeLabel: '09:00 - 13:00',
      period: 'Mid-Morning',
      capacity: 950,
      booked: 712,
      percentage: 75,
      carpools: 238,
      revenue: '₹26.3k',
      topCorridor: 'Bengaluru ↔ Mysuru',
      barGradient: 'from-cyan-600 via-cyan-500 to-blue-500',
      activeGradient: 'from-cyan-700 via-cyan-600 to-blue-600',
      textAccent: 'text-cyan-600'
    },
    {
      id: 'time-band-03',
      slot: '13 - 17h',
      timeLabel: '13:00 - 17:00',
      period: 'Afternoon',
      capacity: 820,
      booked: 557,
      percentage: 68,
      carpools: 205,
      revenue: '₹21.4k',
      topCorridor: 'Delhi ↔ Agra',
      barGradient: 'from-sky-500 via-sky-400 to-indigo-500',
      activeGradient: 'from-sky-600 via-sky-500 to-indigo-600',
      textAccent: 'text-sky-600'
    },
    {
      id: 'time-band-04',
      slot: '17 - 20h',
      timeLabel: '17:00 - 20:00',
      period: 'Evening Rush',
      capacity: 1650,
      booked: 1617,
      percentage: 98,
      carpools: 412,
      revenue: '₹58.2k',
      topCorridor: 'Mumbai ↔ Pune',
      barGradient: 'from-indigo-600 via-indigo-500 to-purple-500',
      activeGradient: 'from-indigo-700 via-indigo-600 to-purple-600',
      textAccent: 'text-indigo-600'
    },
    {
      id: 'time-band-05',
      slot: '20 - 24h',
      timeLabel: '20:00 - 24:00',
      period: 'Night Express',
      capacity: 920,
      booked: 754,
      percentage: 82,
      carpools: 230,
      revenue: '₹28.9k',
      topCorridor: 'Hyderabad ↔ Vijayawada',
      barGradient: 'from-amber-500 via-amber-400 to-orange-500',
      activeGradient: 'from-amber-600 via-amber-500 to-orange-600',
      textAccent: 'text-amber-600'
    }
  ];

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

              {/* Metric Toggle & Timeframe Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
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

            {/* Responsive SVG Area Chart */}
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
                  const sliceWidth = innerWidth / (pointsCurrent.length - 1);
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
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Mumbai ↔ Pune (38%)
                      </span>
                      <span className="font-semibold">
                        {metric === 'revenue'
                          ? `₹${Math.round(pointsCurrent[hoveredDataIndex].val * 0.38).toLocaleString()}`
                          : `${Math.round(pointsCurrent[hoveredDataIndex].val * 0.38)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-cyan-700">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        Bengaluru ↔ Mysuru (27%)
                      </span>
                      <span className="font-semibold">
                        {metric === 'revenue'
                          ? `₹${Math.round(pointsCurrent[hoveredDataIndex].val * 0.27).toLocaleString()}`
                          : `${Math.round(pointsCurrent[hoveredDataIndex].val * 0.27)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dynamic intercity carpool telemetry</span>
            <span className="font-medium text-emerald-600">Active Realtime</span>
          </div> */}
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

            {/* Horizontal Flex Layout: Donut on Left + 4 Corridor Breakdown on Right */}
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
                      : '4 Corridors'}
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
          </div>

          {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Intercity route revenue weighting</span>
            <span className="text-emerald-700 font-medium">100% Balanced</span>
          </div> */}
        </div>
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

            {/* Vertical Dual-Column Chart with Gridlines & Y-Axis */}
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
          </div>

          {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peak travel surge on Friday & Sunday returns</span>
            <span className="font-medium text-emerald-700">3,060 Weekly Seats</span>
          </div> */}
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
                    Hourly commuter surge & seat fill rate by departure band
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                <Sparkles className="h-3 w-3" />
                <span>94.2% Peak Fill</span>
              </div>
            </div>

            {/* Vertical Column Chart with Gridlines & Y-Axis */}
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
                                {t.timeLabel} • {t.period}
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
          </div>

          {/* <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Morning (08:30) & Evening (18:15) peak demand</span>
            <span className="text-emerald-700 font-medium">5 Active Time Bands</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};
