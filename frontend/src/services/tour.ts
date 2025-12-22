// src/services/tour.ts
import api from '../lib/api';

export type Tour = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string | null;
  photos?: any;
  duration?: number;
  price?: number;
  originalPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  tags?: any;
  featured?: boolean;
  highlights?: any;
  itinerary?: any;
  map?: string | null;
  faq?: any;
  policies?: any;
  transport?: string | null;
  destinationId?: number | null;
  destination?: {
    id: number;
    name: string;
    slug: string;
    country?: string | null;
    image?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getTours() {
  const res = await api.get('/tour');
  return res.data.items as Tour[];
}

export async function getTourBySlug(slug: string) {
  const res = await api.get(`/tour/${slug}`);
  return res.data as Tour;
}

export async function getToursPaged(
  page: number,
  limit: number,
  options?: {
    q?: string;
    destinationId?: number;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
  }
) {
  const res = await api.get('/tour', {
    params: { page, limit, ...(options || {}) },
  });
  return res.data as { items: Tour[]; total: number; page: number; pages: number };
}

// Admin
export async function createTour(data: Partial<Tour>) {
  const res = await api.post('/tour', data);
  return res.data as Tour;
}

export async function updateTour(id: number, data: Partial<Tour>) {
  const res = await api.put(`/tour/${id}`, data);
  return res.data as Tour;
}

export async function deleteTour(id: number) {
  await api.delete(`/tour/${id}`);
}
