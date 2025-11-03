import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError('Lỗi phản hồi từ server. Vui lòng thử lại!');
        return;
      }
      
      if (!response.ok) {
        // Lỗi từ server (400, 409, etc.)
        const errorMessage = data?.message || data?.error || 'Đăng ký thất bại';
        setError(errorMessage);
        return;
      }

      // Đăng ký thành công
      if (data?.token && data?.user) {
        // Lưu token
        localStorage.setItem('tg_token', data.token);
        setSuccess(true);
        
        // Redirect sau 1 giây
        setTimeout(() => {
          // Kiểm tra role và redirect
          if (data?.user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/account');
          }
        }, 1000);
      } else {
        setError('Phản hồi không hợp lệ từ server');
      }
    } catch (e) {
      console.error('Register error:', e);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white rounded-xl shadow-md p-8">
      <h2 className="text-xl font-bold mb-6 text-center">Đăng ký</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">Đăng ký thành công!</div>}
      <form onSubmit={handleRegister}>
        <input className="border px-3 py-2 mb-3 w-full rounded" type="text" placeholder="Họ tên" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="border px-3 py-2 mb-3 w-full rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border px-3 py-2 mb-3 w-full rounded" type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold">Đăng ký</button>
      </form>
      <div className="mt-6 text-center">
        <span className="text-sm">Đã có tài khoản? </span>
        <Link to="/signin" className="text-blue-500 hover:underline text-sm">Đăng nhập</Link>
      </div>
    </div>
  );
}
