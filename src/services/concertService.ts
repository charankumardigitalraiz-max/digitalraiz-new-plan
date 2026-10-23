import { apiClient } from './apiClient';
import type { ConcertEvent } from '../types';
import { mockConcerts } from '../data/mockData';

class ConcertService {
  async getConcerts(): Promise<ConcertEvent[]> {
    try {
      const res = await apiClient.get<ConcertEvent[]>('/api/admin/concerts');
      return Array.isArray(res) ? res : mockConcerts;
    } catch {
      return mockConcerts;
    }
  }

  async getConcertById(id: string): Promise<ConcertEvent | undefined> {
    try {
      const res = await apiClient.get<ConcertEvent>(`/api/admin/concerts/${id}`);
      return res;
    } catch {
      return mockConcerts.find(c => c.id === id);
    }
  }

  async createConcert(concert: Partial<ConcertEvent>): Promise<ConcertEvent> {
    try {
      return await apiClient.post<ConcertEvent>('/api/admin/concerts', concert);
    } catch {
      return concert as ConcertEvent;
    }
  }

  async updateConcertStatus(
    id: string,
    status: 'active' | 'upcoming' | 'completed' | 'cancelled'
  ): Promise<{ success: boolean }> {
    try {
      return await apiClient.patch(`/api/admin/concerts/${id}/status`, { status });
    } catch {
      return { success: true };
    }
  }

  async deleteConcert(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/api/admin/concerts/${id}`);
    } catch {
      return { success: true };
    }
  }
}

export const concertService = new ConcertService();
