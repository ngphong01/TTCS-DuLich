// src/services/booking.ts
import api from '../lib/api';

export async function getUserBookings(userId: number) {
  const res = await api.get(`/booking/user/${userId}`);
  return res.data as Array<{
    id: string | number;
    userId: number;
    destination?: string;
    status: string;
  }>;
}