import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

export default function CTA() {
  const { setView, setCollectionFilter } = useStore();

  const scrollToProducts = () => {
    setCollectionFilter('tshirts', null);
    setView('collections');
    window.scrollTo(0, 0);
  };

  const scrollToShirts = () => {
    setCollectionFilter('shirts', null);
    setView('collections');
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative py-16 lg:py-[100px] px-5 lg:px-20 bg-[#C0132A] text-center overflow-hidden">
      {/* Background text Marquee */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0 overflow-hidden flex">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            repeat: Infinity,
            duration: 50,
            ease: "linear",
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="font-display text-[clamp(80px,20vw,280px)] font-semibold text-transparent px-8 lg:px-16"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.18)' }}
            >
              Don't Rush.
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-white/70 mb-4">
          Upgrade Your Wardrobe
        </div>

        <h2 className="font-display text-[clamp(36px,6vw,80px)] font-light leading-[1.06] text-white mb-4">
          Shop <em className="italic">Premium</em><br />
          Pieces
        </h2>

        <p className="text-[13px] lg:text-[15px] font-light text-white/65 max-w-[500px] mx-auto mb-8 lg:mb-11 leading-[1.7] lg:leading-[1.8]">
          Life is too short for uncomfortable clothes. Invest in essentials that earn their place for years, not months.
        </p>

        <div className="flex gap-5 items-center justify-center flex-wrap">
          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white text-[10px] lg:text-[11px] font-medium tracking-[0.17em] uppercase px-6 lg:px-8 py-3.5 lg:py-4 transition-all duration-300 hover:bg-black hover:-translate-y-0.5"
          >
            Shop T-Shirts — ₹1,899
            <ArrowRight size={13} strokeWidth={2} />
          </button>
          <button
            onClick={scrollToShirts}
            className="inline-flex items-center gap-3 bg-white/15 text-white text-[10px] lg:text-[11px] font-medium tracking-[0.17em] uppercase px-6 lg:px-8 py-3.5 lg:py-4 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
          >
            Shop Shirts — ₹2,299
          </button>
        </div>
      </motion.div>
    </section>
  );
}
