import { Helmet } from 'react-helmet-async';
import { CDN } from '@/lib/cdn';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string[];
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
    images?: string[];
    colors?: string[];
    sizes?: string[];
    material?: string;
    fit?: string;
    description?: string;
    sku?: string;
    rating?: number;
    reviewCount?: number;
  };
}

const SITE_NAME = "Slug's Era";
const BASE_URL = 'https://www.slugsera.com';
const DEFAULT_IMAGE = CDN.MODEL_HERO;
const DEFAULT_DESCRIPTION = "MOVEMENT. not merch. Slugsera is an Indian slow-fashion streetwear label creating heavyweight oversized T-shirts, printed shirts and hoodies for people who move at their own pace.";
const DEFAULT_KEYWORDS = [
  'Slugsera',
  "Slug's Era",
  'Indian streetwear',
  'oversized t-shirts India',
  'slow fashion clothing',
];

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  image = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  type = 'website',
  noindex = false,
  product,
}: SEOHeadProps) {
  const isBrandIncluded = title?.toLowerCase().includes('slugs') || title?.toLowerCase().includes('slugsera');
  const fullTitle = title 
    ? (isBrandIncluded ? title : `${title} | ${SITE_NAME} (Slugsera)`) 
    : `${SITE_NAME} (Slugsera) — Premium Slow Fashion Streetwear | MOVEMENT. not merch`;
  const fullUrl = url
    ? (url.startsWith('http') ? url : `${BASE_URL}${url}`)
    : BASE_URL;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const absoluteUrl = (value: string) => value.startsWith('http') ? value : `${BASE_URL}${value}`;
  const keywordContent = [...new Set([...DEFAULT_KEYWORDS, ...keywords])]
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .join(', ');

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordContent} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Product JSON-LD */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || description,
            image: product.images?.length
              ? product.images.map(absoluteUrl)
              : product.image ? absoluteUrl(product.image) : imageUrl,
            sku: product.sku || '',
            category: product.category,
            ...(product.colors?.length ? { color: product.colors.join(', ') } : {}),
            ...(product.sizes?.length ? { size: product.sizes.join(', ') } : {}),
            ...(product.material || product.fit ? {
              additionalProperty: [
                ...(product.material ? [{
                  '@type': 'PropertyValue',
                  name: 'Material',
                  value: product.material,
                }] : []),
                ...(product.fit ? [{
                  '@type': 'PropertyValue',
                  name: 'Fit',
                  value: product.fit,
                }] : []),
              ],
            } : {}),
            brand: {
              '@type': 'Brand',
              name: SITE_NAME,
            },
            offers: {
              '@type': 'Offer',
              url: fullUrl,
              priceCurrency: product.currency || 'INR',
              price: String(product.price),
              availability: `https://schema.org/${product.availability || 'InStock'}`,
              itemCondition: 'https://schema.org/NewCondition',
              seller: {
                '@type': 'Organization',
                name: SITE_NAME,
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: '0',
                  currency: 'INR',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'IN',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 2,
                    unitCode: 'DAY',
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 2,
                    maxValue: 7,
                    unitCode: 'DAY',
                  },
                },
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
