import { useState } from 'react';
import { ClipboardDocumentListIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BookingInsightsProps {
  bookings: any[];
  totalRevenue?: number;
  pendingCount?: number;
  confirmedCount?: number;
  totalBookings?: number;
}

export default function BookingInsights({
  bookings,
  totalRevenue = 0,
  pendingCount = 0,
  confirmedCount = 0,
  totalBookings = 0,
}: BookingInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('tg_token');
      
      // Tính toán thống kê
      const stats = {
        total: totalBookings || bookings.length,
        pending: pendingCount,
        confirmed: confirmedCount,
        revenue: totalRevenue,
        popularDestinations: bookings
          .reduce((acc: any, booking: any) => {
            const dest = booking.destination?.name || 'Unknown';
            acc[dest] = (acc[dest] || 0) + 1;
            return acc;
          }, {}),
      };

      const response = await fetch('/api/ai/analyze-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stats),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInsights(data.analysis);
        setShowInsights(true);
        toast.success('Phân tích booking hoàn tất!');
      } else {
        throw new Error(data.message || 'Failed to analyze bookings');
      }
    } catch (error: any) {
      console.error('Error analyzing bookings:', error);
      toast.error(error.message || 'Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-lg">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích Booking AI</h3>
            <p className="text-sm text-gray-600">Insights thông minh về đơn đặt chỗ</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || bookings.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Đang phân tích...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              <span>Phân tích AI</span>
            </>
          )}
        </button>
      </div>

      {showInsights && insights && (
        <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: insights
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
                .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>'),
            }}
          />
        </div>
      )}
    </div>
  );
}

