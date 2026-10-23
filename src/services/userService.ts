import { apiClient } from './apiClient';
import type { GlobalUser } from '../types';
import { mockGlobalUsers } from '../data/mockUsers';

class UserService {
  async getUsers(): Promise<GlobalUser[]> {
    try {
      const res = await apiClient.get<GlobalUser[]>('/api/admin/users');
      return Array.isArray(res) ? res : mockGlobalUsers;
    } catch {
      return mockGlobalUsers;
    }
  }

  async getUserById(id: string): Promise<GlobalUser | undefined> {
    try {
      const res = await apiClient.get<GlobalUser>(`/api/admin/users/${id}`);
      return res;
    } catch {
      return mockGlobalUsers.find(u => u.id === id);
    }
  }

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'pending'): Promise<{ success: boolean }> {
    try {
      return await apiClient.patch(`/api/admin/users/${id}/status`, { status });
    } catch {
      return { success: true };
    }
  }

  async updateKycStatus(id: string, kycStatus: 'verified' | 'pending' | 'unverified'): Promise<{ success: boolean }> {
    try {
      return await apiClient.patch(`/api/admin/users/${id}/kyc`, { kycStatus });
    } catch {
      return { success: true };
    }
  }
}

export const userService = new UserService();
