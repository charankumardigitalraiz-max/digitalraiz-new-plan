import React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  accentColor?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  subtext,
  icon: Icon,
  accentColor = 'indigo'
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600',
        };
      case 'cyan':
        return {
          iconBg: 'bg-sky-50 text-sky-600',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
        };
      default:
        return {
          iconBg: 'bg-indigo-50 text-indigo-600',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>

        {change && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isPositive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
              }`}
          >
            {change.includes('%') && (isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
            <span>{change}</span>
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
