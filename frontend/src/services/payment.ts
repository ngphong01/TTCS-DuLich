// src/services/payment.ts
import api from '../lib/api';

export async function getUserPayments(userId: number) {
  const res = await api.get(`/payment/user/${userId}`);
  return res.data as Array<{
    id: number;
    amount: number;
    status: string;
    provider: string;
    bookingId: number;
  }>;
}