// src/services/settings.ts
import api from '../lib/api';

export async function updateSettings(id: number, data: { name?: string }) {
  const res = await api.put(`/user/${id}/settings`, data);
  return res.data;
}

export async function changePassword(id: number, password: string) {
  const res = await api.put(`/user/${id}/password`, { password });
  return res.data;
}