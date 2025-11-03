// src/services/wishlist.ts
import api from '../lib/api';

export async function getUserWishlist(userId: number) {
  const res = await api.get(`/wishlist/user/${userId}`);
  return res.data as Array<{
    id: number;
    destinationId: number;
    destination: { id: number; name: string; slug: string };
    createdAt: string;
  }>;
}