// src/services/admin.ts
import api from '../lib/api';

export async function getSummary(period?: '7days' | '30days' | '3months') {
  const res = await api.get('/admin/summary', { params: { period } });
  return res.data as {
    revenue: number;
    totalBookings: number;
    totalUsers: number;
    totalDestinations: number;
    pendingBookings?: number;
    todayBookings?: number;
    recentReviews?: number;
    featuredDestinations?: number;
    performance?: {
      completionRate: number;
      cancellationRate: number;
      averageRating: number;
      ratingPercentage: number;
    };
    alerts?: {
      pendingBookings: number;
      recentBookings: Array<{
        id: string | number;
        user?: string;
        destination?: string;
        createdAt: string;
      }>;
    };
  };
}

export async function getUsers() {
  const res = await api.get('/admin/users');
  return res.data as Array<{ id: number; email: string; name?: string; role?: string; settings?: any; createdAt?: string }>;
}

export async function updateUser(id: number, data: Partial<{ role: string; name: string; email: string; avatarUrl: string; loyaltyRank?: string; loyaltyPoints?: number }>) {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
}

export async function toggleUserActive(id: number, active: boolean) {
  const res = await api.put(`/admin/users/${id}`, { active });
  return res.data;
}

export async function getAdminBookingsPaged(params: { page: number; pageSize: number; sortBy?: string; order?: 'asc'|'desc' }) {
  const res = await api.get('/admin/bookings', { params });
  return res.data as { items: any[]; total: number; page: number; pageSize: number };
}

export async function getAdminReviewsPaged(params: { page: number; pageSize: number; sortBy?: string; order?: 'asc'|'desc' }) {
  const res = await api.get('/admin/reviews', { params });
  return res.data as { items: any[]; total: number; page: number; pageSize: number };
}

export async function getAdminPaymentsPaged(params: { page: number; pageSize: number; sortBy?: string; order?: 'asc'|'desc' }) {
  const res = await api.get('/admin/payments', { params });
  return res.data as { items: any[]; total: number; page: number; pageSize: number };
}

export async function updateBookingStatus(bookingId: number, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
  const res = await api.put(`/admin/bookings/${bookingId}`, { status });
  return res.data;
}

export async function updatePaymentStatus(paymentId: number, status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED') {
  const res = await api.put(`/admin/payments/${paymentId}`, { status });
  return res.data;
}