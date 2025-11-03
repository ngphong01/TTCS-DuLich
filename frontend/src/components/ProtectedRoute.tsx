// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSimpleAuth } from '../lib/use-simple-auth';

export default function ProtectedRoute() {
  const { status, data } = useSimpleAuth() as any;

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated' || !data?.user) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}