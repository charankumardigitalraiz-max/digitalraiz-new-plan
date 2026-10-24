import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, FileText, Car, Star, Table as TableIcon, LayoutGrid, ShieldCheck, Eye } from 'lucide-react';
import type { Driver } from '../../types';
import { mockGlobalUsers } from '../../data/mockUsers';
import { Badge } from '../common/Badge';
import { Table, type Column } from '../common/Table';
import { Pagination } from '../common/Pagination';

interface DriverVerificationListProps {
  drivers: Driver[];
  onVerify: (driverId: string, status: 'verified' | 'rejected' | 'pending') => void;
  onViewDetails?: (driver: Driver) => void;
}

export const DriverVerificationList: React.FC<DriverVerificationListProps> = ({
  drivers,
  onVerify,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleViewDetails = (driver: Driver) => {
    if (onViewDetails) {
      onViewDetails(driver);
      return;
    }
    const matchingUser = mockGlobalUsers.find(
      u =>
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
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleViewDetails(driver)}
            className="flex items-center justify-center rounded-xl p-2 bg-indigo-50 border border-indigo-200/80 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer shadow-2xs"
            title="View Driver Details & KYC"
          >
            <Eye className="h-4 w-4" />
          </button>
          {/* {driver.verificationStatus === 'pending' ? (
            <>
              <button
                onClick={() => onVerify(driver.id, 'verified')}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-normal text-white transition-all cursor-pointer shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => onVerify(driver.id, 'rejected')}
                className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-normal text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                onVerify(
                  driver.id,
                  driver.verificationStatus === 'verified' ? 'pending' : 'verified'
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {driver.verificationStatus === 'verified' ? 'Re-audit KYC' : 'Re-verify'}
            </button>
          )} */}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Title and View Switcher */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-slate-900">
            Driver Verification Roster
          </h2>
          <p className="text-xs text-slate-500">
            Inspect legal driving licenses, identity documentation & registered vehicle profiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            Total Registered: <span className="text-slate-800 font-medium">{drivers.length}</span>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${viewMode === 'cards'
                  ? 'bg-white text-slate-800 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div> */}

      {/* Render Table or Cards based on viewMode */}
      {viewMode === 'table' ? (
        <Table
          data={drivers}
          columns={columns}
          keyExtractor={(driver) => driver.id}
          onRowClick={(driver) => handleViewDetails(driver)}
          emptyMessage="No drivers registered"
          emptySubtext="New driver applications will appear here for verification."
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
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300"
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
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                  <Car className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div className="text-xs">
                    <div className="text-slate-800 font-medium">{driver.vehicleModel}</div>
                    <div className="text-slate-500 text-[11px]">
                      Plate: <span className="font-mono text-slate-700">{driver.vehiclePlate}</span> ({driver.vehicleColor})
                    </div>
                  </div>
                </div>

                {/* KYC & License Info */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
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
                    onClick={() => handleViewDetails(driver)}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white hover:border-indigo-600 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>
                  {driver.verificationStatus === 'pending' ? (
                    <>
                      <button
                        onClick={() => onVerify(driver.id, 'verified')}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-normal text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => onVerify(driver.id, 'rejected')}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-normal text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        onVerify(
                          driver.id,
                          driver.verificationStatus === 'verified' ? 'pending' : 'verified'
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-normal text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      {driver.verificationStatus === 'verified' ? 'Re-audit KYC' : 'Re-verify'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {drivers.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
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
    </div>
  );
};
