"use client";
import { useState, useRef } from "react";
import { useSimpleAuth } from "@/lib/use-simple-auth";
import { useRouter } from "next/navigation";
import { PhotoIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AvatarPage() {
  const { data: session } = useSimpleAuth();
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined avatar options
  const avatarOptions = [
    { id: "avatar1", emoji: "😊", name: "Happy" },
    { id: "avatar2", emoji: "😎", name: "Cool" },
    { id: "avatar3", emoji: "🤔", name: "Thinking" },
    { id: "avatar4", emoji: "😍", name: "Love" },
    { id: "avatar5", emoji: "🥳", name: "Party" },
    { id: "avatar6", emoji: "🤩", name: "Star" },
    { id: "avatar7", emoji: "😇", name: "Angel" },
    { id: "avatar8", emoji: "🧐", name: "Detective" },
    { id: "avatar9", emoji: "🤗", name: "Hug" },
    { id: "avatar10", emoji: "😌", name: "Peaceful" },
    { id: "avatar11", emoji: "🤓", name: "Nerd" },
    { id: "avatar12", emoji: "😋", name: "Yummy" },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      // Update session directly - no database calls
      await update({ 
        image: base64 
      });
        
        setSuccess(true);
        setIsUploading(false);
        setTimeout(() => setSuccess(false), 3000);
        // Force refresh the page to update all avatars
        setTimeout(() => router.refresh(), 1000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Có lỗi xảy ra khi tải lên ảnh');
      setIsUploading(false);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    setSelectedAvatar(emoji);
    setIsUploading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update session directly - no database calls
      await update({ 
        image: emoji 
      });
      
      setSuccess(true);
      setIsUploading(false);
      setTimeout(() => setSuccess(false), 3000);
      // Force refresh the page to update all avatars
      setTimeout(() => router.refresh(), 1000);
    } catch (error) {
      setUploadError('Có lỗi xảy ra khi cập nhật avatar');
      setIsUploading(false);
    }
  };

  // Get current avatar - prioritize session image, fallback to initial
  const currentAvatar = session?.user?.image || (session?.user?.name || session?.user?.email || "U").slice(0, 1).toUpperCase();
  
  // Check if current avatar is an emoji (single character and not a letter)
  const isEmojiAvatar = session?.user?.image && session.user.image.length === 1 && !/[A-Za-z0-9]/.test(session.user.image);
  
  // Check if current avatar is a base64 image (starts with data:)
  // Only treat as image if it's a data URL or HTTP URL, not just a single character
  const isImageAvatar = session?.user?.image && 
    (session.user.image.startsWith('data:') || 
     session.user.image.startsWith('http')) &&
    session.user.image.length > 10; // Ensure it's not just a single character

  return (
    <main className="container">
      <div className="mt-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đổi Avatar</h1>
          <p className="text-gray-700 mt-2">
            Cập nhật ảnh đại diện của bạn để mọi người dễ nhận biết
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Current Avatar */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Ảnh đại diện hiện tại</h2>
            <div className="flex items-center gap-4">
              {isImageAvatar ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={session?.user?.image || ""} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-2xl flex items-center justify-center text-gray-700 font-bold text-2xl shadow-lg">
                  {currentAvatar}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {session?.user?.name || session?.user?.email?.split('@')[0] || "User"}
                </h3>
                <p className="text-sm text-gray-700">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Upload New Avatar */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Tải lên ảnh mới</h2>
            
            {/* Upload Button */}
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50"
              >
                <PhotoIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {isUploading ? "Đang tải lên..." : "Chọn ảnh từ máy tính"}
                </span>
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
              </p>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <XMarkIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">{uploadError}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Cập nhật avatar thành công!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emoji Avatars */}
        <div className="mt-8 card p-6">
          <h2 className="text-xl font-semibold mb-4">Hoặc chọn emoji</h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleEmojiSelect(avatar.emoji)}
                disabled={isUploading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-all duration-150 ${
                  selectedAvatar === avatar.emoji
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                } disabled:opacity-50`}
                title={avatar.name}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 mb-2">
            💡 Mẹo chọn avatar
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Chọn ảnh rõ nét, có độ phân giải cao</li>
            <li>• Ảnh vuông sẽ hiển thị tốt nhất</li>
            <li>• Tránh ảnh có nội dung không phù hợp</li>
            <li>• Emoji là lựa chọn nhanh và thú vị</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="mt-8 card p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔧 Debug Info
          </h3>
          <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <p>Session Image: {session?.user?.image ? "Set" : "null"}</p>
            <p>Is Emoji: {isEmojiAvatar ? "Yes" : "No"}</p>
            <p>Is Image: {isImageAvatar ? "Yes" : "No"}</p>
            <p>Current Avatar: {currentAvatar}</p>
            <p>Session User: {JSON.stringify(session?.user, null, 2)}</p>
          </div>
          <button
            onClick={() => {
              router.refresh();
              window.location.reload();
            }}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            Force Refresh Page
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay lại tài khoản
          </a>
        </div>
      </div>
    </main>
  );
}
