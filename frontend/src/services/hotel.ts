// src/services/hotel.ts
import api from '../lib/api';

export type Hotel = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  pricePerNight?: number;
  rating?: number;
  featured?: boolean;
  amenities?: any;
  contact?: string | null;
  website?: string | null;
  destinationId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getHotels() {
  const res = await api.get('/hotel');
  return res.data as Hotel[];
}

export async function getFeaturedHotels() {
  const res = await api.get('/hotel/featured');
  return res.data as Hotel[];
}

export async function getHotelBySlug(slug: string) {
  const res = await api.get(`/hotel/${slug}`);
  return res.data as Hotel;
}

export async function getHotelsPaged(
  page: number,
  pageSize: number,
  options?: {
    q?: string;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    destinationId?: number;
    sort?: string;
  }
) {
  const res = await api.get('/hotel', {
    params: { page, pageSize, ...(options || {}) },
  });
  return res.data as { items: Hotel[]; total: number; page: number; pageSize: number };
}

// Admin
export async function createHotel(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  address?: string;
  city?: string;
  country?: string;
  pricePerNight?: number;
  rating?: number;
  featured?: boolean;
  amenities?: any;
  contact?: string;
  website?: string;
}) {
  const res = await api.post('/hotel', data);
  return res.data as Hotel;
}

export async function updateHotel(id: number, data: Partial<Hotel>) {
  const res = await api.put(`/hotel/${id}`, data);
  return res.data as Hotel;
}

export async function deleteHotel(id: number) {
  await api.delete(`/hotel/${id}`);
}

