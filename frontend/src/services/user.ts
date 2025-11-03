// src/services/user.ts
import api from '../lib/api';
import type { User } from './auth';

export async function getUser(id: number) {
  const res = await api.get(`/user/${id}`);
  return res.data as User & { createdAt?: string };
}