import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404 - Không tìm thấy trang</h1>
      <Link to="/" className="text-blue-600 hover:underline">Về trang chủ</Link>
    </div>
  );
}