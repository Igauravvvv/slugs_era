import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store';

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { setCollectionFilter, setView } = useStore();

  const tshirts = products.filter((p) => p.category === 'tshirts');

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const viewAll = () => {
    setCollectionFilter('tshirts', null);
    setView('collections');
    window.scrollTo(0, 0);
  };

  return (
    <section id="products" className="py-24 lg:py-[120px] px-6 lg:px-20 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-20px', amount: 0.1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between mb-16 lg:mb-[68px]"
      >
        <div>
          <div className="eye-text mb-3.5">T-Shirt Collection</div>
          <h2 className="section-title">
            The <em className="italic text-[#C0132A]">Essential</em> Five
          </h2>
        </div>
        <button
          onClick={viewAll}
          className="hidden lg:flex items-center gap-2 text-[11px] font-medium tracking-[0.13em] uppercase text-[#1A1A1A] border-b border-[#E8E4E0] pb-1 transition-all duration-200 hover:border-[#C0132A] hover:text-[#C0132A]"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Products Grid - Desktop */}
      <div className="hidden lg:flex flex-wrap justify-center gap-8">
        {tshirts.map((product, index) => (
          <div key={product.id} className="w-[calc(33.333%-1.334rem)] mt-2">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>

      {/* Products Scroll - Mobile */}
      <div className="lg:hidden relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4"
        >
          {tshirts.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 w-[280px] snap-start">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
