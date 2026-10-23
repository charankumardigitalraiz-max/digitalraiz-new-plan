import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Trash2,
  Star,
  MapPin,
  Car
} from 'lucide-react';
import type { CarpoolRide } from '../../types';
import { Badge } from '../common/Badge';
import { Table, type Column } from '../common/Table';

interface RideTableProps {
  rides: CarpoolRide[];
  onSelectRide?: (ride: CarpoolRide) => void;
  onDeleteRide: (rideId: string) => void;
  pageSize?: number;
  containerClassName?: string;
  isLoading?: boolean;
  serverPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

export const RideTable = ({
  rides,
  onSelectRide,
  onDeleteRide,
  pageSize: initialPageSize = 20,
  containerClassName = '',
  isLoading = false,
  serverPagination
}: RideTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleViewRide = (ride: CarpoolRide) => {
    if (onSelectRide) {
      onSelectRide(ride);
    }
    navigate(`/carpooling/rides/${ride.id}`);
  };

  const columns: Column<CarpoolRide>[] = [
    {
      key: 'route',
      header: 'Route & Stops',
      render: (ride) => (
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-medium text-xs">
            <span>{ride.originCity}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span>{ride.destinationCity}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>{ride.originPoint}</span>
          </div>
          {ride.waypoints.length > 0 && (
            <div className="mt-1 text-[11px] text-sky-600 font-normal">
              Via: {ride.waypoints.map((w) => w.city).join(', ')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'schedule',
      header: 'Schedule',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <div>
          <div className="text-slate-800 font-normal">{ride.departureDate}</div>
          <div className="text-[11px] text-slate-400">{ride.departureTime}</div>
        </div>
      )
    },
    {
      key: 'driver',
      header: 'Driver & Vehicle',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <div className="flex items-center gap-2.5">
          <img
            src={ride.driver.avatar}
            alt={ride.driver.name}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="text-slate-800 font-medium text-xs">{ride.driver.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-2.5 w-2.5 fill-amber-400" />
                {ride.driver.rating}
              </span>
              <span>•</span>
              <span className="truncate max-w-[120px]">{ride.driver.vehicleModel}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'occupancy',
      header: 'Seat Occupancy',
      className: 'whitespace-nowrap',
      render: (ride) => {
        const bookedSeats = ride.totalSeats - ride.availableSeats;
        const isFull = ride.availableSeats === 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {Array.from({ length: ride.totalSeats }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full border border-white flex items-center justify-center text-[9px] ${i < bookedSeats
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                    }`}
                />
              ))}
            </div>
            <span
              className={`text-[11px] font-normal ${isFull ? 'text-amber-600 font-medium' : 'text-slate-600'
                }`}
            >
              {ride.availableSeats} of {ride.totalSeats} open
            </span>
          </div>
        );
      }
    },
    {
      key: 'price',
      header: 'Rate / Seat',
      className: 'whitespace-nowrap',
      render: (ride) => (
        <span className="text-sm font-medium text-emerald-600">₹{ride.pricePerSeat}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (ride) => <Badge status={ride.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (ride) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewRide(ride);
            }}
            className="rounded-lg p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs transition-all cursor-pointer"
            title="View Ride Manifest"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRide(ride.id);
            }}
            className="rounded-lg p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
            title="Remove Ride"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Table
      data={rides}
      columns={columns}
      containerClassName={containerClassName}
      keyExtractor={(ride) => ride.id}
      emptyMessage="No carpool rides found"
      emptySubtext="Try adjusting your search criteria or publish a new carpool trip."
      emptyIcon={Car}
      isLoading={isLoading}
      onRowClick={(ride) => handleViewRide(ride)}
      pagination={
        serverPagination
          ? {
              currentPage: serverPagination.page,
              pageSize: serverPagination.limit,
              totalItems: serverPagination.total,
              onPageChange: serverPagination.onPageChange,
              onPageSizeChange: serverPagination.onPageSizeChange,
              pageSizeOptions: [10, 20, 50],
              itemName: 'rides',
              autoSlice: false
            }
          : {
              currentPage,
              pageSize,
              totalItems: rides.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
              pageSizeOptions: [5, 10, 20],
              itemName: 'rides'
            }
      }
    />
  );
};
