// src/services/auth.ts
import api from '../lib/api';

export type User = {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
};

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data as { user: User; token: string };
}

export async function register(name: string, email: string, password: string) {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data as { user: User; token: string };
}