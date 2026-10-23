import { useState, useMemo } from 'react';
import {
  BarChart3,
  Car,
  Music,
  MapPin,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import type { CarpoolRide, ConcertEvent, TripPlan, Driver } from '../../types';

interface ModuleAnalyticsChartsProps {
  rides: CarpoolRide[];
  concerts: ConcertEvent[];
  trips: TripPlan[];
  drivers: Driver[];
}

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

export const ModuleAnalyticsCharts = ({
  rides: _rides,
  concerts: _concerts,
  trips: _trips,
  drivers: _drivers
}: ModuleAnalyticsChartsProps) => {
  const [hoveredConcert, setHoveredConcert] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Concept-aligned Mobility Corridors (Indian intercity expressway & highway carpools)
  const corridorData = [
    {
      id: 'corridor-1',
      route: 'Mumbai ↔ Pune Expressway',
      distance: '148 km',
      ridesCount: 680,
      occupancy: 96,
      revenue: 64200,
      avgFare: 350,
      trend: '+18%'
    },
    {
      id: 'corridor-2',
      route: 'Bengaluru ↔ Mysuru Highway',
      distance: '143 km',
      ridesCount: 520,
      occupancy: 92,
      revenue: 54800,
      avgFare: 420,
      trend: '+22%'
    },
    {
      id: 'corridor-3',
      route: 'Delhi ↔ Agra Expressway',
      distance: '233 km',
      ridesCount: 450,
      occupancy: 88,
      revenue: 48600,
      avgFare: 480,
      trend: '+14%'
    },
    {
      id: 'corridor-4',
      route: 'Hyderabad ↔ Vijayawada Corridor',
      distance: '275 km',
      ridesCount: 380,
      occupancy: 82,
      revenue: 41200,
      avgFare: 520,
      trend: '+15%'
    }
  ];

  // Concept-aligned Stadium Concert Tours (Column Bar Chart Data)
  const concertBarStats = [
    {
      id: 'bar-01',
      artist: 'Coldplay',
      tour: 'Music of the Spheres',
      venue: 'Narendra Modi Stadium',
      city: 'Ahmedabad',
      capacity: 74000,
      sold: 71800,
      percentage: 97,
      connectedCarpools: 88,
      revenue: '₹61.0L',
      barGradient: 'from-purple-600 via-purple-500 to-indigo-500',
      activeGradient: 'from-purple-700 via-purple-600 to-indigo-600',
      textAccent: 'text-purple-600'
    },
    {
      id: 'bar-02',
      artist: 'Diljit Dosanjh',
      tour: 'Dil-Luminati Global Tour',
      venue: 'Jawaharlal Nehru Stadium',
      city: 'Delhi',
      capacity: 45000,
      sold: 43200,
      percentage: 96,
      connectedCarpools: 64,
      revenue: '₹43.2L',
      barGradient: 'from-sky-600 via-sky-500 to-blue-500',
      activeGradient: 'from-sky-700 via-sky-600 to-blue-600',
      textAccent: 'text-sky-600'
    },
    {
      id: 'bar-03',
      artist: 'A.R. Rahman',
      tour: 'Symphony of Lights Live',
      venue: 'Jio World Garden',
      city: 'Mumbai',
      capacity: 22000,
      sold: 21500,
      percentage: 98,
      connectedCarpools: 42,
      revenue: '₹32.5L',
      barGradient: 'from-emerald-600 via-emerald-500 to-teal-500',
      activeGradient: 'from-emerald-700 via-emerald-600 to-teal-600',
      textAccent: 'text-emerald-600'
    },
    {
      id: 'bar-04',
      artist: 'Anyma & Tale of Us',
      tour: 'Neon Odyssey Live',
      venue: 'D.Y. Patil Stadium',
      city: 'Navi Mumbai',
      capacity: 38000,
      sold: 34600,
      percentage: 91,
      connectedCarpools: 52,
      revenue: '₹38.0L',
      barGradient: 'from-amber-500 via-amber-400 to-orange-500',
      activeGradient: 'from-amber-600 via-amber-500 to-orange-600',
      textAccent: 'text-amber-600'
    }
  ];

  const yAxisTicks = [100, 75, 50, 25, 0];

  const totalRevenue = corridorData.reduce((acc, c) => acc + c.revenue, 0);

  const routeSegments = useMemo(() => {
    const colors = [
      { color: '#10B981', hoverColor: '#059669' }, // Emerald
      { color: '#0EA5E9', hoverColor: '#0284C7' }, // Sky
      { color: '#6366F1', hoverColor: '#4F46E5' }, // Indigo
      { color: '#F59E0B', hoverColor: '#D97706' }  // Amber
    ];

    let currentAngle = 0;
    return corridorData.map((item, idx) => {
      const percentage = Math.round((item.revenue / totalRevenue) * 100);
      const angle = (item.revenue / totalRevenue) * 360;
      const seg = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        ...colors[idx % colors.length]
      };
      currentAngle += angle;
      return seg;
    });
  }, [totalRevenue]);

  const activeSegment = hoveredSegment ? routeSegments.find(s => s.id === hoveredSegment) : null;
  const donutCenter = 85;
  const donutOuterRadius = 70;
  const donutInnerRadius = 48;

  return (
    <div className="space-y-4">
      {/* 2-Column Balanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

        {/* 1. Donut Pie Chart: Intercity Corridor Route Share */}
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
                    Top Route Revenue Share
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revenue and passenger volume by intercity corridor
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                4 Corridors
              </span>
            </div>

            {/* Horizontal Flex Layout: Donut on Left + Breakdown Rows on Right */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
              {/* SVG Donut */}
              <div className="relative h-[155px] w-[155px] shrink-0 flex items-center justify-center">
                <svg
                  width="155"
                  height="155"
                  viewBox="0 0 170 170"
                  className="overflow-visible"
                >
                  {routeSegments.map(seg => {
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

                {/* Center KPI in Donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[85px]">
                    {activeSegment ? activeSegment.route.split(' ')[0] : 'Total GMV'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 leading-tight">
                    {activeSegment
                      ? `${activeSegment.percentage}%`
                      : `₹${(totalRevenue / 1000).toFixed(1)}k`}
                  </span>
                  <span className="text-[9px] font-medium text-emerald-600">
                    {activeSegment
                      ? `₹${(activeSegment.revenue / 1000).toFixed(1)}k`
                      : 'Active Corridors'}
                  </span>
                </div>
              </div>

              {/* Corridor Breakdown Rows on Right */}
              <div className="flex-1 w-full space-y-1.5">
                {routeSegments.map(seg => {
                  const isHovered = hoveredSegment === seg.id;
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setHoveredSegment(seg.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isHovered
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
                            {seg.route}
                          </div>
                          <div className="text-[9.5px] text-slate-400 truncate">
                            {seg.distance} • {seg.ridesCount} rides
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div className="text-[11px] font-bold text-slate-900">
                          {seg.percentage}%
                        </div>
                        <div className="text-[9.5px] font-medium text-emerald-600">
                          ₹{(seg.revenue / 1000).toFixed(1)}k
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          {/* <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Highest Share: Mumbai ↔ Pune (31%)</span>
            <span className="text-emerald-700 font-medium">92% Avg Occupancy</span>
          </div> */}
        </div>

        {/* 2. Vertical Column Bar Chart: Concert Arena Sell-Out Rate & Fleet Coordination */}
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between h-full min-h-[350px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Concert Arena Sell-Out Rate
                  </h3>
                  <p className="text-xs text-slate-400">
                    Stadium ticket velocity & connected carpools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                <Sparkles className="h-3 w-3" />
                <span>95.5% Avg Sold</span>
              </div>
            </div>

            {/* Professional Vertical Column Chart with Gridlines & Axis */}
            <div className="relative pt-3 pb-1">
              {/* Background Gridlines & Y-Axis */}
              <div className="relative h-[165px] flex">
                {/* Y-Axis Percentage Labels */}
                <div className="flex flex-col justify-between h-full pr-2 text-right select-none">
                  {yAxisTicks.map(tick => (
                    <span key={tick} className="text-[10px] font-medium text-slate-400 leading-none">
                      {tick}%
                    </span>
                  ))}
                </div>

                {/* Plot Area with Grid Lines */}
                <div className="relative flex-1 h-full border-b border-slate-200">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {yAxisTicks.map(tick => (
                      <div
                        key={tick}
                        className="w-full border-b border-dashed border-slate-100"
                      />
                    ))}
                  </div>

                  {/* Vertical Columns */}
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {concertBarStats.map(c => {
                      const isHovered = hoveredConcert === c.id;

                      return (
                        <div
                          key={c.id}
                          onMouseEnter={() => setHoveredConcert(c.id)}
                          onMouseLeave={() => setHoveredConcert(null)}
                          className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                          style={{ width: '22%' }}
                        >
                          {/* Rich Interactive Tooltip on Hover */}
                          {isHovered && (
                            <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-white shadow-xl transition-all">
                              <div className="text-[11px] font-semibold text-white">
                                {c.artist} • {c.city}
                              </div>
                              <div className="text-[10px] text-slate-300">
                                {c.sold.toLocaleString()} / {c.capacity.toLocaleString()} seats ({c.percentage}%)
                              </div>
                              <div className="text-[9px] text-emerald-400 font-medium">
                                Revenue: {c.revenue} • {c.connectedCarpools} Carpools
                              </div>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          )}

                          {/* Percentage Badge atop column */}
                          <span
                            className={`text-[10px] font-bold mb-1 transition-all ${isHovered ? 'scale-110 font-extrabold' : ''
                              } ${c.textAccent}`}
                          >
                            {c.percentage}%
                          </span>

                          {/* Column Bar with Background Track & Smooth Gradient Fill */}
                          <div className="w-full max-w-[42px] h-[130px] flex flex-col justify-end rounded-t-lg bg-slate-100/90 overflow-hidden relative shadow-inner">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t ${isHovered ? c.activeGradient : c.barGradient
                                } shadow-sm`}
                              style={{ height: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Labels & Details beneath baseline */}
              <div className="flex justify-around pl-8 pt-2">
                {concertBarStats.map(c => {
                  const isHovered = hoveredConcert === c.id;
                  return (
                    <div
                      key={c.id}
                      onMouseEnter={() => setHoveredConcert(c.id)}
                      onMouseLeave={() => setHoveredConcert(null)}
                      className="text-center cursor-pointer transition-transform"
                      style={{ width: '22%' }}
                    >
                      {/* Artist Name */}
                      <div
                        className={`text-[11px] font-semibold truncate transition-colors ${isHovered ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        title={c.artist}
                      >
                        {c.artist}
                      </div>

                      {/* Stadium City */}
                      <div className="text-[10px] text-slate-400 truncate">
                        {c.city}
                      </div>

                      {/* Connected Carpool Fleet Badge */}
                      <div className="mt-1 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 transition-colors">
                        <Car className="h-2.5 w-2.5 text-emerald-600" />
                        <span>{c.connectedCarpools}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
