import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import ProductCard from '@/components/ProductCard';

export default function Products() {
  const { setCollectionFilter, products } = useStore();
  const navigate = useNavigate();

  const tshirts = products.filter((p) => p.category === 'tshirts');

  const viewAll = () => {
    setCollectionFilter('tshirts', null);
    navigate('/collections');
  };

  const getCardVariants = (index: number) => {
    switch(index) {
      case 0: // Top Left
        return {
          hidden: { opacity: 0, x: -40, rotate: -4 },
          visible: { 
            opacity: 1, 
            x: 0, 
            rotate: 0, 
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 } 
          }
        };
      case 1: // Top Center
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 } 
          }
        };
      case 2: // Top Right
        return {
          hidden: { opacity: 0, x: 40, rotate: 4 },
          visible: { 
            opacity: 1, 
            x: 0, 
            rotate: 0, 
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 } 
          }
        };
      case 3: // Bottom Left
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 } 
          }
        };
      case 4: // Bottom Right
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.45 } 
          }
        };
      default:
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 } 
          }
        };
    }
  };

  return (
    <section id="products" className="py-14 lg:py-[120px] px-5 lg:px-20 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-20px', amount: 0.1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-8 lg:mb-[68px]"
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

      {/* Products Grid - Desktop & Mobile */}
      <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-2 lg:gap-8">
        {tshirts.slice(0, 5).map((product, index) => (
          <div key={product.id} className="w-full lg:w-[calc(33.333%-1.334rem)] lg:mt-2" style={{ willChange: 'transform, opacity' }}>
            <ProductCard product={product} index={index} customVariants={getCardVariants(index)} />
          </div>
        ))}
      </div>
    </section>
  );
}
