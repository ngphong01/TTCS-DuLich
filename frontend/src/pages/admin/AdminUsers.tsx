import Table from '../../components/Table';
import Skeleton from '../../components/Skeleton';
import { useAdminUsers } from '../../hooks/useAdmin';
import { UsersIcon } from '@heroicons/react/24/outline';

export default function AdminUsers() {
  const { data, isLoading } = useAdminUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Người dùng</h1>
          <p className="text-gray-500 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl">
          <UsersIcon className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && data && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Tổng số người dùng</p>
          <p className="text-4xl font-bold">{data.length}</p>
        </div>
      )}

      {/* Table */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table headers={['ID', 'Email', 'Tên', 'Vai trò']}>
            {data.map((u: any) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{u.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    u.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role || 'USER'}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có người dùng nào</p>
        </div>
      )}
    </div>
  );
}