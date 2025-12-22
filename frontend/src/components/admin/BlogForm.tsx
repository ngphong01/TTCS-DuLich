import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  slug: z.string().min(3, 'Slug phải có ít nhất 3 ký tự'),
  excerpt: z.string().optional(),
  content: z.string().min(50, 'Nội dung phải có ít nhất 50 ký tự'),
  featuredImage: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface BlogFormProps {
  blog?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlogForm({ blog, onClose, onSuccess }: BlogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const isEditing = !!blog;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: blog
      ? {
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          featuredImage: blog.featuredImage || '',
          author: blog.author || 'TravelGo Team',
          category: blog.category || '',
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
          seoTitle: blog.seoTitle || '',
          seoDescription: blog.seoDescription || '',
          seoKeywords: blog.seoKeywords || '',
          published: blog.published || false,
        }
      : {
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          featuredImage: '',
          author: 'TravelGo Team',
          category: '',
          tags: '',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          published: false,
        },
  });

  // Auto-generate slug from title
  const title = watch('title');
  useEffect(() => {
    if (!isEditing && title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, isEditing, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'blog');

      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/upload/blog', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setValue('featuredImage', data.url);
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
      const url = isEditing ? `/api/blog/admin/${blog.id}` : '/api/blog/admin';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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

      toast.success(isEditing ? 'Cập nhật blog thành công!' : 'Tạo blog thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa blog' : 'Tạo blog mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Tiêu đề bài viết..."
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('slug')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all lowercase"
                placeholder="url-friendly-slug"
                disabled={isEditing}
              />
              {errors.slug && (
                <p className="text-xs text-red-600 mt-1">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tóm tắt</label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Mô tả ngắn về bài viết..."
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện</label>
            <div className="flex gap-4">
              <input
                type="text"
                {...register('featuredImage')}
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
            {watch('featuredImage') && (
              <img
                src={watch('featuredImage')}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-xl"
              />
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content')}
              rows={15}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
              placeholder="Viết nội dung bài viết ở đây..."
            />
            {errors.content && (
              <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Author, Category, Tags */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tác giả</label>
              <input
                type="text"
                {...register('author')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="TravelGo Team"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
              <select
                {...register('category')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Chọn danh mục</option>
                <option value="Travel Tips">Travel Tips</option>
                <option value="Destinations">Destinations</option>
                <option value="Reviews">Reviews</option>
                <option value="News">News</option>
                <option value="Guides">Guides</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                {...register('tags')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  {...register('seoTitle')}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Description</label>
                <textarea
                  {...register('seoDescription')}
                  rows={2}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="SEO meta description"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Keywords</label>
                <input
                  type="text"
                  {...register('seoKeywords')}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('published')}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-semibold text-gray-700">Xuất bản ngay</label>
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
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

