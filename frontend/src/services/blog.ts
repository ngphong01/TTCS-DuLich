import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author?: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  published: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  items: Blog[];
  total: number;
  page: number;
  pages: number;
}

export const getBlogs = async (page = 1, limit = 12, category?: string): Promise<BlogsResponse> => {
  const response = await axios.get(`${API_URL}/blog`, {
    params: { page, limit, category, published: true }
  });
  return response.data;
};

export const getBlogBySlug = async (slug: string): Promise<Blog> => {
  const response = await axios.get(`${API_URL}/blog/${slug}`);
  return response.data;
};

export const getFeaturedBlogs = async (limit = 6): Promise<Blog[]> => {
  const response = await axios.get(`${API_URL}/blog`, {
    params: { limit, featured: true, published: true }
  });
  return response.data.items || response.data;
};

