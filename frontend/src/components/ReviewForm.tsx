import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  StarIcon,
  PhotoIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ReviewFormProps {
  destinationSlug: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ destinationSlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [author, setAuthor] = useState('');

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { slug: string; rating: number; comment: string; images?: string[]; author?: string }) => {
      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Đánh giá của bạn đã được gửi thành công!');
      setRating(5);
      setComment('');
      setImages([]);
      setAuthor('');
      queryClient.invalidateQueries({ queryKey: ['reviews', destinationSlug] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).slice(0, 5 - images.length).map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'review');

        const token = localStorage.getItem('tg_token');
        const response = await fetch('/api/upload/review', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error('Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập đánh giá');
      return;
    }
    submitMutation.mutate({
      slug: destinationSlug,
      rating,
      comment,
      images: images.length > 0 ? images : undefined,
      author: author || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Viết đánh giá</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Đánh giá của bạn</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              {star <= rating ? (
                <StarIconSolid className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarIcon className="h-8 w-8 text-gray-300" />
              )}
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-gray-700">{rating}/5</span>
        </div>
      </div>

      {/* Author (for guest users) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên của bạn (tùy chọn)</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Nhập tên của bạn"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Đánh giá chi tiết</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Chia sẻ trải nghiệm của bạn về điểm đến này..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh (tối đa 5 ảnh)</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Review ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {uploading && (
          <p className="text-sm text-gray-500 mt-2">Đang upload ảnh...</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitMutation.isPending || !comment.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {submitMutation.isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Đang gửi...
          </>
        ) : (
          <>
            <PaperAirplaneIcon className="h-5 w-5" />
            Gửi đánh giá
          </>
        )}
      </button>
    </form>
  );
}

