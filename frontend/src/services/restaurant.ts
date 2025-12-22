// src/services/restaurant.ts
import api from '../lib/api';

export type Restaurant = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  cuisine?: string | null;
  priceRange?: string | null;
  rating?: number;
  featured?: boolean;
  amenities?: any;
  contact?: string | null;
  website?: string | null;
  openingHours?: any;
  destinationId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getRestaurants() {
  const res = await api.get('/restaurant');
  return res.data as Restaurant[];
}

export async function getFeaturedRestaurants() {
  const res = await api.get('/restaurant/featured');
  return res.data as Restaurant[];
}

export async function getRestaurantBySlug(slug: string) {
  const res = await api.get(`/restaurant/${slug}`);
  return res.data as Restaurant;
}

export async function getRestaurantsPaged(
  page: number,
  pageSize: number,
  options?: {
    q?: string;
    city?: string;
    country?: string;
    cuisine?: string;
    priceRange?: string;
    featured?: boolean;
    destinationId?: number;
    sort?: string;
  }
) {
  const res = await api.get('/restaurant', {
    params: { page, pageSize, ...(options || {}) },
  });
  return res.data as { items: Restaurant[]; total: number; page: number; pageSize: number };
}

// Admin
export async function createRestaurant(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  address?: string;
  city?: string;
  country?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  featured?: boolean;
  amenities?: any;
  contact?: string;
  website?: string;
  openingHours?: any;
}) {
  const res = await api.post('/restaurant', data);
  return res.data as Restaurant;
}

export async function updateRestaurant(id: number, data: Partial<Restaurant>) {
  const res = await api.put(`/restaurant/${id}`, data);
  return res.data as Restaurant;
}

export async function deleteRestaurant(id: number) {
  await api.delete(`/restaurant/${id}`);
}

