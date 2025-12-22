import { useState } from 'react';
import { CurrencyDollarIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PaymentInsightsProps {
  payments: any[];
  totalRevenue?: number;
  successfulPayments?: number;
  failedPayments?: number;
}

export default function PaymentInsights({
  payments,
  totalRevenue = 0,
  successfulPayments = 0,
  failedPayments = 0,
}: PaymentInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('tg_token');
      
      // Tính toán thống kê payment
      const stats = {
        total: payments.length,
        revenue: totalRevenue,
        successful: successfulPayments,
        failed: failedPayments,
        successRate: payments.length > 0 ? (successfulPayments / payments.length) * 100 : 0,
        payments: payments.slice(0, 30).map((p: any) => ({
          amount: p.amount,
          status: p.status,
          method: p.method || 'Unknown',
          createdAt: p.createdAt,
        })),
      };

      const response = await fetch('/api/ai/analyze-payments', {
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
        toast.success('Phân tích thanh toán hoàn tất!');
      } else {
        throw new Error(data.message || 'Failed to analyze payments');
      }
    } catch (error: any) {
      console.error('Error analyzing payments:', error);
      toast.error(error.message || 'Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích Thanh toán AI</h3>
            <p className="text-sm text-gray-600">Payment trends & insights</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || payments.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
        <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
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

