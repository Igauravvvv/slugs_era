import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function Collections() {
  const { selectedCategory, selectedSubcategory, setView, setCollectionFilter } = useStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory, selectedSubcategory]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const goBack = () => {
    setView('home');
    window.scrollTo(0, 0);
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
    <div className="bg-[#F9F7F5] min-h-screen pb-24 pt-32 px-6 lg:px-16" id="collections">
      <div className="max-w-[2000px] mx-auto">

        {/* Top Bar with Back Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16 border-b border-[#E8E4E0] pb-8">
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
                  onClick={() => setCollectionFilter(cat === 'All' ? null : mappedCat, null)}
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
          className="mb-16 lg:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-4">
            Season Collection
          </div>
          <h1 className="font-display text-[clamp(40px,5vw,72px)] font-light tracking-tight text-[#1A1A1A] mb-6 leading-[1.1]">
            {title}
          </h1>
          <p className="text-[15px] font-light leading-[1.8] text-[#888880] max-w-xl">
            {subtitleText}
          </p>
        </motion.div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
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
              onClick={() => setCollectionFilter(null, null)}
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
