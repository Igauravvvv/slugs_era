import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';

const COLLECTION_CATEGORY_ORDER = ['tshirts', 'shirts', 'hoodies', 'accessories'];
const COLLECTION_CATEGORY_LABELS: Record<string, string> = {
  tshirts: 'T-Shirts',
  shirts: 'Shirts',
  hoodies: 'Hoodies',
  accessories: 'Accessories',
};

const COLLECTION_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  tshirts: {
    title: 'Oversized T-Shirts in India | 240 GSM Graphic Tees',
    description: 'Shop heavyweight oversized T-shirts in India. Discover Slugsera 240 GSM cotton graphic tees with dropped shoulders, relaxed fits and original artwork.',
    keywords: ['oversized t-shirts Delhi', 'graphic t-shirts Noida', 'streetwear t-shirts Gurugram', 'heavyweight t-shirts India'],
  },
  shirts: {
    title: 'Printed Shirts in India | Relaxed Streetwear Shirts',
    description: 'Discover relaxed printed shirts by Slugsera, with expressive artwork, breathable fabrics and streetwear fits designed for Indian proportions.',
    keywords: ['printed shirts Delhi', 'streetwear shirts Noida', 'relaxed fit shirts Gurugram', 'Indian streetwear shirts'],
  },
  hoodies: {
    title: 'Oversized Hoodies in India | Heavyweight Streetwear',
    description: 'Shop Slugsera oversized hoodies in India. Explore heavyweight printed, embroidered and patchwork streetwear layers built for comfort and long wear.',
    keywords: ['hoodies Delhi', 'streetwear hoodies Noida', 'premium hoodies Gurugram', 'heavyweight hoodies India'],
  },
  accessories: {
    title: 'Streetwear Accessories',
    description: "Explore limited Slug's Era accessories designed to complete your slow-fashion streetwear rotation.",
    keywords: ['streetwear accessories India', 'Slugsera accessories'],
  },
};

const COLLECTION_COPY: Record<string, { heading: string; paragraphs: string[] }> = {
  tshirts: {
    heading: 'How Slugsera oversized T-shirts are built',
    paragraphs: ['Our heavyweight graphic tees use dense cotton and a pattern designed as oversized from the first cut—not a standard T-shirt made several sizes larger. Dropped shoulders, a wider chest and controlled body length create structure without unnecessary bulk.', 'Choose your usual size for the intended relaxed silhouette. Compare fabric weight in our GSM guide, then use the product measurements or FAQ when deciding between sizes.'],
  },
  shirts: {
    heading: 'Printed shirts for expressive everyday layering',
    paragraphs: ['Slugsera printed shirts combine breathable fabric, relaxed proportions and original artwork. Wear one buttoned with straight trousers or open over a heavyweight tee for a lighter Delhi NCR layer.', 'Each product page lists its material, fit and availability. Small-batch releases keep the collection focused and reduce unnecessary overproduction.'],
  },
  hoodies: {
    heading: 'Heavyweight hoodies made for repeat wear',
    paragraphs: ['Our oversized streetwear hoodies use substantial fleece and cotton blends to hold their shape through winter layering. Printed, embroidered and patchwork details are applied as part of the garment design rather than as disposable trend decoration.', 'Check the product page for exact GSM, fit, colour and size availability, and follow the garment-care guidance to protect artwork and texture.'],
  },
};

export default function Collections() {
  const { selectedCategory, selectedSubcategory, setCollectionFilter, products } = useStore();
  
  // Compute dynamic categories from actual products
  const availableCategories = Array.from(new Set(products.map(p => p.category)))
    .filter(Boolean)
    .sort((a, b) => {
      const aIndex = COLLECTION_CATEGORY_ORDER.indexOf(a);
      const bIndex = COLLECTION_CATEGORY_ORDER.indexOf(b);
      return (aIndex === -1 ? COLLECTION_CATEGORY_ORDER.length : aIndex)
        - (bIndex === -1 ? COLLECTION_CATEGORY_ORDER.length : bIndex);
    });
  
  const categoriesList = ['All', ...availableCategories.map(c => COLLECTION_CATEGORY_LABELS[c] || c)];

  const navigate = useNavigate();
  const { category: urlCategory } = useParams<{ category?: string }>();
  const categoryMap: Record<string, string> = {
    tshirts: 'tshirts',
    't-shirts': 'tshirts',
    shirts: 'shirts',
    hoodies: 'hoodies',
    accessories: 'accessories',
  };
  const seoCategory = urlCategory ? categoryMap[urlCategory.toLowerCase()] : selectedCategory;
  const seo = seoCategory ? COLLECTION_SEO[seoCategory] : undefined;
  const canonicalCategory = seoCategory === 'tshirts' ? 'tshirts' : seoCategory;

  // Sync URL param → Zustand store on mount or when URL changes
  useEffect(() => {
    if (urlCategory) {
      // Map user-friendly URL slugs to internal category names
      const mapped = categoryMap[urlCategory.toLowerCase()] || urlCategory.toLowerCase();
      if (mapped !== selectedCategory) {
        setCollectionFilter(mapped, null);
      }
    }
    // Don't clear the filter when URL has no category — let user keep their manual filter
    // unless they explicitly navigated to /collections (no param)
  }, [urlCategory]); // intentionally exclude selectedCategory to avoid loop

  // If the user navigates to /collections (without param) and there's a stale filter, clear it
  useEffect(() => {
    if (!urlCategory && selectedCategory) {
      // Only clear if the component mounted without a category param
      // (e.g., user clicked "All Collections" link)
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory, selectedSubcategory]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
    return true;
  }).sort((a, b) => {
    if (selectedCategory) return 0;
    return COLLECTION_CATEGORY_ORDER.indexOf(a.category) - COLLECTION_CATEGORY_ORDER.indexOf(b.category);
  });

  // Handle category filter click — also update the URL
  const handleCategoryFilter = (cat: string | null) => {
    setCollectionFilter(cat, null);
    if (cat) {
      navigate(`/collections/${cat}`, { replace: true });
    } else {
      navigate('/collections', { replace: true });
    }
  };

  // Determine Title
  let title = 'All Collections';
  if (selectedCategory) {
    title = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    if (title === 'Tshirts') title = 'T-Shirts';
  }

  let subtitleText = `Explore our curated selection of ${title.toLowerCase()}. Crafted with premium materials and designed for individuals who appreciate the slower, more meaningful things in life.`;

  if (selectedSubcategory) {
    const sub = selectedSubcategory.charAt(0).toUpperCase() + selectedSubcategory.slice(1);
    title = `${title} - ${sub}`;
    subtitleText = `A specialized collection of ${sub.toLowerCase()} ${selectedCategory}. Uncompromising quality and distinct aesthetics.`;
  }

  return (
    <>
      <SEOHead
        title={seo?.title || 'Shop Indian Streetwear: Oversized Tees, Shirts & Hoodies'}
        description={seo?.description || 'Explore Slugsera heavyweight oversized T-shirts, relaxed printed shirts and premium hoodies made for expressive everyday streetwear in India.'}
        keywords={seo?.keywords || ['streetwear Delhi NCR', 'oversized t-shirts India', 'printed shirts India', 'premium hoodies India']}
        url={canonicalCategory ? `/collections/${canonicalCategory}` : '/collections'}
        structuredData={[
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.slugsera.com/' },
            { '@type': 'ListItem', position: 2, name: title, item: `https://www.slugsera.com${canonicalCategory ? `/collections/${canonicalCategory}` : '/collections'}` },
          ] },
          { '@context': 'https://schema.org', '@type': 'ItemList', name: title, itemListElement: filteredProducts.map((product, index) => ({ '@type': 'ListItem', position: index + 1, name: product.name, url: `https://www.slugsera.com/product/${product.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}` })) },
        ]}
      />
      <div className="bg-[#F9F7F5] min-h-screen pb-24 pt-4 sm:pt-6 px-3 sm:px-6 lg:px-16" id="collections">
      <div className="max-w-[2000px] mx-auto">

        {/* Top Bar with Back Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-16 border-b border-[#E8E4E0] pb-6 sm:pb-8">
          <Link
            to="/"
            className="group flex items-center gap-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[#888880] hover:text-[#C0132A] transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-[#E8E4E0] flex items-center justify-center group-hover:border-[#C0132A] transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Home
          </Link>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {categoriesList.map((cat) => {
              const mappedCat = cat.toLowerCase().replace('-', '');
              const isActive = (!selectedCategory && cat === 'All') || (selectedCategory === mappedCat);

              return (
                <Link
                  key={cat}
                  to={cat === 'All' ? '/collections' : `/collections/${mappedCat}`}
                  onClick={() => handleCategoryFilter(cat === 'All' ? null : mappedCat)}
                  className={`text-[10px] font-medium tracking-[0.15em] uppercase whitespace-nowrap transition-colors ${isActive ? 'text-[#C0132A] border-b border-[#C0132A] pb-1' : 'text-[#888880] hover:text-[#1A1A1A]'
                    }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-16 lg:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-4">
            Season Collection
          </div>
          <h1 className="font-display text-[clamp(28px,5vw,72px)] font-light tracking-tight text-[#1A1A1A] mb-3 sm:mb-6 leading-[1.1]">
            {title}
          </h1>
          <p className="text-[13px] sm:text-[15px] font-light leading-[1.7] sm:leading-[1.8] text-[#888880] max-w-xl hidden sm:block">
            {subtitleText}
          </p>
        </motion.div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-8 sm:gap-y-16">
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-[#E8E4E0] bg-white"
          >
            <div className="w-16 h-16 rounded-full bg-[#F9F7F5] flex items-center justify-center mb-6">
              <span className="text-[#888880] text-xl">✨</span>
            </div>
            <h3 className="font-display text-2xl font-light text-[#1A1A1A] mb-3">No Pieces Found</h3>
            <p className="text-[14px] text-[#888880] max-w-md font-light">
              We are currently designing and crafting new additions for this collection. Sign up for our newsletter to be notified when they drop.
            </p>
            <button
              onClick={() => handleCategoryFilter(null)}
              className="mt-8 text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#C0132A] hover:border-[#C0132A] transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
        {seoCategory && COLLECTION_COPY[seoCategory] && (
          <section aria-labelledby="collection-guide-heading" className="mx-auto mt-20 max-w-4xl border-t border-[#E8E4E0] pt-12 sm:mt-28 sm:pt-16">
            <h2 id="collection-guide-heading" className="font-display text-3xl font-light text-[#1A1A1A] sm:text-4xl">{COLLECTION_COPY[seoCategory].heading}</h2>
            <div className="mt-6 grid gap-5 text-sm font-light leading-7 text-[#666660] md:grid-cols-2">
              {COLLECTION_COPY[seoCategory].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="mt-7 text-sm text-[#666660]">Learn more in our <Link className="text-[#C0132A] underline underline-offset-4" to="/blog/what-is-gsm-tshirt-guide-india">T-shirt GSM guide</Link>, browse the <Link className="text-[#C0132A] underline underline-offset-4" to="/lookbook">streetwear lookbook</Link>, or read the <Link className="text-[#C0132A] underline underline-offset-4" to="/faq">sizing FAQ</Link>.</p>
          </section>
        )}
      </div>
      </div>
    </>
  );
}
