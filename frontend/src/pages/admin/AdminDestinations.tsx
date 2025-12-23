import { useMemo, useState } from 'react';
import Table from '../../components/Table';
import Skeleton from '../../components/Skeleton';
import { createDestination, deleteDestination, getDestinationsPaged, updateDestination } from '../../services/destination';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import GenerateTourDescription from '../../components/admin/GenerateTourDescription';
import SmartSearch from '../../components/admin/SmartSearch';

const schema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isNaN(num) ? undefined : num;
    },
    z.number().min(0, 'Giá phải >= 0').optional()
  ),
  country: z.string().optional(),
});

type FormData = {
  name: string;
  slug: string;
  description?: string;
  featured?: boolean;
  price?: number;
  country?: string;
};
type PageResult<T = any> = { items: T[]; total: number; page: number; pageSize: number };

export default function AdminDestinations() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'normal' | 'ai'>('normal');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<PageResult>({
    queryKey: ['admin', 'destinations', page, pageSize],
    queryFn: () => getDestinationsPaged(page, pageSize),
    placeholderData: keepPreviousData,
  });

  const total = data?.total || 0;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { name: '', slug: '', description: '', featured: false, price: 0, country: 'Việt Nam' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/upload/destination', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể upload ảnh');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  async function onCreate(values: FormData) {
    try {
      // Validate với schema
      const validated = schema.parse(values);
      
      let imageUrl = null;
      
      // Upload image first if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error('Không thể upload ảnh. Vui lòng thử lại.');
          return; // Stop if upload failed
        }
        console.log('✅ Image uploaded, URL:', imageUrl);
      }

      // Create destination with image URL
      const payload = { ...validated, image: imageUrl };
      console.log('📤 Creating destination with payload:', payload);
      const created = await createDestination(payload);
      console.log('✅ Destination created:', created);
      toast.success('Điểm đến đã được tạo thành công!');
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);
      // Invalidate tất cả queries liên quan đến destinations và refetch
      await queryClient.invalidateQueries({ queryKey: ['destinations'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'destinations'] });
      // Reset về page 1 để hiển thị destination mới
      setPage(1);
      // Refetch để cập nhật danh sách
      await refetch();
    } catch (err: any) {
      console.error('❌ Error creating destination:', err);
      if (err?.errors) {
        // Zod validation errors
        toast.error(err.errors[0]?.message || 'Dữ liệu không hợp lệ');
      } else {
        toast.error(err?.response?.data?.message || 'Không thể tạo điểm đến');
      }
    }
  }

  async function onUpdate(id: number, patch: Partial<FormData>) {
    try {
      await updateDestination(id, patch);
      toast.success('Đã cập nhật thành công!');
      // Invalidate tất cả queries liên quan đến destinations và refetch
      await queryClient.invalidateQueries({ queryKey: ['destinations'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'destinations'] });
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa điểm đến này?')) return;
    try {
      await deleteDestination(id);
      toast.success('Đã xóa thành công!');
      // Invalidate tất cả queries liên quan đến destinations và refetch
      await queryClient.invalidateQueries({ queryKey: ['destinations'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'destinations'] });
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xóa thất bại');
    }
  }

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchTerm) return data.items;
    return data.items.filter((d: any) => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.items, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                <MapPinIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Quản Lý Điểm Đến
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base hidden sm:block">Tạo và quản lý các tour du lịch</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Thêm Điểm Đến</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {!isLoading && data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tổng điểm đến</p>
                  <p className="text-3xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tour nổi bật</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.items.filter((d: any) => d.featured).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl">
                  <StarIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tour thường</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.items.filter((d: any) => !d.featured).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl">
                  <MapPinIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
                Tạo Điểm Đến Mới
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreate)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
        <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên điểm đến *
                  </label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="VD: Vịnh Hạ Long"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <XMarkIcon className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
        </div>

        <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="VD: vinh-ha-long"
                    {...register('slug')}
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <XMarkIcon className="h-3 w-3" />
                      {errors.slug.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min={0}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="VD: 1500000"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <XMarkIcon className="h-3 w-3" />
                      {errors.price.message as any}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="VD: Việt Nam, Thái Lan, Nhật Bản..."
                    {...register('country')}
                  />
                  <p className="text-xs text-gray-500 mt-1">Để trống sẽ mặc định "Việt Nam"</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh điểm đến
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <div className="w-full max-h-64 overflow-hidden rounded-lg flex items-center justify-center bg-gray-100">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-w-full max-h-64 object-contain rounded-lg"
                              />
                            </div>
                            <p className="text-sm text-gray-600">Click để chọn ảnh khác</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <PlusIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                              {uploadingImage ? 'Đang upload...' : 'Click để chọn ảnh'}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Xóa ảnh đã chọn
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>
                  <GenerateTourDescription
                    onGenerated={(description) => {
                      // Set description value in form
                      const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                      if (textarea) {
                        textarea.value = description;
                        // Trigger form update
                        const event = new Event('input', { bubbles: true });
                        textarea.dispatchEvent(event);
                      }
                    }}
                    tourName={watch('name') || ''}
                    destination={watch('name') || ''}
                    price={watch('price') || undefined}
                    country={watch('country') || undefined}
                  />
                </div>
                <textarea
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows={4}
                  placeholder="Nhập mô tả về điểm đến..."
                  {...register('description')}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('featured')}
                  />
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    Đặt làm tour nổi bật
                  </span>
          </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  disabled={isSubmitting || uploadingImage}
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isSubmitting || uploadingImage) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      {uploadingImage ? 'Đang upload ảnh...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Tạo Điểm Đến
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setSelectedImage(null);
                    setImagePreview(null);
                    setShowCreateForm(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter - Improved UX */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border border-white/20">
          <div className="flex flex-col gap-4">
            {/* Search Mode Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchMode('normal')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  searchMode === 'normal'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Tìm kiếm thường
              </button>
              <button
                onClick={() => setSearchMode('ai')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  searchMode === 'ai'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <SparklesIcon className="h-4 w-4" />
                Tìm kiếm AI
              </button>
            </div>

            {/* Search Input - Changes based on mode */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                {searchMode === 'normal' ? (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên hoặc slug..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                ) : (
                  <SmartSearch
                    onSearch={(filter) => {
                      if (filter.filters?.name) {
                        setSearchTerm(filter.filters.name);
                      }
                      toast.success(`✨ ${filter.explanation || 'Đã áp dụng bộ lọc thông minh'}`);
                    }}
                    placeholder="VD: 'Tour Đà Lạt 3 ngày dưới 3 triệu' hoặc 'Điểm đến Châu Á'"
                  />
                )}
              </div>
              <button className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
      {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
            </div>
        </div>
      )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPinIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có điểm đến nào'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu thêm điểm đến mới cho tour của bạn'}
            </p>
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Ảnh</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tên điểm đến</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Slug</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Giá (VND)</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Nổi bật</th>
                    <th className="px-2 md:px-4 lg:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((d: any) => {
                      // Debug: Log image data
                      if (d.image && process.env.NODE_ENV === 'development') {
                        console.log(`🖼️ Destination #${d.id} (${d.name}) image:`, d.image);
                      }
                      return (
                      <tr key={d.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4">
                          <span className="font-mono font-bold text-xs md:text-sm text-blue-600">#{d.id}</span>
                        </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4 hidden sm:table-cell">
                          <div className="flex items-center justify-center relative">
                            {d.image ? (
                              <>
                                <img 
                                  src={d.image} 
                                  alt={d.name || 'Destination'} 
                                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-200 shadow-md"
                                  onError={(e) => {
                                    console.error(`❌ Failed to load image for destination #${d.id}:`, d.image);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.img-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                  onLoad={() => {
                                    if (process.env.NODE_ENV === 'development') {
                                      console.log(`✅ Image loaded successfully for destination #${d.id}`);
                                    }
                                  }}
                                />
                                <div 
                                  className="img-fallback w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md hidden"
                                >
                                  <MapPinIcon className="h-8 w-8" />
                                </div>
                              </>
                            ) : (
                              <div 
                                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                              >
                                <MapPinIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4">
                          <InlineEdit
                            value={d.name}
                            onSave={(v) => onUpdate(d.id, { name: v })}
                          />
                        </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4 hidden md:table-cell">
                          <InlineEdit
                            value={d.slug}
                            onSave={(v) => onUpdate(d.id, { slug: v })}
                          />
                </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4 hidden lg:table-cell">
                          <InlineEdit
                            value={(d.price ?? 0).toLocaleString('vi-VN')}
                            onSave={(v) => {
                              // Chấp nhận mọi định dạng: xóa toàn bộ ký tự không phải số
                              const cleanValue = v.toString().replace(/[^0-9]/g, '').trim();
                              const numValue = Number(cleanValue || '0');
                              if (!Number.isFinite(numValue) || numValue < 0) {
                                toast.error('Giá không hợp lệ');
                                return;
                              }
                              onUpdate(d.id, { price: numValue });
                            }}
                          />
                        </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4 hidden md:table-cell">
                          <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!d.featured}
                    onChange={(e) => onUpdate(d.id, { featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                        </td>
                        <td className="px-2 md:px-4 lg:px-6 py-3 md:py-4">
                          <button
                            onClick={() => onDelete(d.id)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2"
                          >
                            <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Xóa</span>
                          </button>
                </td>
              </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-bold text-blue-600">{(page - 1) * pageSize + 1}</span> đến{' '}
                  <span className="font-bold text-blue-600">{Math.min(page * pageSize, total)}</span> trong tổng số{' '}
                  <span className="font-bold text-blue-600">{total}</span> điểm đến
                </div>
                <div className="flex gap-2">
            <button
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Trước
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                      let pageNum: number;
                      if (pageCount <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pageCount - 2) {
                        pageNum = pageCount - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                              : 'border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {pageNum}
            </button>
                      );
                    })}
                  </div>

            <button
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
              disabled={page >= pageCount}
            >
                    Sau
                    <ChevronRightIcon className="h-4 w-4" />
            </button>
                </div>
              </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return editing ? (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(val);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        className="border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
      />
      <button
        type="submit"
        className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
      >
        <CheckIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          setVal(value);
          setEditing(false);
        }}
        className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-colors"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </form>
  ) : (
    <button
      className="text-left w-full font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 group"
      onClick={() => setEditing(true)}
    >
      <span>{value}</span>
      <PencilIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
    </button>
  );
}