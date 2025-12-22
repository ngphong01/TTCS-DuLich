// components/SEOHead.tsx - SEO Head component with Schema.org markup
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any; // JSON-LD schema object
}

export default function SEOHead({
  title = 'TravelGo - Khám phá thế giới cùng chúng tôi',
  description = 'TravelGo - Công ty du lịch hàng đầu Việt Nam. Khám phá những điểm đến tuyệt vời trong và ngoài nước.',
  keywords = 'du lịch, tour, điểm đến, travel, vietnam travel',
  image = '/logo.png',
  url = window.location.href,
  type = 'website',
  schema,
}: SEOHeadProps) {
  const fullTitle = title.includes('TravelGo') ? title : `${title} | TravelGo`;
  const siteUrl = process.env.REACT_APP_SITE_URL || 'http://localhost:3001';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

