import { Helmet } from 'react-helmet-async';
import { CDN } from '@/lib/cdn';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  // Product-specific
  product?: {
    name: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    category?: string;
    image?: string;
    description?: string;
    sku?: string;
    rating?: number;
    reviewCount?: number;
  };
}

const SITE_NAME = "Slug's Era";
const BASE_URL = 'https://slugsera.com';
const DEFAULT_IMAGE = CDN.MODEL_HERO;
const DEFAULT_DESCRIPTION = "Shop oversized t-shirts, custom shirts & hoodies crafted for slow living. Premium 240 GSM cotton. Free shipping across India. MOVEMENT. not merch.";

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  product,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium Slow Fashion Streetwear | MOVEMENT. not merch`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${BASE_URL}${image}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${BASE_URL}${image}`} />

      {/* Product JSON-LD */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || description,
            image: product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : image,
            sku: product.sku || '',
            brand: {
              '@type': 'Brand',
              name: SITE_NAME,
            },
            offers: {
              '@type': 'Offer',
              url: fullUrl,
              priceCurrency: product.currency || 'INR',
              price: product.price,
              availability: `https://schema.org/${product.availability || 'InStock'}`,
              seller: {
                '@type': 'Organization',
                name: SITE_NAME,
              },
            },
            ...(product.rating && product.reviewCount ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            } : {}),
          })}
        </script>
      )}
    </Helmet>
  );
}
