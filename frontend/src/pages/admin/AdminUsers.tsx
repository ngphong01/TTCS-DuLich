import { useState } from 'react';
import Table from '../../components/Table';
import Skeleton from '../../components/Skeleton';
import { useAdminUsers } from '../../hooks/useAdmin';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  TrophyIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import UserInsights from '../../components/admin/UserInsights';
import toast from 'react-hot-toast';
import { updateUser, toggleUserActive } from '../../services/admin';

export default function AdminUsers() {
  const { data, isLoading, refetch, error } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editingLoyalty, setEditingLoyalty] = useState<{userId: number, rank: string, points: number | null} | null>(null);

  // Debug: Log data
  console.log('👥 AdminUsers - Data:', data);
  console.log('👥 AdminUsers - Data length:', data?.length || 0);
  console.log('👥 AdminUsers - Loading:', isLoading);
  console.log('👥 AdminUsers - Error:', error);
  if (data && data.length > 0) {
    console.log('👥 AdminUsers - First user:', data[0]);
  }

  // Calculate stats
  const stats = {
    total: data?.length || 0,
    admins: data?.filter((u: any) => u.role === 'ADMIN').length || 0,
    users: data?.filter((u: any) => u.role === 'USER' || !u.role).length || 0,
    activeToday: Math.floor((data?.length || 0) * 0.3), // Mock data
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await toggleUserActive(userId, !currentActive);
      toast.success(!currentActive ? 'Đã bật hoạt động' : 'Đã tắt hoạt động');
      refetch();
    } catch (e) {
      console.error('Error toggling active:', e);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  // Filter users - Hiển thị tất cả nếu không có search/role filter
  const filteredUsers = data?.filter((u: any) => {
    // Nếu không có search term và role là ALL, hiển thị tất cả
    if (!searchTerm && selectedRole === 'ALL') {
      return true;
    }
    
    const matchesSearch = !searchTerm || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'ALL' || 
      (selectedRole === 'ADMIN' && u.role === 'ADMIN') ||
      (selectedRole === 'USER' && (u.role === 'USER' || !u.role));
    
    return matchesSearch && matchesRole;
  }) || [];
  
  // Debug: Log để kiểm tra
  console.log('👥 Total users from API:', data?.length || 0);
  console.log('👥 Filtered users:', filteredUsers.length);
  console.log('👥 Search term:', searchTerm);
  console.log('👥 Selected role:', selectedRole);

  const handleEditRole = (userId: number, currentRole: string) => {
    setEditingUserId(userId);
    setEditingRole(currentRole || 'USER');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole('');
  };

  const handleSaveRole = async (userId: number) => {
    try {
      await updateUser(userId, { role: editingRole });
        toast.success('Đã cập nhật vai trò thành công!');
        setEditingUserId(null);
        setEditingRole('');
        refetch(); // Refresh data
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Có lỗi xảy ra khi cập nhật vai trò');
    }
  };

  const handleEditLoyalty = (user: any) => {
    const rank = user?.settings?.loyaltyRank || 'Bronze';
    // Không set points mặc định, để user tự nhập (để null để input trống)
    setEditingLoyalty({ userId: user.id, rank, points: null });
  };

  const handleSaveLoyalty = async () => {
    if (!editingLoyalty) return;
    
    // Validate: điểm phải được nhập và là số hợp lệ
    const points = editingLoyalty.points;
    if (points === null || points === undefined || isNaN(points) || points < 0) {
      toast.error('Vui lòng nhập số điểm thưởng hợp lệ (>= 0)');
      return;
    }
    
    // Validate: điểm không được vượt quá 9999
    if (points > 9999) {
      toast.error('Điểm thưởng không được vượt quá 9999');
      return;
    }
    
    try {
      console.log('🔄 Saving loyalty:', { userId: editingLoyalty.userId, rank: editingLoyalty.rank, points });
      const result = await updateUser(editingLoyalty.userId, { 
        loyaltyRank: editingLoyalty.rank,
        loyaltyPoints: Number(points) 
      });
      console.log('✅ Loyalty saved successfully:', result);
      toast.success('Đã cập nhật hạng thành viên thành công!');
      setEditingLoyalty(null);
      refetch();
    } catch (error: any) {
      console.error('❌ Error updating loyalty:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật hạng thành viên';
      toast.error(errorMessage);
    }
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'Bronze': 'from-orange-500 to-amber-600',
      'Silver': 'from-gray-400 to-gray-600',
      'Gold': 'from-yellow-500 to-amber-600',
      'Platinum': 'from-cyan-500 to-blue-600',
      'Diamond': 'from-purple-600 to-pink-600',
    };
    return colors[rank] || colors['Bronze'];
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?`)) return;

    try {
      const token = localStorage.getItem('tg_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        toast.success('Đã xóa người dùng thành công!');
        refetch();
      } else {
        toast.error('Không thể xóa người dùng');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                <UsersIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Quản Lý Người Dùng
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base hidden sm:block">Theo dõi và quản lý tất cả người dùng trong hệ thống</p>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <UserPlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Thêm người dùng</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {!isLoading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-sm text-white/90">Tổng người dùng</div>
            </div>

            {/* Admins */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.admins}</div>
              <div className="text-sm text-gray-600">Quản trị viên</div>
            </div>

            {/* Regular Users */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.users}</div>
              <div className="text-sm text-gray-600">Người dùng</div>
            </div>

            {/* Active Today */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeToday}</div>
              <div className="text-sm text-gray-600">Hoạt động hôm nay</div>
            </div>
          </div>
        )}

        {/* Role Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-white/20">
          <div className="flex gap-2">
            {[
              { key: 'ALL', label: 'Tất cả', count: stats.total },
              { key: 'ADMIN', label: 'Quản trị viên', count: stats.admins },
              { key: 'USER', label: 'Người dùng', count: stats.users },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedRole(tab.key)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedRole === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm">{tab.label}</div>
                <div className="text-lg font-bold mt-1">{tab.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI User Insights */}
        {!isLoading && data && (
          <UserInsights
            users={filteredUsers}
            totalUsers={stats.total}
            newUsersThisMonth={stats.activeToday}
          />
        )}

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base"
              />
            </div>
            <button className="px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2 text-sm md:text-base">
              <FunnelIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && filteredUsers.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Người dùng</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Vai trò</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Hạng thành viên</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Điểm</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Ngày tham gia</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Trạng thái</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u: any) => {
                    const isActive = u?.settings?.active !== false;
                    return (
                    <tr key={u.id} className="hover:bg-purple-50/50 transition-colors group">
                      <td className="px-3 md:px-6 py-4">
                        <span className="font-mono font-bold text-sm text-purple-600">#{u.id}</span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          {u.avatarUrl ? (
                            <img 
                              src={u.avatarUrl} 
                              alt={u.name || u.email || 'User'} 
                              className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border-2 border-purple-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`bg-gradient-to-br from-purple-500 to-pink-500 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg ${u.avatarUrl ? 'hidden' : ''}`}
                          >
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{u.name || 'Chưa có tên'}</div>
                            <div className="text-xs md:text-sm text-gray-600 flex items-center gap-1 truncate">
                              <EnvelopeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        {editingUserId === u.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="border-2 border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button
                              onClick={() => handleSaveRole(u.id)}
                              className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                              title="Lưu"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                              title="Hủy"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditRole(u.id, u.role)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border hover:scale-105 transition-transform ${
                              u.role === 'ADMIN' 
                                ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {u.role === 'ADMIN' ? (
                              <ShieldCheckIcon className="h-3.5 w-3.5" />
                            ) : (
                              <UserCircleIcon className="h-3.5 w-3.5" />
                            )}
                            {u.role || 'USER'}
                            <PencilIcon className="h-3 w-3 ml-1" />
                          </button>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                        <button
                          onClick={() => handleEditLoyalty(u)}
                          className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-full border hover:scale-105 transition-transform ${getRankColor(u?.settings?.loyaltyRank || 'Bronze')} bg-gradient-to-r text-white border-transparent`}
                        >
                          <TrophyIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          {u?.settings?.loyaltyRank || 'Bronze'}
                        </button>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{(u?.loyalty?.points || 0).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                          <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 hidden sm:table-cell">
                        <button
                          onClick={() => handleToggleActive(u.id, isActive)}
                          className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-full border transition-colors ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                          title={isActive ? 'Đang hoạt động - bấm để tắt' : 'Đã tắt - bấm để bật'}
                        >
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="hidden md:inline">{isActive ? 'Hoạt động' : 'Đã tắt'}</span>
                        </button>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button 
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-1.5 md:p-2 rounded-lg transition-colors"
                            title="Xem chi tiết"
                            onClick={() => setViewUser(u)}
                          >
                            <EyeIcon className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 md:p-2 rounded-lg transition-colors"
                            title="Xóa người dùng"
                          >
                            <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-6 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Lỗi khi tải danh sách người dùng</h3>
            <p className="text-red-600 mb-4">
              {(error as any)?.response?.data?.message || (error as Error)?.message || 'Không thể tải dữ liệu'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Người dùng mới sẽ xuất hiện tại đây'}
            </p>
          </div>
        )}
      </div>
      {viewUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Chi tiết người dùng</h3>
              <button onClick={()=>setViewUser(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {viewUser.avatarUrl ? (
                  <img
                    src={viewUser.avatarUrl}
                    alt={viewUser.name || viewUser.email}
                    className="w-12 h-12 rounded-full object-cover border"
                    onError={(e)=>{ (e.currentTarget.style.display='none'); (document.getElementById('vu-initial') as HTMLElement)?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div id="vu-initial" className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold ${viewUser.avatarUrl ? '' : ''} ${viewUser.avatarUrl ? 'hidden' : ''}`}>
                  {(viewUser.name || viewUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{viewUser.name || 'Chưa có tên'}</div>
                  <div className="text-sm text-gray-600">{viewUser.email}</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">Email: <span className="font-semibold">{viewUser.email}</span></div>
              <div className="text-sm text-gray-700">Vai trò: <span className="font-semibold">{viewUser.role || 'USER'}</span></div>
              <div className="text-sm text-gray-700">Hạng thành viên: <span className={`font-semibold bg-gradient-to-r ${getRankColor(viewUser?.settings?.loyaltyRank || 'Bronze')} bg-clip-text text-transparent`}>{viewUser?.settings?.loyaltyRank || 'Bronze'}</span></div>
              <div className="text-sm text-gray-700">Điểm: <span className="font-semibold">{(viewUser?.loyalty?.points || 0).toLocaleString('vi-VN')} điểm</span></div>
              <div className="text-sm text-gray-700">Ngày tham gia: <span className="font-semibold">{viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString('vi-VN') : '-'}</span></div>
              <div className="text-sm text-gray-700">Trạng thái: <span className="font-semibold">{(viewUser.settings?.active !== false) ? 'Hoạt động' : 'Đã tắt'}</span></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setViewUser(null)} className="px-4 py-2 rounded-lg border">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Loyalty Modal */}
      {editingLoyalty && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditingLoyalty(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-amber-600" />
                Chỉnh sửa hạng thành viên
              </h3>
              <button onClick={()=>setEditingLoyalty(null)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hạng thành viên</label>
                <select
                  value={editingLoyalty.rank}
                  onChange={(e) => setEditingLoyalty({...editingLoyalty, rank: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm thưởng</label>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={editingLoyalty.points !== null && editingLoyalty.points !== undefined ? editingLoyalty.points : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? null : Number(value);
                    // Giới hạn tối đa 9999 khi nhập
                    if (numValue !== null && numValue > 9999) {
                      toast.error('Điểm thưởng không được vượt quá 9999');
                      setEditingLoyalty({...editingLoyalty, points: 9999});
                      return;
                    }
                    setEditingLoyalty({...editingLoyalty, points: numValue});
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Nhập số điểm (0-9999)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Vui lòng nhập số điểm thưởng cho người dùng (tối đa 9999 điểm)</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={()=>setEditingLoyalty(null)} 
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveLoyalty}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transition-colors font-semibold"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}