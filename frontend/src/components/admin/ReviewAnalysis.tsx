import { useState } from 'react';
import { StarIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ReviewAnalysisProps {
  reviews: any[];
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewAnalysis({
  reviews,
  averageRating = 0,
  totalReviews = 0,
}: ReviewAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('tg_token');
      
      // Tính toán sentiment và keywords
      const stats = {
        total: totalReviews,
        averageRating,
        reviews: reviews.slice(0, 20).map((r: any) => ({
          rating: r.rating,
          comment: r.comment || '',
          destination: r.destination?.name || 'Unknown',
        })),
      };

      const response = await fetch('/api/ai/analyze-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stats),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysis(data.analysis);
        setShowAnalysis(true);
        toast.success('Phân tích đánh giá hoàn tất!');
      } else {
        throw new Error(data.message || 'Failed to analyze reviews');
      }
    } catch (error: any) {
      console.error('Error analyzing reviews:', error);
      toast.error(error.message || 'Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-lg">
            <StarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích Đánh giá AI</h3>
            <p className="text-sm text-gray-600">Sentiment analysis & insights</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || reviews.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
        <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
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

