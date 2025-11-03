// src/services/admin.ts
import api from '../lib/api';

export async function getSummary() {
  const res = await api.get('/admin/summary');
  return res.data as {
    revenue: number;
    totalBookings: number;
    totalUsers: number;
    totalDestinations: number;
    pendingBookings?: number;
    todayBookings?: number;
    recentReviews?: number;
    featuredDestinations?: number;
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
  return res.data as Array<{ id: number; email: string; name?: string; role?: string }>;
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