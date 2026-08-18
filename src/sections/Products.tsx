import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import ProductCard from '@/components/ProductCard';

import { useSiteSection } from '@/context/SiteContentContext';

export default function Products() {
  const { setCollectionFilter, products } = useStore();
  const navigate = useNavigate();
  const { section } = useSiteSection('products');

  const title = section?.title || 'The Essential Five';
  const subtitle = section?.subtitle || 'T-Shirt Collection';

  const featuredProducts = products.filter((p) => p.isFeatured && p.status !== 'sold_out');
  const tshirts = products.filter((p) => p.category === 'tshirts');
  // A dashboard editor controls the home shelf. Preserve the original T-shirt
  // shelf as a sensible fallback until at least one product is featured.
  const homeProducts = featuredProducts.length > 0 ? featuredProducts : tshirts;

  const viewAll = () => {
    setCollectionFilter('tshirts', null);
    navigate('/collections');
  };

  const getCardVariants = (index: number) => {
    return {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 } 
      }
    };
  };

  return (
    <section id="products" className="py-14 lg:py-[100px] px-4 lg:px-8 bg-white overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-20px', amount: 0.1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-8 lg:mb-10 max-w-[1800px] mx-auto"
      >
        <div>
          <div className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#888880] mb-2">{subtitle}</div>
          <h2 className="font-display text-[32px] lg:text-[48px] font-medium leading-[1.1] text-[#1A1A1A]">
            {title.includes(' ') ? (
              <>
                {title.split(' ').slice(0, -1).join(' ')} <em className="italic font-light">{title.split(' ').slice(-1)}</em>
              </>
            ) : (
              title
            )}
          </h2>
        </div>
        <button
          onClick={viewAll}
          className="hidden lg:flex items-center gap-2 text-[12px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 transition-all duration-200 hover:text-[#888880] hover:border-[#888880]"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Products Grid - Desktop & Mobile */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        {homeProducts.slice(0, 5).map((product, index) => (
          <div key={product.id} className="w-full" style={{ willChange: 'transform, opacity' }}>
            <ProductCard product={product} index={index} customVariants={getCardVariants(index)} />
          </div>
        ))}
      </div>
      
      <div className="mt-10 flex justify-center lg:hidden">
        <button
          onClick={viewAll}
          className="flex items-center gap-2 text-[12px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-1"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
