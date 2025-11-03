import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignOut(): JSX.Element {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      localStorage.removeItem('tg_token');
      // Clear cookie if set
      document.cookie = 'tg_token=; Max-Age=0; path=/;';
    } finally {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}


