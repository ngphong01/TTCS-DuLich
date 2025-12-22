# 🌍 Hệ thống Đa ngôn ngữ (i18n) cho TravelGo

## 📦 Cài đặt

```bash
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

## 🏗️ Cấu trúc

```
frontend/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── header.json
│       │   ├── tour.json
│       │   └── ...
│       ├── vi/
│       ├── fr/
│       └── ...
└── src/
    ├── i18n/
    │   ├── config.ts          # i18n configuration
    │   └── I18nProvider.tsx   # Provider component
    ├── hooks/
    │   └── useI18n.ts         # Custom hook
    └── components/
        └── LanguageSwitcher.tsx
```

## 🚀 Sử dụng

### 1. Trong Component

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### 2. Với Namespace

```tsx
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation('header');
  
  return <nav>{t('home')}</nav>;
}
```

### 3. Đổi ngôn ngữ

```tsx
import { useI18n } from '../hooks/useI18n';

function MyComponent() {
  const { changeLanguage, language } = useI18n();
  
  return (
    <button onClick={() => changeLanguage('vi')}>
      Switch to Vietnamese
    </button>
  );
}
```

## 🌐 Ngôn ngữ được hỗ trợ

- 🇺🇸 English (en)
- 🇻🇳 Tiếng Việt (vi)
- 🇫🇷 Français (fr)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇨🇳 中文 (zh-CN)
- 🇹🇼 繁體中文 (zh-TW)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇹🇭 ไทย (th)

## 📝 Thêm ngôn ngữ mới

1. Tạo thư mục trong `public/locales/` (ví dụ: `public/locales/fr/`)
2. Copy các file JSON từ `en/` và dịch
3. Thêm vào `SUPPORTED_LANGUAGES` trong `src/i18n/config.ts`

## 🔍 Language Detection

Thứ tự ưu tiên:
1. URL parameter (`?lang=vi`)
2. User setting (localStorage: `travelgo:language`)
3. Cookie
4. Browser language (`navigator.language`)
5. Fallback: `en`

## 🎯 Best Practices

1. **Chia theo domain**: `common.json`, `tour.json`, `booking.json`...
2. **Dùng namespace**: `t('common:welcome')` hoặc `t('welcome', { ns: 'common' })`
3. **Interpolation**: `t('fromPrice', { price: '$100' })`
4. **Pluralization**: `t('days', { count: 5 })` → "5 days"

## 🔗 URL Routing (Tùy chọn)

Để hỗ trợ URL-based routing (`/en/tours`, `/vi/tours`):

1. Cập nhật React Router để parse language từ URL
2. Sử dụng `changeLanguage()` trong `useI18n` hook (đã tự động update URL)

## 📊 Database

Thêm cột `language` vào bảng `User`:

```sql
ALTER TABLE User ADD COLUMN language VARCHAR(10) DEFAULT 'en';
```

## 🔌 API

API endpoints nên hỗ trợ `lang` parameter:

```http
GET /api/tours?lang=vi
GET /api/destinations?lang=fr
```

