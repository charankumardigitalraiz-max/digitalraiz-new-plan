export interface BackendGeoPoint {
  address: string;
  lat: number;
  lng: number;
}

export interface BackendPublisher {
  id: number | string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatar?: string | null;
}

export interface BackendRide {
  id: number | string;
  publisherId: number | string;
  publisher?: BackendPublisher | null;
  origin: BackendGeoPoint;
  destination: BackendGeoPoint;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  vehicleModel?: string | null;
  vehicleNumber?: string | null;
  stops?: any[];
  estimatedDistanceKm?: number | null;
  notes?: string | null;
  status: 'active' | 'completed' | 'cancelled' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendPassenger {
  bookingId: number | string;
  passengerId: number | string;
  name: string;
  email: string | null;
  phone: string | null;
  from: string;
  to: string;
  seatsBooked: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'completed' | string;
  bookedAt: string;
}

export interface BackendBooking {
  id: number | string;
  rideId: number | string;
  passengerId: number | string;
  seatsBooked: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'completed' | string;
  createdAt?: string;
  updatedAt?: string;
  ride?: Partial<BackendRide>;
  passenger?: Partial<BackendPublisher>;
}

export interface CarpoolCardCount {
  totalRides: number;
  activeRides: number;
  upcomingRides: number;
  completedRides: number;
  cancelledRides: number;
}

export interface CarpoolPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCarpoolRidesParams {
  status?: 'active' | 'completed' | 'cancelled' | string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CarpoolRidesResponse {
  status: string;
  data: {
    cardCount?: CarpoolCardCount;
    pagination?: CarpoolPagination;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    rides: BackendRide[];
  };
}

export interface CarpoolRideDetailResponse {
  status: string;
  data: {
    ride: BackendRide;
    passengerList: BackendPassenger[];
    totalPassengers: number;
    totalSeatsOccupied: number;
  };
}

export interface GetCarpoolBookingsParams {
  bookingStatus?: 'confirmed' | 'cancelled' | 'completed' | string;
  page?: number;
  limit?: number;
  passengerId?: number | string;
  rideId?: number | string;
}

export interface CarpoolBookingsResponse {
  status: string;
  data: {
    pagination?: CarpoolPagination;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    bookings: BackendBooking[];
  };
}

export interface CarpoolBookingDetailResponse {
  status: string;
  data: {
    booking: BackendBooking;
    ride?: Partial<BackendRide>;
  };
}

export interface CarpoolPricingConfig {
  pricePerKm: number;
  allowedDeviationPercent: number;
  minAllowedDeviationPercent?: number;
  maxAllowedDeviationPercent?: number;
  platformCharge: number;
}

export interface PricingConfigResponse {
  status: string;
  message?: string;
  data: {
    config: {
      id?: number;
      key?: string;
      carpool: CarpoolPricingConfig;
      updatedAt?: string;
    };
  };
}

export interface BackendDriverItem {
  id: string | number;
  name: string;
  avatar?: string;
  rating?: number;
  totalRides?: number;
  phone?: string;
  email?: string;
  KYCStatus?: 'verified' | 'pending' | 'rejected' | string;
  verificationStatus?: 'verified' | 'pending' | 'rejected' | string;
  isKYC?: boolean;
  isEmailVerified?: boolean;
  idDocument?: string;
  govtIdNumber?: string | null;
  govtIdProof?: string | null;
  drivingLicenseNumber?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  joinedDate?: string;
}

export interface DriverCounts {
  verified: number;
  pending: number;
  rejected?: number;
}

export interface GetCarpoolDriversParams {
  status?: 'all' | 'verified' | 'pending' | 'rejected' | string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface DriversApiResponse {
  status: string;
  data: {
    pagination?: CarpoolPagination;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    counts?: DriverCounts;
    drivers: BackendDriverItem[];
  };
}

export interface DriverDetailApiResponse {
  status: string;
  data: {
    driver: {
      id: string | number;
      name: string;
      phone: string;
      email: string;
      isKYC: boolean;
      isEmailVerified: boolean;
      govtIdNumber?: string | null;
      govtIdProof?: string | null;
      vehicleModel?: string;
      vehiclePlate?: string;
      vehicleColor?: string;
      avatar?: string;
      rating?: number;
      totalRides?: number;
      drivingLicenseNumber?: string;
      joinedDate?: string;
      verificationStatus?: 'verified' | 'pending' | 'rejected';
      KYCStatus?: string;
    };
    publishedRides?: any[];
  };
}

export interface VerifyDriverResponse {
  status: string;
  message?: string;
  data?: {
    user?: {
      id: string | number;
      name: string;
      isKYC: boolean;
    };
  };
}

export interface UpdateKycDocsPayload {
  govtIdNumber?: string;
  govtIdProof?: string;
  isEmailVerified?: boolean;
  isKYC?: boolean;
}

// ============================================================================
// CARPOOL DASHBOARD (ALL-IN-ONE) TYPES (public/carpooling-dashboard.txt)
// ============================================================================

export interface CarpoolDashboardMetrics {
  rides: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  seats: {
    totalSeatsOffered: number;
    totalSeatsBooked: number;
    availableSeats: number;
    occupancyRate: number;
  };
  financials: {
    totalGMV: number;
    avgFare: number;
    currency: string;
  };
  drivers: {
    verified: number;
    pending: number;
    total: number;
  };
}

export interface RouteCorridorItem {
  corridor?: string;
  route?: string;
  origin?: string;
  destination?: string;
  originCity?: string;
  destinationCity?: string;
  rideCount: number;
  totalSeats: number;
  bookedSeats: number;
  totalRevenue: number;
  avgPrice: number;
  distanceKm?: number;
  estimatedDistanceKm?: number;
}

export interface DashboardRecentBooking {
  id: number;
  rideId: number;
  passengerId: number;
  seatsBooked: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSeriesItem {
  date: string;
  label: string;
  fullDate?: string;
  revenue: number;
  volume: number;
}

export interface CarpoolDashboardAnalyticsData {
  timeframe: string;
  totalRevenue: number;
  totalVolume: number;
  series: AnalyticsSeriesItem[];
}

export interface CarpoolDashboardOverviewData {
  metrics: CarpoolDashboardMetrics;
  analytics: CarpoolDashboardAnalyticsData;
  topCorridors: RouteCorridorItem[];
  recentRides: BackendRide[];
  recentBookings: DashboardRecentBooking[];
}

export interface CarpoolDashboardOverviewResponse {
  status: string;
  data: CarpoolDashboardOverviewData;
}

export interface GetDashboardOverviewParams {
  timeframe?: '7D' | '30D' | '90D' | '12M' | string;
  corridorLimit?: number;
}

