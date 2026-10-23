import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Users,
  Star,
  Search,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';
import type { Driver } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { DriverVerificationList } from './DriverVerificationList';

interface DriverVerificationScreenProps {
  drivers: Driver[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onVerifyDriver: (driverId: string, status: 'verified' | 'rejected' | 'pending') => void;
}

export const DriverVerificationScreen: React.FC<DriverVerificationScreenProps> = ({
  drivers,
  searchQuery = '',
  onSearchChange,
  onVerifyDriver
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const searchTerm = onSearchChange ? searchQuery : (searchQuery || internalSearch);

  const handleSearch = (val: string) => {
    setInternalSearch(val);
    onSearchChange?.(val);
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  // Metrics
  const verifiedCount = drivers.filter(d => d.verificationStatus === 'verified').length;
  const pendingCount = drivers.filter(d => d.verificationStatus === 'pending').length;
  const rejectedCount = drivers.filter(d => d.verificationStatus === 'rejected').length;
  const avgRating = drivers.length > 0
    ? (drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length).toFixed(1)
    : '5.0';

  // Filtered drivers
  const filteredDrivers = drivers.filter(driver => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      driver.name.toLowerCase().includes(q) ||
      driver.email.toLowerCase().includes(q) ||
      driver.phone.toLowerCase().includes(q) ||
      driver.vehicleModel.toLowerCase().includes(q) ||
      driver.vehiclePlate.toLowerCase().includes(q) ||
      driver.drivingLicenseNumber.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      return driver.verificationStatus === statusFilter;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner Card & Quick Controls */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Driver KYC & License Auditing
            </h1>
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Review driver identities, national IDs, licenses and vehicle safety compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs ${statusFilter === 'pending'
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{statusFilter === 'pending' ? 'Showing Pending Queue' : `Audit ${pendingCount} Pending Drivers`}</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Verified Drivers"
          value={verifiedCount}
          isPositive={true}
          icon={ShieldCheck}
          accentColor="emerald"
        />
        <MetricCard
          label="Pending Review"
          value={pendingCount}
          isPositive={false}
          icon={Clock}
          accentColor="amber"
        />
        <MetricCard
          label="Total Registered"
          value={drivers.length}
          isPositive={true}
          icon={Users}
          accentColor="indigo"
        />
        <MetricCard
          label="Fleet Avg Rating"
          value={`${avgRating} ★`}
          isPositive={true}
          icon={Star}
          accentColor="purple"
        />
      </div>

      {/* Unified Attached Card: Header, Controls & List */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header: Search & Filter Controls */}
        <div className="px-4 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          {/* Search Input Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search driver name, license, vehicle plate..."
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9.5 pr-9 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filters Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'pending' | 'rejected')}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All Verification Statuses</option>
                <option value="pending">Pending Review ({pendingCount})</option>
                <option value="verified">Verified ({verifiedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* <span className="text-xs text-slate-400 ml-1">
              Showing {filteredDrivers.length} of {drivers.length} drivers
            </span> */}
          </div>
        </div>

        {/* Card Body: Driver Verification List */}
        <div className="p-4">
          <DriverVerificationList
            drivers={filteredDrivers}
            onVerify={onVerifyDriver}
          />
        </div>
      </div>
    </div>
  );
};
