// src/hooks/useDestinations.ts
import { useQuery } from '@tanstack/react-query';
import { getDestinations, getFeaturedDestinations, type Destination } from '../services/destination';

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: getDestinations,
  });
}

export function useFeaturedDestinations() {
  const query = useQuery<Destination[]>({
    queryKey: ['destinations', 'featured'],
    queryFn: getFeaturedDestinations,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (formerly cacheTime in v4)
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development' && query.data && Array.isArray(query.data)) {
    console.log('Featured destinations loaded:', query.data.length);
    query.data.forEach((d: Destination) => {
      if (d.image) {
        console.log(`✅ ${d.name} - image: ${d.image}`);
      } else {
        console.log(`❌ ${d.name} - NO image`);
      }
    });
  }
  
  return query;
}