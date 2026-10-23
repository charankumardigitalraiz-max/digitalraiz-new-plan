import { apiClient } from './apiClient';
import type { TripPlan } from '../types';
import { mockTrips } from '../data/mockData';

class TripService {
  async getTrips(): Promise<TripPlan[]> {
    try {
      const res = await apiClient.get<TripPlan[]>('/api/admin/trips');
      return Array.isArray(res) ? res : mockTrips;
    } catch {
      return mockTrips;
    }
  }

  async getTripById(id: string): Promise<TripPlan | undefined> {
    try {
      const res = await apiClient.get<TripPlan>(`/api/admin/trips/${id}`);
      return res;
    } catch {
      return mockTrips.find(t => t.id === id);
    }
  }

  async createTrip(trip: Partial<TripPlan>): Promise<TripPlan> {
    try {
      return await apiClient.post<TripPlan>('/api/admin/trips', trip);
    } catch {
      return trip as TripPlan;
    }
  }

  async deleteTrip(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/api/admin/trips/${id}`);
    } catch {
      return { success: true };
    }
  }
}

export const tripService = new TripService();
