export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Base URL left empty to use CRA proxy to backend (http://localhost:3001)
const BASE_URL = '';

// Helper function to get auth headers
export function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tg_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
}

// Helper function to get token
export function getToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('tg_token') : null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tg_token') : null;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : (await res.text() as unknown as T);

  if (!res.ok) {
    const errorData = data as any;
    const message = errorData?.error || errorData?.message || `Request failed with ${res.status}`;
    const details = errorData?.details;
    const fullMessage = details ? `${message}\n${details}` : message;
    const error = new Error(String(fullMessage));
    (error as any).status = res.status;
    (error as any).details = details;
    throw error;
  }
  return data as T;
}

export const AuthAPI = {
  login: (body: { email: string; password: string }) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: { email: string; password: string; name?: string }) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body: { email: string }) => apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: { token: string; password: string }) => apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const DestinationAPI = {
  list: () => apiFetch('/api/destination'),
  bySlug: (slug: string) => apiFetch(`/api/destination/${encodeURIComponent(slug)}`),
};

export const BookingAPI = {
  create: (body: Record<string, unknown>) => apiFetch('/api/booking', { method: 'POST', body: JSON.stringify(body) }),
  byUser: (userId: number) => apiFetch(`/api/booking/user/${userId}`),
};

export const ReviewAPI = {
  byUser: (userId: number) => apiFetch(`/api/review/user/${userId}`),
};

export interface PaymentCreateResponse {
  paymentId?: number;
  status?: string;
  provider?: string;
  url?: string;
  gatewayOrderId?: string;
}

export const PaymentAPI = {
  create: (body: Record<string, unknown>) =>
    apiFetch<PaymentCreateResponse>('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  byUser: (userId: number) => apiFetch(`/api/payment/user/${userId}`),
};

export const UserAPI = {
  current: () => apiFetch<{ user?: { id: number; name: string; email: string } | null; authenticated?: boolean }>('/api/auth/user'),
};


