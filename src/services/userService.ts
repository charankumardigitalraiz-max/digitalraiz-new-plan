import { apiClient } from './apiClient';
import type { GlobalUser } from '../types';
import { mockGlobalUsers } from '../data/mockUsers';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  kycStatus?: string;
  search?: string;
}

export interface UserSummary {
  totalUsers: number;
  verifiedKYC: number;
  pendingKYC: number;
}

export interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersResponse {
  users: GlobalUser[];
  pagination: UserPagination;
  summary: UserSummary;
}

export interface UserCardCount {
  totalRidesPublished?: number;
  activeRides?: number;
  completedRides?: number;
  cancelledRides?: number;
  totalBookings?: number;
  confirmedBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  totalSpent?: number;
  totalActivities?: number;
}

export interface GetUserDetailResponse {
  user: GlobalUser;
  cardCount?: UserCardCount;
  publishedRides: any[];
  bookings: any[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
  isKYC?: boolean;
  isEmailVerified?: boolean;
  govtIdNumber?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserKycPayload {
  isKYC?: boolean;
  isEmailVerified?: boolean;
  govtIdNumber?: string;
  govtIdProof?: string;
  kycStatus?: string;
}

function mapBackendUserToGlobalUser(u: any): GlobalUser {
  const isKycVerified = Boolean(u.isKYC || u.kycStatus === 'verified');
  const role = u.role || 'user';

  let modules: ('carpooling' | 'concerts' | 'trips' | 'stranger-meets')[] = ['carpooling'];
  if (Array.isArray(u.modules) && u.modules.length > 0) {
    modules = u.modules;
  } else if (role === 'driver' || role === 'passenger') {
    modules = ['carpooling'];
  } else if (role === 'traveler') {
    modules = ['trips'];
  } else if (role === 'concert_goer') {
    modules = ['concerts'];
  }

  const rawDate = u.createdAt || u.joinedDate;
  let formattedJoinedDate = 'Oct 2026';
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedJoinedDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      formattedJoinedDate = String(rawDate);
    }
  }

  return {
    id: String(u.id ?? u._id ?? ''),
    name: u.name || 'Unnamed User',
    email: u.email || '',
    phone: u.phone || '',
    avatar:
      u.avatar ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=160`,
    role,
    modules,
    status: u.status || (u.isActive === false ? 'suspended' : 'active'),
    kycStatus: u.kycStatus || (isKycVerified ? 'verified' : 'pending'),
    isKYC: isKycVerified,
    isEmailVerified: Boolean(u.isEmailVerified),
    city: u.city || 'Hyderabad',
    country: u.country || 'India',
    joinedDate: formattedJoinedDate,
    lastActive: u.lastActive || 'Today',
    rating: typeof u.rating === 'number' ? Number(u.rating.toFixed(1)) : 5.0,
    totalActivities:
      typeof u.totalActivities === 'number'
        ? u.totalActivities
        : (Number(u.totalRidesPublished || 0) + Number(u.totalBookings || 0)),
    totalRidesPublished: Number(u.totalRidesPublished || 0),
    totalBookings: Number(u.totalBookings || 0),
    totalSpentOrEarned: u.totalSpentOrEarned || (u.spentOrEarned ? `₹${u.spentOrEarned}` : '₹0'),
    trustScore: typeof u.trustScore === 'number' ? u.trustScore : (isKycVerified ? 98 : 75),
    govtIdNumber: u.govtIdNumber || '',
    govtIdProof: u.govtIdProof || '',
    idDocument: u.idDocument || u.govtIdProof || u.govtIdNumber || '',
    badges: Array.isArray(u.badges) && u.badges.length > 0
      ? u.badges
      : (isKycVerified ? ['KYC Verified', 'Wayfer Member'] : ['Wayfer Member']),
    bio: u.bio || '',
    vehicleDetails: u.vehicleDetails,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  };
}

class UserService {
  /**
   * 1. GET ALL USERS (with pagination, search, role, kycStatus filters)
   * GET /api/admin/users
   */
  async getUsers(params: UserQueryParams = {}): Promise<GetUsersResponse> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.role && params.role !== 'all') queryParams.role = params.role;
      if (params.kycStatus && params.kycStatus !== 'all') queryParams.kycStatus = params.kycStatus;
      if (params.search && params.search.trim()) queryParams.search = params.search.trim();

      const res = await apiClient.get<any>('/api/admin/users', { params: queryParams });
      const data = res?.data || res;

      let rawUsers: any[] = [];
      if (Array.isArray(data?.users)) {
        rawUsers = data.users;
      } else if (Array.isArray(data)) {
        rawUsers = data;
      }

      const mappedUsers = rawUsers.map(mapBackendUserToGlobalUser);

      const pagination: UserPagination = data?.pagination || {
        total: mappedUsers.length,
        page: params.page || 1,
        limit: params.limit || (mappedUsers.length || 20),
        totalPages: Math.max(1, Math.ceil(mappedUsers.length / (params.limit || 20)))
      };

      const summary: UserSummary = data?.summary || {
        totalUsers: pagination.total || mappedUsers.length,
        verifiedKYC: mappedUsers.filter((u) => u.kycStatus === 'verified' || u.isKYC).length,
        pendingKYC: mappedUsers.filter((u) => u.kycStatus === 'pending').length
      };

      return {
        users: mappedUsers,
        pagination,
        summary
      };
    } catch (err) {
      console.warn('userService.getUsers fetch error, falling back to cached/mock users:', err);
      // Fallback in dev when server is offline
      const filtered = mockGlobalUsers.filter((u) => {
        if (params.search) {
          const q = params.search.toLowerCase();
          const match =
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.includes(q);
          if (!match) return false;
        }
        if (params.role && params.role !== 'all' && u.role !== params.role) return false;
        if (params.kycStatus && params.kycStatus !== 'all' && u.kycStatus !== params.kycStatus) return false;
        return true;
      });

      return {
        users: filtered,
        pagination: {
          total: filtered.length,
          page: params.page || 1,
          limit: params.limit || 20,
          totalPages: Math.max(1, Math.ceil(filtered.length / (params.limit || 20)))
        },
        summary: {
          totalUsers: filtered.length,
          verifiedKYC: filtered.filter((u) => u.kycStatus === 'verified').length,
          pendingKYC: filtered.filter((u) => u.kycStatus === 'pending').length
        }
      };
    }
  }

  /**
   * 2. GET USER DETAILS BY ID (With Published Rides & Bookings)
   * GET /api/admin/users/:id
   */
  async getUserById(id: string): Promise<GetUserDetailResponse> {
    try {
      const res = await apiClient.get<any>(`/api/admin/users/${id}`);
      const data = res?.data || res;

      const userObj = data?.user || (data?.id || data?._id ? data : null);
      if (userObj) {
        return {
          user: mapBackendUserToGlobalUser(userObj),
          cardCount: data?.cardCount || res?.cardCount,
          publishedRides: Array.isArray(data?.publishedRides) ? data.publishedRides : (Array.isArray(res?.publishedRides) ? res.publishedRides : []),
          bookings: Array.isArray(data?.bookings) ? data.bookings : (Array.isArray(res?.bookings) ? res.bookings : [])
        };
      }

      throw new Error(`User with ID ${id} not found in response`);
    } catch (err) {
      console.warn(`userService.getUserById(${id}) fallback:`, err);
      const fallbackUser =
        mockGlobalUsers.find(
          (u) =>
            u.id === id ||
            u.id === id.replace('drv-0', 'usr-00').replace('drv-', 'usr-') ||
            u.email.toLowerCase() === id.toLowerCase()
        ) || mockGlobalUsers[0];

      return {
        user: {
          ...fallbackUser,
          totalActivities: 0,
          totalBookings: 0,
          totalRidesPublished: 0,
          totalSpentOrEarned: '₹0'
        },
        publishedRides: [],
        bookings: []
      };
    }
  }

  /**
   * 3. CREATE NEW USER (Admin Action)
   * POST /api/admin/users
   */
  async createUser(payload: CreateUserPayload): Promise<GlobalUser> {
    const res = await apiClient.post<any>('/api/admin/users', payload);
    const userData = res?.data?.user || res?.data || res?.user || res;
    return mapBackendUserToGlobalUser(userData);
  }

  /**
   * 4. UPDATE USER PROFILE (Name, Email, Phone, Role)
   * PATCH /api/admin/users/:id
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<GlobalUser> {
    const res = await apiClient.patch<any>(`/api/admin/users/${id}`, payload);
    const userData = res?.data?.user || res?.data || res?.user || res;
    return mapBackendUserToGlobalUser(userData);
  }

  /**
   * 5. UPDATE USER KYC & VERIFICATION STATUS
   * PATCH /api/admin/users/:id/kyc
   */
  async updateUserKyc(id: string, payload: UpdateUserKycPayload): Promise<any> {
    const res = await apiClient.patch<any>(`/api/admin/users/${id}/kyc`, payload);
    return res?.data?.user || res?.data || res;
  }

  /**
   * 6. DELETE USER ACCOUNT (Admin Override)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<any>(`/api/admin/users/${id}`);
    return {
      success: true,
      message: res?.message || `User account removed successfully.`
    };
  }
}

export const userService = new UserService();
