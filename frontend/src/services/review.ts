// src/services/review.ts
import api from '../lib/api';

export type Review = {
  id: number;
  rating: number;
  comment?: string;
  destinationId: number;
  userId: number;
  user?: { name: string; email: string };
  destination?: { name: string };
  createdAt: string;
};

export async function getUserReviews(userId: number) {
  const res = await api.get(`/review/user/${userId}`);
  return res.data as Review[];
}

export async function getDestinationReviews(destinationId: number) {
  const res = await api.get(`/review/${destinationId}`);
  return res.data as Review[];
}

export async function getFeaturedReviews(limit: number = 5) {
  // For now, we'll fetch all reviews and limit on client side
  // In production, create a dedicated endpoint
  const res = await api.get(`/review/user/1`); // Temporary - should be /api/review/featured
  return (res.data as Review[]).slice(0, limit);
}
