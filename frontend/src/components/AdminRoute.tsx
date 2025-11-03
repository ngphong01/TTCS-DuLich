// src/components/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';

export default function AdminRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}