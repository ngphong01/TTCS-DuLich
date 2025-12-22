# 🌍 Hệ thống Đa ngôn ngữ (i18n) - TravelGo

## ✅ Đã triển khai

### 1. Cấu trúc i18n chuẩn
- ✅ Cài đặt i18next + react-i18next + language detector
- ✅ Cấu trúc thư mục `/public/locales/{lang}/{ns}.json`
- ✅ Chia theo domain: `common`, `header`, `tour`, `hotel`, `restaurant`, `booking`, `auth`, `admin`
- ✅ Hỗ trợ 10 ngôn ngữ: en, vi, fr, ja, ko, zh-CN, zh-TW, de, es, th

### 2. Language Detection (Thứ tự ưu tiên)
1. URL parameter (`?lang=vi`)
2. User setting (localStorage: `travelgo:language`)
3. Cookie
4. Browser language (`navigator.language`)
5. Fallback: `en`

### 3. Components
- ✅ `LanguageSwitcher.tsx` - UI đẹp với dropdown
- ✅ `useI18n` hook - Custom hook với type safety
- ✅ `I18nProvider` - Provider component

### 4. Database
- ✅ Thêm cột `language` vào bảng `User` (Prisma schema)
- ✅ Migration script: `scripts/add-language-column.js`
- ✅ SQL script: `database/add_language_column.sql`

## 📦 Cài đặt

```bash
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

## 🗄️ Database Migration

### Option 1: Dùng Prisma
```bash
npx prisma db push
```

### Option 2: Dùng SQL script
```bash
mysql -u root -p < database/add_language_column.sql
```

### Option 3: Dùng Node script
```bash
node scripts/add-language-column.js
```

## 🚀 Sử dụng

### Trong Component

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Đổi ngôn ngữ

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

## 📝 Thêm ngôn ngữ mới

1. Tạo thư mục: `public/locales/{lang}/`
2. Copy các file JSON từ `en/` và dịch
3. Thêm vào `SUPPORTED_LANGUAGES` trong `src/i18n/config.ts`

## 🔌 API Integration (TODO)

Cập nhật API endpoints để hỗ trợ `lang` parameter:

```javascript
// routes/tour.js
router.get('/', async (req, res) => {
  const lang = req.query.lang || 'en';
  // Return translated content based on lang
});
```

## 🌐 URL Routing (Tùy chọn)

Để hỗ trợ URL-based routing (`/en/tours`, `/vi/tours`):

1. Cập nhật React Router để parse language từ URL
2. Sử dụng `changeLanguage()` trong `useI18n` hook (đã tự động update URL)

## 📊 File Structure

```
frontend/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── header.json
│       │   └── tour.json
│       ├── vi/
│       └── ...
└── src/
    ├── i18n/
    │   ├── config.ts
    │   └── I18nProvider.tsx
    ├── hooks/
    │   └── useI18n.ts
    └── components/
        └── LanguageSwitcher.tsx
```

## 🎯 Next Steps

1. ✅ Cài đặt packages: `npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend`
2. ✅ Chạy database migration
3. ✅ Thêm translations cho các ngôn ngữ còn lại
4. ⏳ Cập nhật API để hỗ trợ `lang` parameter
5. ⏳ Thêm URL routing cho ngôn ngữ (nếu cần)

## 📚 Tài liệu tham khảo

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [BCP-47 Language Tags](https://en.wikipedia.org/wiki/IETF_language_tag)

