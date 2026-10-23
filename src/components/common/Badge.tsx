import React from 'react';
import type { StatusType } from '../../types';

interface BadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'upcoming':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getDotStyle = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
        return 'bg-emerald-500';
      case 'upcoming':
        return 'bg-sky-500';
      case 'pending':
        return 'bg-amber-500 animate-pulse';
      case 'completed':
        return 'bg-indigo-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-normal capitalize tracking-tight transition-colors ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        } ${getBadgeStyle()}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotStyle()}`} />
      {status}
    </span>
  );
};
