import { getCurrentUser } from '../../lib/auth';
import { useUser } from '../../hooks/useUser';
import Skeleton from '../../components/Skeleton';
import AccountSidebar from '../../components/AccountSidebar';

export default function Profile() {
  const me = getCurrentUser();
  const { data, isLoading } = useUser(me?.id);

  return (
    <main className="container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-sm text-gray-600 mt-1">Xem và quản lý thông tin hồ sơ của bạn</p>
          </div>

          <div className="card p-6">
            {isLoading && <Skeleton className="h-20" />}
            {!isLoading && data && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Tên</p>
                    <p className="font-medium text-gray-900">{data.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{data.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <p className="font-medium text-gray-900 capitalize">{data.role || 'user'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
