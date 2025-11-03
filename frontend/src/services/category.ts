// src/services/category.ts
import api from '../lib/api';

export type Category = { id: number; name: string };

export async function getCategories() {
  const res = await api.get('/category');
  return res.data as Category[];
}