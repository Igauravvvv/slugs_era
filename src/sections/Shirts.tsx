import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { generateSlug } from '@/types';
import { useSiteSection } from '@/context/SiteContentContext';

export default function Shirts() {
  const navigate = useNavigate();
  const { products } = useStore();
  const shirts = products.filter((p) => p.category === 'shirts').slice(0, 2);
  const { section, getMeta } = useSiteSection('shirts');

  const eyebrow = section?.subtitle || 'New Drop — Shirts';
  const heading = section?.title || 'Coastal\n<em>Drift</em>';
  const bodyText = section?.body_text || 'Drift Like Waves. Stand Like Palms. Camp collar, relaxed fit, printed with the coastal philosophy you live by.';
  const price = (getMeta('price') as string) || '₹2,299';
  const priceLabel = (getMeta('price_label') as string) || 'per shirt';
  const marqueeText = (getMeta('marquee_text') as string) || 'COAST';
  const ctaText = section?.cta_text || 'Add to Cart';
  const ctaLink = section?.cta_link || '';

  const handleProductClick = (product: typeof shirts[0]) => {
    navigate(`/product/${generateSlug(product.name)}`);
  };

  return (
    <section
      id="shirts"
      className="relative min-h-0 lg:min-h-[100vh] flex items-center py-16 lg:py-[160px] px-5 lg:px-20 bg-[#1A1A1A] overflow-hidden"
    >
      {/* Background text Marquee */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0 overflow-hidden flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 20, // Even faster speed
            ease: "linear",
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              // Reduced size slightly per user request
              className="font-display text-[clamp(160px,28vw,420px)] scale-y-110 origin-center font-semibold text-transparent px-8 lg:px-16"
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.09)' }} // Thicker and brighter stroke for more visibility
        >
          {marqueeText}
        </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-20px', amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-[10px] lg:text-[12px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-3 lg:mb-6 flex items-center gap-4">
        <span className="w-8 h-px bg-[#C0132A]" />
        {eyebrow}
      </div>

      <h2 className="font-display text-[clamp(32px,7vw,92px)] font-light leading-[1.06] text-white mb-3 lg:mb-6">
        {heading.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line.startsWith('<em>') ? (
              <em className="italic text-[#C0132A]" dangerouslySetInnerHTML={{ __html: line.replace(/<\/?em>/g, '') }} />
            ) : (
              line
            )}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </h2>

      <p className="text-[14px] lg:text-[17px] font-light leading-[1.7] lg:leading-[1.85] text-white/45 max-w-[440px] mb-5 lg:mb-10 hidden lg:block">
        {bodyText}
      </p>

      <div className="font-display text-[28px] lg:text-[42px] font-light text-white mb-5 lg:mb-10">
        {price} <span className="text-[12px] lg:text-[14px] font-light text-white/35 ml-2 uppercase tracking-[0.08em]">{priceLabel}</span>
          </div>

          <div className="flex gap-4 lg:gap-6 items-center">
        <button
          onClick={() => handleProductClick(shirts[0])}
          className="inline-flex items-center gap-3 bg-white text-[#1A1A1A] text-[11px] lg:text-[12px] font-medium tracking-[0.17em] uppercase px-6 lg:px-10 py-3.5 lg:py-5 transition-all duration-300 hover:bg-[#F9F7F5] hover:-translate-y-0.5"
        >
          {ctaText}
              <ArrowRight size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => handleProductClick(shirts[0])}
              className="text-[11px] lg:text-[12px] font-medium tracking-[0.14em] uppercase text-white/80 border-b border-white/30 pb-1 transition-all duration-200 hover:text-white hover:border-white"
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
          className="grid grid-cols-2 gap-3 lg:gap-6"
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
                className={`bg-white/[0.04] border border-white/[0.07] overflow-hidden cursor-pointer transition-colors duration-300 hover:border-[#C0132A]/40 ${index === 0 ? 'lg:mt-10' : ''
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
                    transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="p-2.5 lg:p-4 border-t border-white/[0.07] flex justify-between items-center text-[10px] lg:text-[12px]">
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
