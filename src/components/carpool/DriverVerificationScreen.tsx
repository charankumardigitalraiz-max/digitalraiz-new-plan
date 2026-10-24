import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Users,
  Star,
  Search,
  X,
  Filter,
  ChevronDown,
  Loader2,
  Table as TableIcon,
  LayoutGrid,
  Check,
  FileText,
  Car,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  Edit3,
  Save,
  CheckCircle2
} from 'lucide-react';
import type { Driver, DriverCounts, DriverDetailApiResponse } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { Badge } from '../common/Badge';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';
import { driverService } from '../../services';
import { mockGlobalUsers } from '../../data/mockUsers';

export interface DriverVerificationScreenProps {
  drivers?: Driver[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onVerifyDriver?: (driverId: string, status: 'verified' | 'rejected' | 'pending') => void;
  onViewDriverDetails?: (driver: Driver) => void;
}

export const DriverVerificationScreen: React.FC<DriverVerificationScreenProps> = ({
  drivers: externalDrivers,
  searchQuery = '',
  onSearchChange,
  onVerifyDriver,
  onViewDriverDetails
}) => {
  const navigate = useNavigate();

  // Core Data & Loading State
  const [driverList, setDriverList] = useState<Driver[]>(externalDrivers || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pagination & Server Metadata State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalDrivers, setTotalDrivers] = useState<number>(0);
  const [counts, setCounts] = useState<DriverCounts>({ verified: 0, pending: 0, rejected: 0 });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search & Filter State
  const [internalSearch, setInternalSearch] = useState('');
  const searchTerm = onSearchChange ? searchQuery : (searchQuery || internalSearch);

  const handleSearch = (val: string) => {
    setInternalSearch(val);
    onSearchChange?.(val);
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  // Modal Inspection & KYC Edit State
  const [inspectingDriver, setInspectingDriver] = useState<Driver | null>(null);
  const [detailedDriver, setDetailedDriver] = useState<DriverDetailApiResponse['data']['driver'] | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [editGovtIdNumber, setEditGovtIdNumber] = useState('');
  const [editGovtIdProof, setEditGovtIdProof] = useState('');
  const [editIsKyc, setEditIsKyc] = useState(false);
  const [editIsEmailVerified, setEditIsEmailVerified] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Debounce search to prevent excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page to 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Dynamic fetch drivers callback
  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await driverService.getDrivers({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: debouncedSearch
      });
      setDriverList(res.drivers);
      setTotalDrivers(res.pagination.total);
      setCounts(res.counts);
    } catch (err) {
      console.warn('Driver fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Sync external drivers if explicitly provided
  useEffect(() => {
    if (externalDrivers && externalDrivers.length > 0) {
      setDriverList(externalDrivers);
      setTotalDrivers(externalDrivers.length);
    }
  }, [externalDrivers]);

  // Load detailed driver from API when modal opens
  useEffect(() => {
    if (!inspectingDriver) {
      setDetailedDriver(null);
      setIsEditingKyc(false);
      setSaveSuccessMsg(null);
      return;
    }

    let isMounted = true;
    setLoadingDetails(true);

    driverService
      .getDriverById(inspectingDriver.id)
      .then((data) => {
        if (!isMounted) return;
        const d = data.driver;
        setDetailedDriver(d);
        setEditGovtIdNumber(d.govtIdNumber || inspectingDriver.govtIdNumber || '');
        setEditGovtIdProof(d.govtIdProof || inspectingDriver.govtIdProof || '');
        setEditIsKyc(Boolean(d.isKYC ?? inspectingDriver.isKYC ?? inspectingDriver.verificationStatus === 'verified'));
        setEditIsEmailVerified(Boolean(d.isEmailVerified ?? inspectingDriver.isEmailVerified ?? inspectingDriver.verificationStatus === 'verified'));
      })
      .catch(() => {
        if (!isMounted) return;
        setDetailedDriver(null);
      })
      .finally(() => {
        if (isMounted) setLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [inspectingDriver]);

  // Handle direct verification API call
  const handleVerify = async (driverId: string, status: 'verified' | 'rejected' | 'pending') => {
    setActionProcessing(true);
    try {
      await driverService.verifyDriver(driverId, status);
      await fetchDrivers();

      if (inspectingDriver && inspectingDriver.id === driverId) {
        setInspectingDriver((prev) => (prev ? { ...prev, verificationStatus: status, KYCStatus: status } : null));
        if (detailedDriver) {
          setDetailedDriver({
            ...detailedDriver,
            isKYC: status === 'verified',
            verificationStatus: status
          });
        }
      }
      onVerifyDriver?.(driverId, status);
    } catch {
      setDriverList((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: status, isKYC: status === 'verified' } : d))
      );
    } finally {
      setActionProcessing(false);
    }
  };

  const handleSaveKycCredentials = async () => {
    if (!inspectingDriver) return;
    setActionProcessing(true);
    setSaveSuccessMsg(null);

    try {
      await driverService.updateDriverKycDocs(inspectingDriver.id, {
        govtIdNumber: editGovtIdNumber.trim(),
        govtIdProof: editGovtIdProof.trim(),
        isKYC: editIsKyc,
        isEmailVerified: editIsEmailVerified
      });

      if (detailedDriver) {
        setDetailedDriver({
          ...detailedDriver,
          govtIdNumber: editGovtIdNumber.trim(),
          govtIdProof: editGovtIdProof.trim(),
          isKYC: editIsKyc,
          isEmailVerified: editIsEmailVerified
        });
      }

      setSaveSuccessMsg('Verification documents updated successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      setIsEditingKyc(false);
      await fetchDrivers();
    } catch {
      setSaveSuccessMsg('Failed to update documents. Please try again.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleNavigateToUser = (driver: Driver) => {
    if (onViewDriverDetails) {
      onViewDriverDetails(driver);
      return;
    }
    const matchingUser = mockGlobalUsers.find(
      (u) =>
        u.id === driver.id ||
        u.email.toLowerCase() === driver.email.toLowerCase() ||
        u.name.toLowerCase() === driver.name.toLowerCase()
    );
    const targetId = matchingUser ? matchingUser.id : driver.id;
    navigate(`/users/${targetId}?tab=kyc`);
  };

  // Dynamic KPI computations sourced directly from backend server response
  const verifiedCount = counts.verified ?? 0;
  const pendingCount = counts.pending ?? 0;
  const rejectedCount = counts.rejected ?? 0;
  const totalCount = totalDrivers;
  const validRated = driverList.filter((d) => typeof d.rating === 'number' && d.rating > 0);
  const avgRating = validRated.length > 0
    ? (validRated.reduce((acc, d) => acc + d.rating, 0) / validRated.length).toFixed(1)
    : '5.0';

  // Table Columns Definition
  const columns: Column<Driver>[] = [
    {
      key: 'driver',
      header: 'Driver Identity',
      render: (driver) => (
        <div className="flex items-center gap-3">
          <img
            src={driver.avatar}
            alt={driver.name}
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">{driver.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                <Star className="h-3 w-3 fill-amber-400" />
                {driver.rating}
              </span>
              <span>•</span>
              <span>{driver.totalRides} trips</span>
              <span>•</span>
              <span>Joined {driver.joinedDate}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'vehicle',
      header: 'Vehicle Profile',
      render: (driver) => (
        <div className="flex items-center gap-2.5">
          <Car className="h-4 w-4 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-800 font-medium">{driver.vehicleModel}</div>
            <div className="text-slate-400 text-[11px]">
              Plate: <span className="font-mono text-slate-600">{driver.vehiclePlate}</span> ({driver.vehicleColor})
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'kyc',
      header: 'KYC & License Info',
      render: (driver) => (
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-800 font-medium">{driver.idDocument}</div>
            <div className="text-slate-400 text-[11px]">
              DL: <span className="font-mono font-medium text-slate-600">{driver.drivingLicenseNumber}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'License Approval Status',
      className: 'whitespace-nowrap',
      render: (driver) => <Badge status={driver.verificationStatus} />
    },
    {
      key: 'actions',
      header: 'Audit Action',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (driver) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setInspectingDriver(driver)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 bg-indigo-50 border border-indigo-200/80 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer text-xs font-medium"
            title="Inspect Driver Documents & Verification"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Inspect</span>
          </button>

          {driver.verificationStatus === 'pending' ? (
            <>
              <button
                type="button"
                onClick={() => handleVerify(driver.id, 'verified')}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-medium text-white transition-all cursor-pointer shadow-2xs"
                title="Approve Driver Verification"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleVerify(driver.id, 'rejected')}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                title="Reject Driver Verification"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                handleVerify(
                  driver.id,
                  driver.verificationStatus === 'verified' ? 'pending' : 'verified'
                )
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
              title={driver.verificationStatus === 'verified' ? 'Reset to Pending Review' : 'Re-verify Driver'}
            >
              {driver.verificationStatus === 'verified' ? 'Re-audit' : 'Re-verify'}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Driver KYC & License Auditing
            </h1>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            )}
          </div>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Review driver identities, national IDs, licenses and vehicle safety compliance.
          </p>
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
          value={totalCount}
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
        {/* Card Header: Search, Status Filter & View Controls */}
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

          {/* Status Filters Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'pending' | 'rejected')}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All Verification Statuses ({totalCount})</option>
                <option value="pending">Pending Review ({pendingCount})</option>
                <option value="verified">Verified ({verifiedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 h-10">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer h-8 ${viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer h-8 ${viewMode === 'cards'
                  ? 'bg-white text-slate-800 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Body: Direct Table or Cards View with 100% Dynamic Server Pagination */}
        <div className="p-4">
          {viewMode === 'table' ? (
            <Table
              data={driverList}
              columns={columns}
              keyExtractor={(driver) => driver.id}
              emptyMessage="No drivers found"
              emptySubtext="New driver applications will appear here for verification and auditing."
              emptyIcon={ShieldCheck}
              isLoading={isLoading}
              pagination={{
                currentPage,
                pageSize,
                totalItems: totalDrivers,
                onPageChange: setCurrentPage,
                onPageSizeChange: (newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                },
                pageSizeOptions: [5, 10, 20, 50],
                itemName: 'drivers',
                autoSlice: false
              }}
            />
          ) : (
            <div className="space-y-3.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 bg-white rounded-xl border border-slate-200/90">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-xs">Loading drivers...</span>
                </div>
              ) : driverList.length === 0 ? (
                <div className="rounded-xl border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
                  <ShieldCheck className="mx-auto h-9 w-9 text-slate-300 mb-2" />
                  <h4 className="text-xs font-semibold text-slate-700">No drivers found</h4>
                  <p className="mt-1 text-[11px] text-slate-400 max-w-sm mx-auto">
                    New driver applications will appear here for verification and auditing.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {driverList.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300"
                    >
                      {/* Driver Identity */}
                      <div className="flex items-center gap-3.5 min-w-[240px]">
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">{driver.name}</span>
                            <Badge status={driver.verificationStatus} />
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-amber-500 font-normal">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {driver.rating}
                            </span>
                            <span>•</span>
                            <span>{driver.totalRides} trips</span>
                            <span>•</span>
                            <span>Joined {driver.joinedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Profile */}
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
                        <Car className="h-5 w-5 text-indigo-600 shrink-0" />
                        <div className="text-xs">
                          <div className="text-slate-800 font-medium">{driver.vehicleModel}</div>
                          <div className="text-slate-500 text-[11px]">
                            Plate: <span className="font-mono text-slate-700">{driver.vehiclePlate}</span> ({driver.vehicleColor})
                          </div>
                        </div>
                      </div>

                      {/* KYC & License Info */}
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
                        <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div className="text-xs">
                          <div className="text-slate-800 font-medium">{driver.idDocument}</div>
                          <div className="text-slate-500 text-[11px]">
                            DL: <span className="font-mono font-medium text-slate-700">{driver.drivingLicenseNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Approvals Action */}
                      <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setInspectingDriver(driver)}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 text-xs font-medium transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>

                        {driver.verificationStatus === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerify(driver.id, 'verified')}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerify(driver.id, 'rejected')}
                              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleVerify(
                                driver.id,
                                driver.verificationStatus === 'verified' ? 'pending' : 'verified'
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            {driver.verificationStatus === 'verified' ? 'Re-audit' : 'Re-verify'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalDrivers > 0 && (
                <div className="rounded-xl border border-slate-200/90 overflow-hidden bg-white">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalDrivers}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                    itemName="drivers"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Driver KYC Inspection & Verification Modal */}
      {inspectingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingDriver.avatar}
                  alt={inspectingDriver.name}
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {inspectingDriver.name}
                    </h3>
                    <Badge status={inspectingDriver.verificationStatus} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {inspectingDriver.rating}
                    </span>
                    <span>•</span>
                    <span>{inspectingDriver.totalRides} completed trips</span>
                    <span>•</span>
                    <span>Joined {inspectingDriver.joinedDate}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingDriver(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <p className="text-xs">Loading driver credentials...</p>
                </div>
              ) : (
                <>
                  {/* Status Banner / Feedback */}
                  {saveSuccessMsg && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Verification Criteria Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Identity & KYC Verification</span>
                        {detailedDriver?.isKYC || inspectingDriver.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                            Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Driver national identity and uploaded documents verification.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Contact Email Verification</span>
                        {detailedDriver?.isEmailVerified || inspectingDriver.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Registered email address security status.
                      </p>
                    </div>
                  </div>

                  {/* Contact & Profile Info */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 p-3 text-xs">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="text-slate-400 text-[11px]">Phone Number</div>
                          <div className="font-medium text-slate-800">
                            {detailedDriver?.phone || inspectingDriver.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 p-3 text-xs">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="text-slate-400 text-[11px]">Email Address</div>
                          <div className="font-medium text-slate-800">
                            {detailedDriver?.email || inspectingDriver.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Government ID & Legal Documentation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Identity Documents & License
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingKyc(!isEditingKyc)}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{isEditingKyc ? 'Cancel Edit' : 'Edit Credentials'}</span>
                      </button>
                    </div>

                    {isEditingKyc ? (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Government ID Number
                            </label>
                            <input
                              type="text"
                              value={editGovtIdNumber}
                              onChange={(e) => setEditGovtIdNumber(e.target.value)}
                              placeholder="e.g. AADHAAR-8932-1245-7890"
                              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Document Proof Path / URL
                            </label>
                            <input
                              type="text"
                              value={editGovtIdProof}
                              onChange={(e) => setEditGovtIdProof(e.target.value)}
                              placeholder="e.g. /uploads/kyc/driver_aadhaar.pdf"
                              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={editIsKyc}
                              onChange={(e) => setEditIsKyc(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>National KYC Verified</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={editIsEmailVerified}
                              onChange={(e) => setEditIsEmailVerified(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Email Confirmed</span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingKyc(false)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={actionProcessing}
                            onClick={handleSaveKycCredentials}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-medium text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Credentials</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200/80 p-3.5 space-y-1">
                          <div className="text-slate-400 text-[11px]">Government ID Number</div>
                          <div className="font-mono text-xs font-semibold text-slate-800">
                            {detailedDriver?.govtIdNumber || inspectingDriver.govtIdNumber || 'Not provided'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {inspectingDriver.idDocument}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 p-3.5 space-y-1">
                          <div className="text-slate-400 text-[11px]">Driving License Number</div>
                          <div className="font-mono text-xs font-semibold text-slate-800">
                            {inspectingDriver.drivingLicenseNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">Official Driving Permit</div>
                        </div>
                      </div>
                    )}

                    {/* Attached Proof Document */}
                    {(detailedDriver?.govtIdProof || inspectingDriver.govtIdProof) && (
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div className="text-xs">
                            <div className="font-medium text-slate-800">Verification Document Proof</div>
                            <div className="text-slate-400 text-[11px] font-mono">
                              {detailedDriver?.govtIdProof || inspectingDriver.govtIdProof}
                            </div>
                          </div>
                        </div>
                        <a
                          href={detailedDriver?.govtIdProof || inspectingDriver.govtIdProof || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Document</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Registered Vehicle Profile */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Vehicle Profile
                    </h4>
                    <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/40">
                      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-semibold text-slate-800">
                          {detailedDriver?.vehicleModel || inspectingDriver.vehicleModel}
                        </div>
                        <div className="text-slate-500">
                          Plate Number:{' '}
                          <span className="font-mono font-medium text-slate-700">
                            {detailedDriver?.vehiclePlate || inspectingDriver.vehiclePlate}
                          </span>{' '}
                          • Color:{' '}
                          <span className="text-slate-700 font-medium">
                            {detailedDriver?.vehicleColor || inspectingDriver.vehicleColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => handleNavigateToUser(inspectingDriver)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full User Account</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={actionProcessing}
                  onClick={() => handleVerify(inspectingDriver.id, 'rejected')}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3.5 py-2 text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  disabled={actionProcessing}
                  onClick={() =>
                    handleVerify(
                      inspectingDriver.id,
                      inspectingDriver.verificationStatus === 'pending' ? 'verified' : 'pending'
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    {inspectingDriver.verificationStatus === 'verified'
                      ? 'Re-audit (Mark Pending)'
                      : 'Reset to Pending'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={actionProcessing}
                  onClick={() => handleVerify(inspectingDriver.id, 'verified')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Driver</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
