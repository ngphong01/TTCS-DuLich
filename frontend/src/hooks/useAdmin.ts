// src/hooks/useAdmin.ts
import { useQuery } from '@tanstack/react-query';
import { getSummary, getUsers } from '../services/admin';

export function useAdminSummary(period?: '7days' | '30days' | '3months') {
  return useQuery({
    queryKey: ['admin', 'summary', period],
    queryFn: () => getSummary(period),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getUsers,
  });
}