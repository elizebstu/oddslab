import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

const SITE_NAME = 'Oddslab';
const DEFAULT_DESCRIPTION = '追踪 Polymarket 智能钱地址的实时交易动态和持仓数据。发现顶级交易者策略，复制成功投资组合。';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://oddslab.com';

export default function SEOHead({ title, description, image, type = 'website' }: SEOHeadProps) {
  const location = useLocation();

  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={`${SITE_URL}${metaImage}`} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${SITE_URL}${metaImage}`} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
