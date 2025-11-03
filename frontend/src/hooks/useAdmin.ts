// src/hooks/useAdmin.ts
import { useQuery } from '@tanstack/react-query';
import { getSummary, getUsers } from '../services/admin';

export function useAdminSummary() {
  return useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: getSummary,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getUsers,
  });
}