import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { products } from '@/data/products';
import { useStore } from '@/store';

export default function Shirts() {
  const { setSelectedProduct, setView } = useStore();
  const shirts = products.filter((p) => p.category === 'shirts').slice(0, 2);

  const handleProductClick = (product: typeof shirts[0]) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  return (
    <section
      id="shirts"
      className="relative min-h-[100vh] flex items-center py-32 lg:py-[160px] px-6 lg:px-20 bg-[#1A1A1A] overflow-hidden"
    >
      {/* Background text */}
      <div
        className="absolute right-[-40px] top-1/2 -translate-y-1/2 font-display text-[clamp(100px,20vw,280px)] font-semibold text-transparent whitespace-nowrap pointer-events-none select-none"
        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.04)' }}
      >
        COAST
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-20px', amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-[12px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-6 flex items-center gap-4">
            <span className="w-8 h-px bg-[#C0132A]" />
            New Drop — Shirts
          </div>

          <h2 className="font-display text-[clamp(44px,7vw,92px)] font-light leading-[1.06] text-white mb-6">
            Coastal<br />
            <em className="italic text-[#C0132A]">Drift</em>
          </h2>

          <p className="text-[17px] font-light leading-[1.85] text-white/45 max-w-[440px] mb-10">
            Drift Like Waves. Stand Like Palms. Camp collar, relaxed fit, printed with the coastal philosophy you live by.
          </p>

          <div className="font-display text-[42px] font-light text-white mb-10">
            ₹2,299 <span className="text-[14px] font-light text-white/35 ml-2 uppercase tracking-[0.08em]">per shirt</span>
          </div>

          <div className="flex gap-6 items-center">
            <button
              onClick={() => handleProductClick(shirts[0])}
              className="inline-flex items-center gap-3 bg-white text-[#1A1A1A] text-[12px] font-medium tracking-[0.17em] uppercase px-10 py-5 transition-all duration-300 hover:bg-[#F9F7F5] hover:-translate-y-0.5"
            >
              Add to Cart
              <ArrowRight size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => handleProductClick(shirts[0])}
              className="text-[12px] font-medium tracking-[0.14em] uppercase text-white/80 border-b border-white/30 pb-1 transition-all duration-200 hover:text-white hover:border-white"
            >
              View Details
            </button>
          </div>
        </motion.div>

        {/* Right - Product Cards */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-20px', amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-6"
        >
          {shirts.map((shirt, index) => {
            const initialX = index === 0 ? -180 : 180;
            return (
              <motion.div
                key={shirt.id}
                initial={{ opacity: 0, x: initialX, filter: 'blur(10px)', scale: 0.85 }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
                viewport={{ once: false, margin: '-20px', amount: 0.1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
                onClick={() => handleProductClick(shirt)}
                className={`bg-white/[0.04] border border-white/[0.07] overflow-hidden cursor-pointer transition-colors duration-300 hover:border-[#C0132A]/40 ${index === 0 ? 'mt-10' : ''
                  }`}
              >
                <div className="overflow-hidden">
                  <motion.img
                    src={shirt.image}
                    alt={shirt.name}
                    className="w-full aspect-square object-cover p-[6%]"
                    whileHover={{
                      scale: 1.15,
                      rotate: [-2, 2, -1, 1, 0],
                      filter: 'brightness(1.1) contrast(1.05) drop-shadow(0 20px 30px rgba(255,255,255,0.05))',
                      transition: { duration: 1.1, ease: "easeOut" }
                    }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="p-4 border-t border-white/[0.07] flex justify-between items-center text-[12px]">
                  <span className="font-medium tracking-[0.1em] uppercase text-white/60">
                    {shirt.name}
                  </span>
                  <span className="text-[#C0132A]">
                    ₹{shirt.price.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
