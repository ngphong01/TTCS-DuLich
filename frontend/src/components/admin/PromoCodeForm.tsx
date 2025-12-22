import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  code: z.string().min(3, 'Mã phải có ít nhất 3 ký tự').max(20, 'Mã tối đa 20 ký tự'),
  description: z.string().optional(),
  discountType: z.string().refine((val) => val === 'PERCENTAGE' || val === 'FIXED', {
    message: 'Loại giảm giá phải là PERCENTAGE hoặc FIXED'
  }),
  discountValue: z.number().min(1, 'Giá trị giảm giá phải > 0'),
  minAmount: z.number().min(0, 'Đơn tối thiểu phải >= 0').optional(),
  maxDiscount: z.number().min(0, 'Giảm tối đa phải >= 0').optional(),
  usageLimit: z.number().min(1, 'Giới hạn sử dụng phải >= 1').optional(),
  validFrom: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  validUntil: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface PromoCodeFormProps {
  promoCode?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromoCodeForm({ promoCode, onClose, onSuccess }: PromoCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!promoCode;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: promoCode
      ? {
          code: promoCode.code,
          description: promoCode.description || '',
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          minAmount: promoCode.minAmount || 0,
          maxDiscount: promoCode.maxDiscount || undefined,
          usageLimit: promoCode.usageLimit || undefined,
          validFrom: promoCode.validFrom ? new Date(promoCode.validFrom).toISOString().split('T')[0] : '',
          validUntil: promoCode.validUntil ? new Date(promoCode.validUntil).toISOString().split('T')[0] : '',
          active: promoCode.active !== undefined ? promoCode.active : true,
        }
      : {
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minAmount: 0,
          maxDiscount: undefined,
          usageLimit: undefined,
          validFrom: '',
          validUntil: '',
          active: true,
        },
  });

  const discountType = watch('discountType');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('tg_token');
      const url = isEditing ? `/api/promo/admin/${promoCode.id}` : '/api/promo/admin';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          applicableTo: ['ALL'], // Default to all
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }

      toast.success(isEditing ? 'Cập nhật mã giảm giá thành công!' : 'Tạo mã giảm giá thành công!');
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
              placeholder="VD: WELCOME10"
              disabled={isEditing}
            />
            {errors.code && (
              <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Mô tả mã giảm giá..."
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                {...register('discountType')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá trị giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('discountValue', { valueAsNumber: true })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={discountType === 'PERCENTAGE' ? '10' : '100000'}
                min={1}
              />
              {errors.discountValue && (
                <p className="text-xs text-red-600 mt-1">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          {/* Max Discount (only for percentage) */}
          {discountType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giảm tối đa (VNĐ) <span className="text-gray-500 text-xs">(Tùy chọn)</span>
              </label>
              <input
                type="number"
                {...register('maxDiscount', { valueAsNumber: true })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="VD: 500000"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                Giới hạn số tiền giảm tối đa (ví dụ: 10% nhưng không quá 500,000 VNĐ)
              </p>
            </div>
          )}

          {/* Min Amount & Usage Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                {...register('minAmount', { valueAsNumber: true })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                {...register('usageLimit', { valueAsNumber: true })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Không giới hạn"
                min={1}
              />
              <p className="text-xs text-gray-500 mt-1">Để trống = không giới hạn</p>
            </div>
          </div>

          {/* Valid From & Until */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('validFrom')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.validFrom && (
                <p className="text-xs text-red-600 mt-1">{errors.validFrom.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('validUntil')}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {errors.validUntil && (
                <p className="text-xs text-red-600 mt-1">{errors.validUntil.message}</p>
              )}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('active')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

