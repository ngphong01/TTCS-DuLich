import { useState } from 'react';
import { TicketIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

export default function PromoCodeInput({
  onApply,
  onRemove,
  appliedCode,
  appliedDiscount = 0,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsValidating(true);
    setIsValid(null);
    setValidationMessage('');

    try {
      const response = await fetch(`/api/promo/validate/${code.trim()}`);
      const data = await response.json();

      if (data.valid) {
        setIsValid(true);
        setValidationMessage(`Giảm ${data.discountAmount.toLocaleString('vi-VN')} VNĐ`);
        onApply(code.trim().toUpperCase(), data.discountAmount);
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        setIsValid(false);
        setValidationMessage(data.message || 'Mã giảm giá không hợp lệ');
        toast.error(data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage('Lỗi xác thực mã giảm giá');
      toast.error('Lỗi xác thực mã giảm giá');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setIsValid(null);
    setValidationMessage('');
    onRemove();
    toast.success('Đã xóa mã giảm giá');
  };

  if (appliedCode) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-green-800">Mã giảm giá đã áp dụng</div>
              <div className="text-sm text-green-600">{appliedCode}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-green-600">Giảm giá</div>
              <div className="font-bold text-green-800">
                -{appliedDiscount.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-green-200 rounded-lg transition-colors"
              title="Xóa mã giảm giá"
            >
              <XCircleIcon className="h-5 w-5 text-green-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <TicketIcon className="h-5 w-5 text-blue-500" />
        Mã giảm giá / Voucher
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setIsValid(null);
            setValidationMessage('');
          }}
          placeholder="Nhập mã giảm giá"
          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
          disabled={isValidating}
        />
        <button
          onClick={handleValidate}
          disabled={isValidating || !code.trim()}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <>
              <TicketIcon className="h-5 w-5" />
              <span>Áp dụng</span>
            </>
          )}
        </button>
      </div>
      {validationMessage && (
        <div
          className={`mt-2 text-sm flex items-center gap-2 ${
            isValid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isValid ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <XCircleIcon className="h-4 w-4" />
          )}
          {validationMessage}
        </div>
      )}
    </div>
  );
}

