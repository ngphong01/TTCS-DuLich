// src/services/notification.ts
import api from '../lib/api';

export async function getUserNotifications(userId: number) {
  const res = await api.get(`/notification/user/${userId}`);
  return res.data as Array<{
    id: number;
    type: string;
    message: string;
    createdAt: string;
    read: boolean;
  }>;
}