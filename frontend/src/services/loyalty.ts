// src/services/loyalty.ts
import api from '../lib/api';

export async function getUserLoyalty(userId: number) {
  const res = await api.get(`/loyalty/${userId}`);
  return res.data as { userId: number; points: number };
}