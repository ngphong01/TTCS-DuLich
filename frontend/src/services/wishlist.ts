// src/services/wishlist.ts
import api from '../lib/api';

export type WishlistItem = {
  id: number;
  userId: number;
  destinationId: number;
  createdAt: string;
  destination: {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    image?: string | null;
    price?: number | null;
    country?: string | null;
    rating?: number | null;
  };
};

export async function getUserWishlist(userId: number): Promise<WishlistItem[]> {
  const res = await api.get(`/wishlist/user/${userId}`);
  return res.data as WishlistItem[];
}

export async function addToWishlist(destinationId: number): Promise<WishlistItem> {
  const res = await api.post('/wishlist', { destinationId });
  return res.data as WishlistItem;
}

export async function removeFromWishlist(id: number): Promise<void> {
  await api.delete(`/wishlist/${id}`);
}