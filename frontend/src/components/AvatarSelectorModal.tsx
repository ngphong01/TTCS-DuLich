// frontend/src/components/AvatarSelectorModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string) => void;
}

export default function AvatarSelectorModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentAvatar,
  onAvatarChange 
}: AvatarSelectorModalProps) {
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [updating, setUpdating] = useState(false);

  // Lấy danh sách avatar options khi modal mở
  useEffect(() => {
    if (isOpen && avatarOptions.length === 0) {
      fetchAvatarOptions();
    }
  }, [isOpen]);

  const fetchAvatarOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${userId}/avatar/options`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tg_token')}`
        }
      });
      const data = await response.json();
      if (data.avatars) {
        setAvatarOptions(data.avatars);
      }
    } catch (error) {
      console.error('❌ Error fetching avatar options:', error);
      alert('Không thể tải danh sách avatar. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/user/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tg_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await response.json();
      setSelectedAvatar(avatarUrl);
      if (onAvatarChange) {
        onAvatarChange(avatarUrl);
      }
      
      // Trigger avatar-updated event
      window.dispatchEvent(new Event('avatar-updated'));
      
      // Close modal sau 500ms để user nhìn thấy kết quả
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      alert('Không thể cập nhật avatar. Vui lòng thử lại!');
    } finally {
      setUpdating(false);
    }
  };

  const generateNewAvatar = async () => {
    // 🔥 CRITICAL: Đảm bảo không bị disabled vô lý
    if (loading || updating) {
      console.warn('⚠️ Generate avatar: Already loading or updating');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🎨 Generating new avatar for user:', userId);
      const token = localStorage.getItem('tg_token');
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại!');
      }

      const response = await fetch(`/api/user/${userId}/avatar/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate avatar (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Avatar generated:', data);
      
      if (data.avatarUrl) {
        setSelectedAvatar(data.avatarUrl);
        if (onAvatarChange) {
          onAvatarChange(data.avatarUrl);
        }
        
        // Trigger avatar-updated event
        window.dispatchEvent(new Event('avatar-updated'));
        
        // Reload options để có avatar mới
        await fetchAvatarOptions();
      } else {
        throw new Error('Không nhận được avatar URL từ server');
      }
    } catch (error: any) {
      console.error('❌ Error generating avatar:', error);
      alert(`Không thể tạo avatar mới: ${error.message || 'Vui lòng thử lại!'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Chọn Avatar của bạn</h2>
              <p className="text-sm text-gray-600">Chọn một avatar bạn thích hoặc tạo ngẫu nhiên</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-white rounded-full"
            disabled={updating}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={generateNewAvatar}
              disabled={loading || updating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Tạo Avatar Ngẫu Nhiên</span>
            </button>

            <button 
              onClick={fetchAvatarOptions}
              disabled={loading || updating}
              className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Tải Lại</span>
            </button>
          </div>

          {/* Avatar Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải avatar...</p>
            </div>
          ) : avatarOptions.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {avatarOptions.map((avatarUrl, index) => (
                <div 
                  key={index}
                  onClick={() => !updating && updateAvatar(avatarUrl)}
                  className={`
                    relative cursor-pointer rounded-2xl p-3 transition-all duration-200
                    ${selectedAvatar === avatarUrl 
                      ? 'ring-4 ring-blue-500 bg-blue-50 shadow-lg scale-105' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:bg-gray-50 hover:scale-105'
                    }
                    ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar option ${index + 1}`}
                    className="w-full h-auto rounded-xl"
                  />
                  {selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 rounded-2xl">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ✓ Đang dùng
                      </div>
                    </div>
                  )}
                  {updating && selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-2xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Chưa có avatar nào</p>
              <p className="text-sm mt-2">Nhấn "Tạo Avatar Ngẫu Nhiên" để bắt đầu!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            💡 Mỗi lần tạo sẽ cho bạn một avatar độc đáo
          </p>
          <button 
            onClick={onClose}
            disabled={updating}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium disabled:opacity-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

