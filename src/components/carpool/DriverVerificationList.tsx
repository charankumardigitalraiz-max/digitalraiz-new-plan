import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  FileText,
  Car,
  Star,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  AlertCircle,
  RefreshCw,
  Edit3,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import type { Driver, DriverDetailApiResponse } from '../../types';
import { mockGlobalUsers } from '../../data/mockUsers';
import { Badge } from '../common/Badge';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';
import { driverService } from '../../services';

export interface DriverVerificationListProps {
  drivers: Driver[];
  totalDrivers?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  onVerify: (driverId: string, status: 'verified' | 'rejected' | 'pending') => void | Promise<void>;
  onViewDetails?: (driver: Driver) => void;
}

export const DriverVerificationList: React.FC<DriverVerificationListProps> = ({
  drivers,
  totalDrivers,
  currentPage: propCurrentPage,
  pageSize: propPageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  viewMode: propViewMode,
  onViewModeChange,
  onVerify,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const [internalViewMode, setInternalViewMode] = useState<'table' | 'cards'>('table');
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);

  const viewMode = propViewMode ?? internalViewMode;
  const currentPage = propCurrentPage ?? internalCurrentPage;
  const setCurrentPage = onPageChange ?? setInternalCurrentPage;
  const pageSize = propPageSize ?? internalPageSize;
  const setPageSize = onPageSizeChange ?? setInternalPageSize;

  const totalCount = totalDrivers !== undefined ? totalDrivers : drivers.length;

  // Modal inspection state
  const [inspectingDriver, setInspectingDriver] = useState<Driver | null>(null);
  const [detailedDriver, setDetailedDriver] = useState<DriverDetailApiResponse['data']['driver'] | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Edit KYC Credentials State
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [editGovtIdNumber, setEditGovtIdNumber] = useState('');
  const [editGovtIdProof, setEditGovtIdProof] = useState('');
  const [editIsKyc, setEditIsKyc] = useState(false);
  const [editIsEmailVerified, setEditIsEmailVerified] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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

  const handleOpenInspection = (driver: Driver) => {
    if (onViewDetails) {
      onViewDetails(driver);
      return;
    }
    setInspectingDriver(driver);
  };

  const handleDirectVerify = async (
    driverId: string,
    status: 'verified' | 'rejected' | 'pending'
  ) => {
    setActionProcessing(true);
    try {
      await onVerify(driverId, status);
      if (inspectingDriver && inspectingDriver.id === driverId) {
        setInspectingDriver((prev) => (prev ? { ...prev, verificationStatus: status } : null));
        if (detailedDriver) {
          setDetailedDriver({
            ...detailedDriver,
            isKYC: status === 'verified',
            verificationStatus: status
          });
        }
      }
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

      // Update local state
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
    } catch {
      setSaveSuccessMsg('Failed to update documents. Please try again.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleNavigateToUser = (driver: Driver) => {
    const matchingUser = mockGlobalUsers.find(
      (u) =>
        u.id === driver.id ||
        u.email.toLowerCase() === driver.email.toLowerCase() ||
        u.name.toLowerCase() === driver.name.toLowerCase()
    );
    const targetId = matchingUser ? matchingUser.id : driver.id;
    navigate(`/users/${targetId}?tab=kyc`);
  };

  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenInspection(driver)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-indigo-50 border border-indigo-200/80 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer text-xs font-medium"
            title="Inspect Driver Documents & Verification"
          >
            <Eye className="h-3.5 w-3.5" />
            {/* <span>Inspect</span> */}
          </button>

          {/* {driver.verificationStatus === 'pending' ? (
            <>
              <button
                type="button"
                onClick={() => handleDirectVerify(driver.id, 'verified')}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-all cursor-pointer shadow-2xs"
                title="Approve Driver Verification"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectVerify(driver.id, 'rejected')}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
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
                handleDirectVerify(
                  driver.id,
                  driver.verificationStatus === 'verified' ? 'pending' : 'verified'
                )
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
              title={driver.verificationStatus === 'verified' ? 'Reset to Pending Review' : 'Re-verify Driver'}
            >
              {driver.verificationStatus === 'verified' ? 'Re-audit' : 'Re-verify'}
            </button>
          )} */}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-2">
      {/* Header View Switcher */}
      {/* <div className="flex items-center justify-between pb-1">
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{drivers.length}</span> registered driver{drivers.length === 1 ? '' : 's'}
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${viewMode === 'table'
              ? 'bg-white text-slate-800 shadow-2xs font-medium'
              : 'text-slate-500 hover:text-slate-800'
              }`}
            title="Table View"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${viewMode === 'cards'
              ? 'bg-white text-slate-800 shadow-2xs font-medium'
              : 'text-slate-500 hover:text-slate-800'
              }`}
            title="Cards View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div> */}

      {/* Render Table or Cards based on viewMode */}
      {viewMode === 'table' ? (
        <Table
          data={drivers}
          columns={columns}
          keyExtractor={(driver) => driver.id}
          emptyMessage="No drivers found"
          emptySubtext="New driver applications will appear here for verification and auditing."
          emptyIcon={ShieldCheck}
          pagination={{
            currentPage,
            pageSize,
            totalItems: drivers.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
            pageSizeOptions: [5, 10, 20],
            itemName: 'drivers'
          }}
        />
      ) : (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5">
            {paginatedDrivers.map((driver) => (
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
                    onClick={() => handleOpenInspection(driver)}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 text-xs font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect</span>
                  </button>

                  {driver.verificationStatus === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDirectVerify(driver.id, 'verified')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectVerify(driver.id, 'rejected')}
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
                        handleDirectVerify(
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

          {drivers.length > 0 && (
            <div className="rounded-xl border border-slate-200/90 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={drivers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20]}
                itemName="drivers"
              />
            </div>
          )}
        </div>
      )}

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
                  onClick={() => handleDirectVerify(inspectingDriver.id, 'rejected')}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3.5 py-2 text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  disabled={actionProcessing}
                  onClick={() =>
                    handleDirectVerify(
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
                  onClick={() => handleDirectVerify(inspectingDriver.id, 'verified')}
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
