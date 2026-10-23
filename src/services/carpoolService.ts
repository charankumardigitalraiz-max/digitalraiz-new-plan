import { apiClient } from './apiClient';
import type {
  CarpoolRide,
  Driver,
  BackendRide,
  BackendBooking,
  BackendPassenger,
  CarpoolCardCount,
  CarpoolPagination,
  CarpoolRidesResponse,
  CarpoolRideDetailResponse,
  CarpoolBookingsResponse,
  CarpoolBookingDetailResponse,
  GetCarpoolRidesParams,
  GetCarpoolBookingsParams
} from '../types';
import { mockCarpoolRides, mockDrivers } from '../data/mockData';

export interface GetRidesWithMetaResult {
  rides: CarpoolRide[];
  backendRides: BackendRide[];
  cardCount: CarpoolCardCount;
  pagination: CarpoolPagination;
}

/**
 * Service for Admin Carpool Management (Rides & Bookings)
 * Directly matches endpoints in public/carpool.txt
 */
class CarpoolService {
  // ===========================================================================
  // A. ADMIN RIDE MANAGEMENT
  // ===========================================================================

  /**
   * 1. GET ALL RIDES
   * GET /api/admin/carpool/rides?status=active&page=1&limit=20
   */
  async getAllRides(params?: GetCarpoolRidesParams): Promise<CarpoolRidesResponse> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20
    };

    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return apiClient.get<CarpoolRidesResponse>('/api/admin/carpool/rides', {
      params: queryParams
    });
  }

  /**
   * Fetch rides along with backend cardCount and pagination metadata
   */
  async getRidesWithMeta(params?: GetCarpoolRidesParams): Promise<GetRidesWithMetaResult> {
    try {
      const response = await this.getAllRides(params);
      const backendRides = response?.data?.rides || [];

      // Extract pagination properly from response.data.pagination or fallback to data root
      const pagination: CarpoolPagination = response?.data?.pagination || {
        total: response?.data?.total ?? backendRides.length,
        page: response?.data?.page ?? (params?.page || 1),
        limit: response?.data?.limit ?? (params?.limit || 20),
        totalPages: response?.data?.totalPages ?? 1
      };

      // Extract cardCount properly from response.data.cardCount
      const cardCount: CarpoolCardCount = response?.data?.cardCount || {
        totalRides: pagination.total,
        activeRides: backendRides.filter((r) => r.status === 'active').length,
        upcomingRides: backendRides.filter((r) => r.status === 'upcoming' || r.status === 'active').length,
        completedRides: backendRides.filter((r) => r.status === 'completed').length,
        cancelledRides: backendRides.filter((r) => r.status === 'cancelled').length
      };

      const rides = Array.isArray(response?.data?.rides)
        ? response.data.rides.map((r) => this.mapBackendRideToCarpoolRide(r))
        : mockCarpoolRides;

      return {
        rides,
        backendRides,
        cardCount,
        pagination
      };
    } catch (err) {
      console.warn('Backend getRidesWithMeta fallback:', err);
      return {
        rides: mockCarpoolRides,
        backendRides: [],
        cardCount: {
          totalRides: mockCarpoolRides.length,
          activeRides: mockCarpoolRides.filter((r) => r.status === 'active').length,
          upcomingRides: mockCarpoolRides.filter((r) => r.status === 'active').length,
          completedRides: mockCarpoolRides.filter((r) => r.status === 'completed').length,
          cancelledRides: mockCarpoolRides.filter((r) => r.status === 'cancelled').length
        },
        pagination: {
          total: mockCarpoolRides.length,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };
    }
  }

  /**
   * Convenience method to fetch and convert rides for frontend views
   * Falls back gracefully to mock data if backend route is unavailable
   */
  async getRides(params?: GetCarpoolRidesParams): Promise<CarpoolRide[]> {
    const res = await this.getRidesWithMeta(params);
    return res.rides;
  }

  /**
   * Fetch ride status counts for top stat cards
   */
  async getRideCardCounts(): Promise<CarpoolCardCount | undefined> {
    try {
      const response = await this.getAllRides({ limit: 1 });
      return response?.data?.cardCount;
    } catch {
      return undefined;
    }
  }

  /**
   * 2. GET RIDE DETAILS & ASSOCIATED PASSENGER BOOKINGS BY RIDE ID
   * GET /api/admin/carpool/rides/:id
   */
  async getRideById(id: string | number): Promise<CarpoolRideDetailResponse> {
    return apiClient.get<CarpoolRideDetailResponse>(`/api/admin/carpool/rides/${id}`);
  }

  /**
   * 3. UPDATE RIDE STATUS (active, completed, cancelled)
   * PATCH /api/admin/carpool/rides/:id/status
   * Body: { status }
   */
  async updateRideStatus(
    id: string | number,
    status: 'active' | 'completed' | 'cancelled'
  ): Promise<{ status: string; message: string; data?: { ride: Partial<BackendRide> } }> {
    return apiClient.patch(`/api/admin/carpool/rides/${id}/status`, { status });
  }

  /**
   * 4. DELETE A RIDE (Admin Override)
   * DELETE /api/admin/carpool/rides/:id
   */
  async deleteRide(id: string | number): Promise<{ status: string; message: string }> {
    return apiClient.delete(`/api/admin/carpool/rides/${id}`);
  }

  // ===========================================================================
  // B. ADMIN BOOKING MANAGEMENT
  // ===========================================================================

  /**
   * 5. GET ALL BOOKINGS
   * GET /api/admin/carpool/bookings?bookingStatus=confirmed&page=1&limit=20
   */
  async getAllBookings(params?: GetCarpoolBookingsParams): Promise<CarpoolBookingsResponse> {
    return apiClient.get<CarpoolBookingsResponse>('/api/admin/carpool/bookings', {
      params: {
        bookingStatus: params?.bookingStatus,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        passengerId: params?.passengerId,
        rideId: params?.rideId
      }
    });
  }

  /**
   * 6. GET BOOKING DETAILS BY ID
   * GET /api/admin/carpool/bookings/:id
   */
  async getBookingById(id: string | number): Promise<CarpoolBookingDetailResponse> {
    return apiClient.get<CarpoolBookingDetailResponse>(`/api/admin/carpool/bookings/${id}`);
  }

  /**
   * 7. UPDATE BOOKING STATUS (confirmed, cancelled, completed)
   * PATCH /api/admin/carpool/bookings/:id/status
   * Body: { bookingStatus }
   */
  async updateBookingStatus(
    id: string | number,
    bookingStatus: 'confirmed' | 'cancelled' | 'completed'
  ): Promise<{ status: string; message: string; data?: { booking: Partial<BackendBooking> } }> {
    return apiClient.patch(`/api/admin/carpool/bookings/${id}/status`, { bookingStatus });
  }

  /**
   * 8. CANCEL A BOOKING WITH AUTOMATIC SEAT RESTORATION TO RIDE
   * POST /api/admin/carpool/bookings/:id/cancel
   */
  async cancelBooking(
    id: string | number
  ): Promise<{ status: string; message: string; data?: { booking: Partial<BackendBooking> } }> {
    return apiClient.post(`/api/admin/carpool/bookings/${id}/cancel`);
  }

  // ===========================================================================
  // DRIVER KYC VERIFICATIONS
  // ===========================================================================

  async getDrivers(): Promise<Driver[]> {
    try {
      const res = await apiClient.get<Driver[]>('/api/admin/drivers');
      return Array.isArray(res) ? res : mockDrivers;
    } catch {
      return mockDrivers;
    }
  }

  async verifyDriver(
    driverId: string,
    status: 'verified' | 'rejected' | 'pending'
  ): Promise<{ success: boolean }> {
    try {
      return await apiClient.patch(`/api/admin/drivers/${driverId}/verification`, { status });
    } catch {
      return { success: true };
    }
  }

  // ===========================================================================
  // DATA ADAPTER: BackendRide -> UI CarpoolRide
  // ===========================================================================

  public mapBackendRideToCarpoolRide(
    b: BackendRide,
    passengerList: BackendPassenger[] = []
  ): CarpoolRide {
    const originAddress = b.origin?.address || 'Origin Point';
    const destAddress = b.destination?.address || 'Destination Point';

    // Smart City Extractor from address strings (handles JNTU Hyderabad, Warangal, etc.)
    const extractCity = (addr: string): string => {
      if (addr.includes('Hyderabad')) return 'Hyderabad';
      if (addr.includes('Warangal')) return 'Warangal';
      if (addr.includes('Bangalore') || addr.includes('Bengaluru')) return 'Bengaluru';
      if (addr.includes('Vijayawada')) return 'Vijayawada';
      if (addr.includes('Mumbai')) return 'Mumbai';
      if (addr.includes('Pune')) return 'Pune';
      const parts = addr.split(',').map((p) => p.trim()).filter(Boolean);
      return parts[0] || 'City';
    };

    const originCity = extractCity(originAddress);
    const destinationCity = extractCity(destAddress);

    const departureDate = b.departureTime ? b.departureTime.split('T')[0] : '2026-10-25';
    let departureTimeStr = '08:30 AM';
    try {
      if (b.departureTime) {
        departureTimeStr = new Date(b.departureTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      departureTimeStr = '08:30 AM';
    }

    // Vehicle plate extraction (e.g. from "Honda City (KA-01-MJ-1234)")
    let plateNumber = b.vehicleNumber || 'TS-09-AB-1234';
    let modelName = b.vehicleModel || 'Honda City';
    const plateMatch = modelName.match(/\(([^)]+)\)/);
    if (plateMatch && plateMatch[1]) {
      plateNumber = plateMatch[1];
      modelName = modelName.replace(/\s*\([^)]+\)/, '').trim();
    }

    const driverName = b.publisher?.name || 'User 8557';
    const rawPhone = b.publisher?.phone || '9908068557';
    const driverPhone = rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`;
    const driverEmail =
      b.publisher?.email ||
      `${driverName.toLowerCase().replace(/\s+/g, '.') || 'driver'}@wayfer.com`;

    const driver: Driver = {
      id: String(b.publisher?.id || b.publisherId || `drv_${b.id}`),
      name: driverName,
      avatar:
        b.publisher?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: 4.9,
      totalRides: 25,
      phone: driverPhone,
      email: driverEmail,
      verificationStatus: 'verified',
      idDocument: 'DL-IND-2024-9988',
      drivingLicenseNumber: 'TS-09-2022-001234',
      vehicleModel: modelName,
      vehiclePlate: plateNumber,
      vehicleColor: 'Silver Metallic',
      joinedDate: b.createdAt ? b.createdAt.split('T')[0] : '2026-01-15'
    };

    const passengers = passengerList.map((p) => ({
      name: p.name,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      seatsBooked: p.seatsBooked,
      pickupStop: p.from
    }));

    return {
      id: String(b.id),
      originCity,
      originPoint: originAddress,
      destinationCity,
      destinationPoint: destAddress,
      departureTime: departureTimeStr,
      departureDate,
      driver,
      totalSeats: b.totalSeats || 3,
      availableSeats: b.availableSeats !== undefined ? b.availableSeats : 1,
      pricePerSeat: b.pricePerSeat || 1122,
      currency: '₹',
      status: (b.status === 'completed' || b.status === 'cancelled') ? b.status : 'active',
      waypoints: (b.stops || []).map((s: any) => ({
        city: s.city || s.address || '',
        stopName: s.stopName || s.address || '',
        estimatedTime: s.estimatedTime || ''
      })),
      distance: b.estimatedDistanceKm ? `${b.estimatedDistanceKm} km` : '142.5 km',
      rules: {
        allowSmoking: false,
        allowPets: false,
        hasAC: true,
        maxTwoInBack: true,
        luggageSize: 'medium'
      },
      passengers
    };
  }
}

export const carpoolService = new CarpoolService();
