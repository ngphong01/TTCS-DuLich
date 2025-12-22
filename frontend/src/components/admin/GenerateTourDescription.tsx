import { useState } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface GenerateTourDescriptionProps {
  onGenerated: (description: string) => void;
  tourName?: string;
  days?: number;
  locations?: string[];
  price?: number;
  destination?: string;
  country?: string; // Thêm country để AI biết rõ hơn
}

export default function GenerateTourDescription({
  onGenerated,
  tourName = '',
  days,
  locations = [],
  price,
  destination,
  country,
}: GenerateTourDescriptionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!tourName.trim() && !destination?.trim()) {
      toast.error('Vui lòng nhập tên tour hoặc điểm đến trước');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/ai/generate-tour-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourName: tourName || destination,
          days,
          locations,
          price,
          destination: destination || tourName,
          country,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onGenerated(data.content);
        toast.success('Đã tạo mô tả tour thành công!');
      } else {
        throw new Error(data.message || 'Failed to generate description');
      }
    } catch (error: any) {
      console.error('Error generating tour description:', error);
      toast.error(error.message || 'Không thể tạo mô tả. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating || !tourName.trim()}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
    >
      {isGenerating ? (
        <>
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <span>Đang tạo...</span>
        </>
      ) : (
        <>
          <SparklesIcon className="h-5 w-5" />
          <span>Tạo mô tả bằng AI</span>
        </>
      )}
    </button>
  );
}

