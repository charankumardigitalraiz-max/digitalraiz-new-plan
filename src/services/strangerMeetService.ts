import { apiClient } from './apiClient';
import type { StrangerMeet } from '../types';
import { mockStrangerMeets } from '../data/mockData';

class StrangerMeetService {
  async getStrangerMeets(): Promise<StrangerMeet[]> {
    try {
      const res = await apiClient.get<StrangerMeet[]>('/api/admin/stranger-meets');
      return Array.isArray(res) ? res : mockStrangerMeets;
    } catch {
      return mockStrangerMeets;
    }
  }

  async getMeetById(id: string): Promise<StrangerMeet | undefined> {
    try {
      const res = await apiClient.get<StrangerMeet>(`/api/admin/stranger-meets/${id}`);
      return res;
    } catch {
      return mockStrangerMeets.find(m => m.id === id);
    }
  }

  async createStrangerMeet(meet: Partial<StrangerMeet>): Promise<StrangerMeet> {
    try {
      return await apiClient.post<StrangerMeet>('/api/admin/stranger-meets', meet);
    } catch {
      return meet as StrangerMeet;
    }
  }

  async updateMeetStatus(id: string, status: StrangerMeet['status']): Promise<{ success: boolean }> {
    try {
      return await apiClient.patch(`/api/admin/stranger-meets/${id}/status`, { status });
    } catch {
      return { success: true };
    }
  }

  async deleteStrangerMeet(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/api/admin/stranger-meets/${id}`);
    } catch {
      return { success: true };
    }
  }
}

export const strangerMeetService = new StrangerMeetService();
