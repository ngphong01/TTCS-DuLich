// src/lib/auth.ts
export type JwtPayload = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  exp?: number;
};

export function getToken() {
  return localStorage.getItem('tg_token') || null;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUser(): JwtPayload | null {
  const t = getToken();
  if (!t) return null;
  const payload = parseJwt(t);
  if (!payload) return null;
  if (payload.exp && Date.now() >= payload.exp * 1000) return null;
  return payload;
}