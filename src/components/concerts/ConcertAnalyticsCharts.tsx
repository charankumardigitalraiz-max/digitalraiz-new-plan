import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import type { ConcertEvent } from '../../types';

export type Timeframe = '7D' | '30D' | '90D' | '12M';
type ChartMetric = 'revenue' | 'tickets';

interface ConcertAnalyticsChartsProps {
  concerts: ConcertEvent[];
  timeframe: Timeframe;
  totalTicketsSold: number;
  avgTicketPrice: number;
  occupancyRate: number;
  formatCurrency: (amount: number) => string;
}

// Trigonometry SVG helper for Donut slices
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
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
    'Z'
  ].join(' ');
}

export const ConcertAnalyticsCharts: React.FC<ConcertAnalyticsChartsProps> = ({
  concerts,
  timeframe,
  totalTicketsSold,
  avgTicketPrice,
  occupancyRate,
  formatCurrency
}) => {
  const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [donutMousePos, setDonutMousePos] = useState<{ x: number; y: number } | null>(null);

  // Genre breakdown data
  const genreData = useMemo(() => {
    const map = new Map<string, { count: number; sold: number; revenue: number }>();
    concerts.forEach(c => {
      const g = c.genre || 'Other';
      const existing = map.get(g) || { count: 0, sold: 0, revenue: 0 };
      const avgPrice = (c.minPrice + c.maxPrice) / 2;
      map.set(g, {
        count: existing.count + 1,
        sold: existing.sold + c.ticketsSold,
        revenue: existing.revenue + (c.ticketsSold * avgPrice)
      });
    });

    const colors: Record<string, string> = {
      EDM: '#9333EA',       // Purple (Concerts Primary)
      Rock: '#EC4899',      // Pink
      Pop: '#8B5CF6',       // Violet
      Indie: '#10B981',     // Emerald
      'Hip-Hop': '#F59E0B', // Amber
      Classical: '#06B6D4', // Cyan
      Jazz: '#3B82F6'       // Blue
    };

    const totalSoldAll = Array.from(map.values()).reduce((sum, item) => sum + item.sold, 0) || 1;

    let cumulativeAngle = 0;
    return Array.from(map.entries()).map(([genre, stats]) => {
      const percentage = Math.round((stats.sold / totalSoldAll) * 100);
      const angleSpan = (stats.sold / totalSoldAll) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angleSpan;
      cumulativeAngle = endAngle;

      return {
        genre,
        ...stats,
        percentage,
        startAngle,
        endAngle,
        color: colors[genre] || '#94A3B8'
      };
    });
  }, [concerts]);

  // Time Series Trend Data
  const trendData = useMemo(() => {
    switch (timeframe) {
      case '7D':
        return [
          { label: 'Mon', revenue: 4200000, tickets: 3200, highlight: 'General Admission sales' },
          { label: 'Tue', revenue: 5800000, tickets: 4400, highlight: 'VIP presale kickoff' },
          { label: 'Wed', revenue: 11500000, tickets: 8900, highlight: 'Coldplay Earlybird launch' },
          { label: 'Thu', revenue: 9200000, tickets: 7100, highlight: 'Grandstand tier opening' },
          { label: 'Fri', revenue: 14800000, tickets: 11400, highlight: 'Weekend ticketing surge' },
          { label: 'Sat', revenue: 21500000, tickets: 16800, highlight: 'Diljit Dosanjh stadium drop' },
          { label: 'Sun', revenue: 18900000, tickets: 14200, highlight: 'Festival passes volume' }
        ];
      case '30D':
        return [
          { label: 'Week 1', revenue: 38000000, tickets: 28000, highlight: 'Tour dates announcement' },
          { label: 'Week 2', revenue: 64000000, tickets: 49000, highlight: 'Stadium phase-1 sellout' },
          { label: 'Week 3', revenue: 52000000, tickets: 39500, highlight: 'Tier 2 tickets release' },
          { label: 'Week 4', revenue: 89000000, tickets: 68000, highlight: 'Multi-city stadium peak' }
        ];
      case '90D':
        return [
          { label: 'Month 1', revenue: 140000000, tickets: 110000, highlight: 'Q1 Arena tour kickoff' },
          { label: 'Month 2', revenue: 195000000, tickets: 154000, highlight: 'International headliners' },
          { label: 'Month 3', revenue: 235000000, tickets: 182000, highlight: 'Winter festival peak' }
        ];
      case '12M':
        return [
          { label: 'Jan', revenue: 85000000, tickets: 65000, highlight: '' },
          { label: 'Mar', revenue: 120000000, tickets: 92000, highlight: 'Spring tour releases' },
          { label: 'May', revenue: 95000000, tickets: 71000, highlight: '' },
          { label: 'Jul', revenue: 140000000, tickets: 108000, highlight: 'Acoustic stops' },
          { label: 'Sep', revenue: 180000000, tickets: 139000, highlight: 'Electronic festival season' },
          { label: 'Nov', revenue: 245000000, tickets: 188000, highlight: 'Mega stadium season' }
        ];
    }
  }, [timeframe]);

  // SVG Chart Dimensions & Path Generation
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const maxVal = useMemo(() => {
    const values = trendData.map(d => chartMetric === 'revenue' ? d.revenue : d.tickets);
    return Math.max(...values) * 1.15 || 100;
  }, [trendData, chartMetric]);

  const points = useMemo(() => {
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;
    return trendData.map((d, i) => {
      const x = paddingX + (i / (trendData.length - 1)) * usableW;
      const val = chartMetric === 'revenue' ? d.revenue : d.tickets;
      const y = svgHeight - paddingY - (val / maxVal) * usableH;
      return { x, y, val, ...d };
    });
  }, [trendData, chartMetric, maxVal]);

  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[i - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const svgArea = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${svgPath} L ${last.x} ${svgHeight - paddingY} L ${first.x} ${svgHeight - paddingY} Z`;
  }, [svgPath, points]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Ticketing Velocity Interactive Curve */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                {chartMetric === 'revenue' ? 'Box Office Revenue Trend' : 'Ticket Sales Velocity'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {chartMetric === 'revenue'
                ? 'Gross ticketing inflow over selected timeframe'
                : 'Spectator passes cleared through official box office gateways'}
            </p>
          </div>

          {/* Toggle metric */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('revenue')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${chartMetric === 'revenue'
                  ? 'bg-white text-purple-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Revenue (₹)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('tickets')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${chartMetric === 'tickets'
                  ? 'bg-white text-purple-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Passes Issued
            </button>
          </div>
        </div>

        {/* SVG Area & Curve */}
        <div className="relative w-full h-[220px] select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="concertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#9333EA" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingY + (svgHeight - paddingY * 2) * (1 - pct);
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area */}
            <path d={svgArea} fill="url(#concertGradient)" />

            {/* Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="#9333EA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? 6 : 4}
                  className="transition-all cursor-pointer"
                  fill="#FFFFFF"
                  stroke="#9333EA"
                  strokeWidth={hoveredPoint === idx ? 3 : 2}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-400 font-medium"
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div
              className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700"
              style={{
                left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / svgHeight) * 100 - 10}%`
              }}
            >
              <div className="font-semibold text-slate-200">{points[hoveredPoint].label}</div>
              <div className="text-sm font-semibold text-purple-300 mt-0.5">
                {chartMetric === 'revenue'
                  ? formatCurrency(points[hoveredPoint].val)
                  : `${points[hoveredPoint].val.toLocaleString()} passes`}
              </div>
              {points[hoveredPoint].highlight && (
                <div className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-800 pt-1">
                  {points[hoveredPoint].highlight}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Footer Stats under chart */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Avg. Realized Pass Price</span>
            <span className="font-semibold text-slate-800">₹{avgTicketPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Peak Single-Day GMV</span>
            <span className="font-semibold text-purple-600">₹2.15 Cr</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Overall Arena Occupancy</span>
            <span className="font-semibold text-emerald-600">{occupancyRate}% Capacity</span>
          </div>
        </div>
      </div>

      {/* Right: Genre Breakdown Donut Chart */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-semibold text-slate-900">Genre Distribution</h2>
            </div>
            <span className="text-xs text-slate-400">{genreData.length} active genres</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Ticket demand breakdown across musical formats
          </p>

          {/* Donut SVG */}
          <div className="relative flex items-center justify-center my-2">
            <div className="relative w-[170px] h-[170px]">
              <svg
                width="170"
                height="170"
                viewBox="0 0 170 170"
                className="overflow-visible w-full h-full select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDonutMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  });
                }}
                onMouseLeave={() => {
                  setHoveredGenre(null);
                  setDonutMousePos(null);
                }}
              >
                {genreData.map((slice) => {
                  const d = describeDonutSegment(85, 85, 48, 76, slice.startAngle, slice.endAngle);
                  if (!d) return null;
                  const isHovered = hoveredGenre === slice.genre;

                  // Compute outward translation vector along slice's radial bisector
                  const midAngle = (slice.startAngle + slice.endAngle) / 2;
                  const rad = ((midAngle - 90) * Math.PI) / 180.0;
                  const offset = isHovered ? 7 : 0;
                  const moveX = Math.cos(rad) * offset;
                  const moveY = Math.sin(rad) * offset;

                  return (
                    <path
                      key={slice.genre}
                      d={d}
                      fill={slice.color}
                      className="cursor-pointer"
                      style={{
                        transform: `translate(${moveX}px, ${moveY}px)`,
                        transformOrigin: '85px 85px',
                        filter: isHovered
                          ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.22))'
                          : 'none',
                        opacity: hoveredGenre ? (isHovered ? 1 : 0.6) : 1,
                        transition:
                          'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, filter 0.2s ease'
                      }}
                      onMouseEnter={() => setHoveredGenre(slice.genre)}
                      onMouseLeave={() => setHoveredGenre(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  {hoveredGenre ? hoveredGenre : 'Total Sold'}
                </span>
                <span className="text-base font-semibold text-slate-900">
                  {hoveredGenre
                    ? `${genreData.find((g) => g.genre === hoveredGenre)?.percentage}%`
                    : `${totalTicketsSold > 1000 ? `${(totalTicketsSold / 1000).toFixed(0)}k` : totalTicketsSold}`}
                </span>
              </div>

              {/* Hover Details Tooltip Card */}
              {hoveredGenre && (() => {
                const active = genreData.find((g) => g.genre === hoveredGenre);
                if (!active) return null;

                const midAngle = (active.startAngle + active.endAngle) / 2;
                const rad = ((midAngle - 90) * Math.PI) / 180.0;
                const fallbackAnchorX = 85 + 78 * Math.cos(rad);
                const fallbackAnchorY = 85 + 78 * Math.sin(rad);

                const posX = donutMousePos ? donutMousePos.x : fallbackAnchorX;
                const posY = donutMousePos ? donutMousePos.y - 12 : fallbackAnchorY - 10;

                return (
                  <div
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700 whitespace-nowrap"
                    style={{
                      left: `${posX}px`,
                      top: `${posY}px`
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: active.color }}
                        />
                        <span>{active.genre}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                        {active.percentage}% share
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span className="text-slate-400">Tickets Sold:</span>
                        <span className="font-semibold text-white">
                          {active.sold.toLocaleString()} passes
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span className="text-slate-400">Est. Revenue:</span>
                        <span className="font-semibold text-purple-300">
                          {formatCurrency(active.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span className="text-slate-400">Concerts:</span>
                        <span className="font-medium text-slate-300">
                          {active.count} events
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Genre Legends List */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          {genreData.map((item) => (
            <div
              key={item.genre}
              onMouseEnter={() => {
                setHoveredGenre(item.genre);
                setDonutMousePos(null);
              }}
              onMouseLeave={() => setHoveredGenre(null)}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${hoveredGenre === item.genre ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700">{item.genre}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{item.sold.toLocaleString()} tix</span>
                <span className="font-semibold text-slate-900 w-8 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
