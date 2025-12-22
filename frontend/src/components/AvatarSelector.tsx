// frontend/src/components/AvatarSelector.tsx
import { useState, useEffect } from 'react';

interface AvatarSelectorProps {
  userId: number;
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string) => void;
}

export default function AvatarSelector({ userId, currentAvatar, onAvatarChange }: AvatarSelectorProps) {
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [showOptions, setShowOptions] = useState(false);

  // Lấy danh sách avatar options
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
        setShowOptions(true);
      }
    } catch (error) {
      console.error('❌ Error fetching avatar options:', error);
      alert('Không thể tải danh sách avatar. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật avatar đã chọn
  const updateAvatar = async (avatarUrl: string) => {
    setLoading(true);
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
      setShowOptions(false);
      alert('✅ Cập nhật avatar thành công!');
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      alert('Không thể cập nhật avatar. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Tạo avatar ngẫu nhiên mới
  const generateNewAvatar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${userId}/avatar/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tg_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      if (data.avatarUrl) {
        setSelectedAvatar(data.avatarUrl);
        if (onAvatarChange) {
          onAvatarChange(data.avatarUrl);
        }
        alert('✅ Tạo avatar mới thành công!');
      }
    } catch (error) {
      console.error('❌ Error generating avatar:', error);
      alert('Không thể tạo avatar mới. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-selector bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🎨 <span>Avatar của bạn</span>
      </h3>
      
      {/* Avatar hiện tại */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <img 
            src={selectedAvatar || '/default-avatar.png'} 
            alt="Current Avatar" 
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
          />
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={generateNewAvatar}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            🎲 <span>Tạo Avatar Ngẫu Nhiên</span>
          </button>

          <button 
            onClick={fetchAvatarOptions}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            🎨 <span>Chọn Avatar</span>
          </button>
        </div>
      </div>

      {/* Danh sách avatar options */}
      {showOptions && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700">Chọn một avatar bạn thích:</h4>
            <button 
              onClick={() => setShowOptions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {avatarOptions.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {avatarOptions.map((avatarUrl, index) => (
                <div 
                  key={index}
                  onClick={() => !loading && updateAvatar(avatarUrl)}
                  className={`
                    cursor-pointer rounded-lg p-2 transition-all
                    ${selectedAvatar === avatarUrl 
                      ? 'ring-4 ring-blue-500 bg-blue-50' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:bg-gray-50'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar option ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                  {selectedAvatar === avatarUrl && (
                    <div className="text-center mt-1 text-xs text-blue-600 font-semibold">
                      ✓ Đang dùng
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Đang tải avatar...</p>
                </>
              ) : (
                <p>Không có avatar nào</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

