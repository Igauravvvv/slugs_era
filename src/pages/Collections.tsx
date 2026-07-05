import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import ProductCard from '@/components/ProductCard';

export default function Collections() {
  const { selectedCategory, selectedSubcategory, setCollectionFilter, products } = useStore();
  const navigate = useNavigate();
  const { category: urlCategory } = useParams<{ category?: string }>();

  // Sync URL param → Zustand store on mount or when URL changes
  useEffect(() => {
    if (urlCategory) {
      // Map user-friendly URL slugs to internal category names
      const categoryMap: Record<string, string> = {
        'tshirts': 'tshirts',
        't-shirts': 'tshirts',
        'shirts': 'shirts',
        'hoodies': 'hoodies',
        'accessories': 'accessories',
      };
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
  });

  const goBack = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const } }
  };

  return (
    <div className="bg-[#F9F7F5] min-h-screen pb-24 pt-4 sm:pt-6 px-3 sm:px-6 lg:px-16" id="collections">
      <div className="max-w-[2000px] mx-auto">

        {/* Top Bar with Back Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-16 border-b border-[#E8E4E0] pb-6 sm:pb-8">
          <button
            onClick={goBack}
            className="group flex items-center gap-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[#888880] hover:text-[#C0132A] transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-[#E8E4E0] flex items-center justify-center group-hover:border-[#C0132A] transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Home
          </button>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {['All', 'Shirts', 'T-Shirts', 'Hoodies'].map((cat) => {
              const mappedCat = cat.toLowerCase().replace('-', '');
              const isActive = (!selectedCategory && cat === 'All') || (selectedCategory === mappedCat);

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilter(cat === 'All' ? null : mappedCat)}
                  className={`text-[10px] font-medium tracking-[0.15em] uppercase whitespace-nowrap transition-colors ${isActive ? 'text-[#C0132A] border-b border-[#C0132A] pb-1' : 'text-[#888880] hover:text-[#1A1A1A]'
                    }`}
                >
                  {cat}
                </button>
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
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-8 sm:gap-y-16"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
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
      </div>
    </div>
  );
}
