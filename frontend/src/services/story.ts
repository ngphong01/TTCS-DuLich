import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export interface Story {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  author?: string;
  featured: boolean;
  destination?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  destinationId?: number;
  category?: string;
  tags?: string[];
  likes: number;
  views: number;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesResponse {
  items: Story[];
  total: number;
  page: number;
  pages: number;
}

export const getStories = async (page = 1, limit = 12, featured?: boolean, category?: string): Promise<StoriesResponse> => {
  const response = await axios.get(`${API_URL}/stories`, {
    params: { page, limit, featured, category }
  });
  return response.data;
};

export const getStoryBySlug = async (slug: string): Promise<Story> => {
  const response = await axios.get(`${API_URL}/stories/${slug}`);
  return response.data;
};

export const getFeaturedStories = async (limit = 6): Promise<Story[]> => {
  const response = await axios.get(`${API_URL}/stories/featured`, {
    params: { limit }
  });
  return response.data;
};

export const likeStory = async (id: number, increment: boolean): Promise<{ likes: number }> => {
  const response = await axios.post(`${API_URL}/stories/${id}/like`, { increment });
  return response.data;
};

