// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/user';

export function useUser(id?: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => {
      if (!id) throw new Error('Missing id');
      return getUser(id);
    },
    enabled: !!id,
  });
}