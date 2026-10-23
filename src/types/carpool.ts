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
