import { useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SmartSearchProps {
  onSearch: (filter: any) => void;
  placeholder?: string;
}

export default function SmartSearch({ onSearch, placeholder = 'Tìm kiếm thông minh...' }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Vui lòng nhập câu hỏi tìm kiếm');
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('tg_token');
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSearch(data.filter);
        toast.success(`Đã tìm thấy: ${data.filter.explanation || 'Kết quả tìm kiếm'}`);
      } else {
        throw new Error(data.message || 'Failed to process search');
      }
    } catch (error: any) {
      console.error('Error in smart search:', error);
      toast.error(error.message || 'Không thể xử lý tìm kiếm. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSearching}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isSearching ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Đang tìm...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              <span>Tìm kiếm AI</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Ví dụ: "Tìm tour Đà Lạt 3 ngày dưới 3 triệu" hoặc "Tour chưa xác nhận ở Hà Nội"
      </p>
    </div>
  );
}

