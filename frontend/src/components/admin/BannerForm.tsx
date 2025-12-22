import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const urlRegex = /^https?:\/\/.+/;
const schema = z.object({
  name: z.string().min(3, 'Tên banner phải có ít nhất 3 ký tự'),
  imageUrl: z.string().refine((val) => urlRegex.test(val), { message: 'URL ảnh không hợp lệ' }),
  linkUrl: z.string().refine((val) => !val || urlRegex.test(val), { message: 'URL không hợp lệ' }).optional(),
  description: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BannerFormProps {
  banner?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BannerForm({ banner, onClose, onSuccess }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const isEditing = !!banner;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: banner
      ? {
          name: banner.name,
          imageUrl: banner.imageUrl || '',
          linkUrl: banner.linkUrl || '',
          description: banner.description || '',
          position: banner.position || 'HOME_HERO',
          isActive: banner.isActive !== undefined ? banner.isActive : true,
          startDate: banner.startDate
            ? new Date(banner.startDate).toISOString().split('T')[0]
            : '',
          endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        }
      : {
          name: '',
          imageUrl: '',
          linkUrl: '',
          description: '',
          position: 'HOME_HERO',
          isActive: true,
          startDate: '',
          endDate: '',
        },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'banner');

      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/upload/banner', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setValue('imageUrl', data.url);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error('Lỗi upload ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('tg_token');
      const url = isEditing ? `/api/banner/${banner.id}` : '/api/banner';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...data,
        linkUrl: data.linkUrl || null,
        description: data.description || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }

      toast.success(isEditing ? 'Cập nhật banner thành công!' : 'Tạo banner thành công!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa banner' : 'Tạo banner mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên banner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Tên banner..."
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL ảnh <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                {...register('imageUrl')}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="URL ảnh hoặc upload..."
              />
              <label className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all cursor-pointer flex items-center gap-2">
                <PhotoIcon className="h-5 w-5" />
                {uploadingImage ? 'Đang upload...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-red-600 mt-1">{errors.imageUrl.message}</p>
            )}
            {watch('imageUrl') && (
              <img
                src={watch('imageUrl')}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL liên kết</label>
            <input
              type="text"
              {...register('linkUrl')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="https://..."
            />
            {errors.linkUrl && (
              <p className="text-xs text-red-600 mt-1">{errors.linkUrl.message as string}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Mô tả banner..."
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
            <select
              {...register('position')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="HOME_HERO">Home Hero</option>
              <option value="DESTINATION_PAGE">Trang Điểm Đến</option>
              <option value="TOUR_PAGE">Trang Tour</option>
              <option value="BLOG_PAGE">Trang Blog</option>
              <option value="SIDEBAR">Sidebar</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-semibold text-gray-700">Kích hoạt ngay</label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

