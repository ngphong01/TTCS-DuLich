// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// 🔥 CRITICAL: Lưu current language để interceptor có thể đọc ngay lập tức
let currentLanguage = 'en';

// Lắng nghe languageChanged event để update currentLanguage ngay lập tức
if (typeof window !== 'undefined') {
  // Load initial language
  currentLanguage = localStorage.getItem('travelgo:language') || 
                    localStorage.getItem('language') || 
                    'en';
  
  // Listen for language changes
  window.addEventListener('languageChanged', ((event: CustomEvent) => {
    currentLanguage = event.detail || 'en';
  }) as EventListener);
}

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('tg_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 🔥 CRITICAL: Tự động thêm lang parameter vào tất cả API calls
  // Đọc từ biến currentLanguage (được update ngay lập tức khi language thay đổi)
  const lang = currentLanguage || 
               localStorage.getItem('travelgo:language') || 
               localStorage.getItem('language') || 
               'en';
  
  // Thêm lang vào query params (không override nếu đã có)
  if (config.params) {
    config.params.lang = config.params.lang || lang;
  } else {
    config.params = { lang };
  }
  
  console.log('📤 API Request:', config.method?.toUpperCase(), config.url, config.params, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;