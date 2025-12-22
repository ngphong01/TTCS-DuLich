import { useState } from 'react';
import { ChartBarIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface RevenueInsightsProps {
  revenue: number;
  growth?: number;
  bookings?: number;
  popularTours?: number;
  period?: string;
}

export default function RevenueInsights({
  revenue,
  growth,
  bookings,
  popularTours,
  period,
}: RevenueInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/ai/analyze-revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revenue,
          growth,
          bookings,
          popularTours,
          period,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysis(data.analysis);
        setShowAnalysis(true);
        toast.success('Phân tích doanh thu hoàn tất!');
      } else {
        throw new Error(data.message || 'Failed to analyze revenue');
      }
    } catch (error: any) {
      console.error('Error analyzing revenue:', error);
      toast.error(error.message || 'Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích Doanh thu AI</h3>
            <p className="text-sm text-gray-600">Insights thông minh từ AI</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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

      {showAnalysis && analysis && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: analysis
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

