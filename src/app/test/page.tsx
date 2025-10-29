export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">✅ Server đang hoạt động!</h1>
        <p className="text-gray-700 mb-6">Next.js server đã khởi động thành công</p>
        
        <div className="space-y-4">
          <a 
            href="/account" 
            className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🔗 Truy cập trang Account
          </a>
          
          <a 
            href="/debug-session" 
            className="block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            🔧 Debug Session
          </a>
          
          <a 
            href="/api/auth/oauth/google" 
            className="block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            🔐 Test Login
          </a>
          
          <a 
            href="/" 
            className="block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            🏠 Về trang chủ
          </a>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Hướng dẫn:</strong><br/>
            1. Nhấn "Test Login" để đăng nhập<br/>
            2. Sau khi đăng nhập thành công, nhấn "Truy cập trang Account"<br/>
            3. Nếu vẫn không hiển thị, sử dụng "Debug Session" để kiểm tra
          </p>
        </div>
      </div>
    </div>
  );
}
