import { useState } from 'react';
import { UsersIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UserInsightsProps {
  users: any[];
  totalUsers?: number;
  newUsersThisMonth?: number;
}

export default function UserInsights({
  users,
  totalUsers = 0,
  newUsersThisMonth = 0,
}: UserInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('tg_token');
      
      // Tính toán thống kê user
      const stats = {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        users: users.slice(0, 50).map((u: any) => ({
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      };

      const response = await fetch('/api/ai/analyze-users', {
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
        toast.success('Phân tích người dùng hoàn tất!');
      } else {
        throw new Error(data.message || 'Failed to analyze users');
      }
    } catch (error: any) {
      console.error('Error analyzing users:', error);
      toast.error(error.message || 'Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích Người dùng AI</h3>
            <p className="text-sm text-gray-600">User behavior insights</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || users.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
        <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
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

