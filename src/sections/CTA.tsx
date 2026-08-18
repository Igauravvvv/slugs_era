import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useSiteSection } from '@/context/SiteContentContext';

export default function CTA() {
  const { setCollectionFilter, products } = useStore();
  const navigate = useNavigate();
  const { section, getMeta } = useSiteSection('cta');

  const eyebrow = section?.subtitle || 'Upgrade Your Wardrobe';
  const heading = section?.title || 'Shop <em class="italic">Premium</em><br />Pieces';
  const bodyText = section?.body_text || "Life is too short for uncomfortable clothes. Invest in essentials that earn their place for years, not months.";
  const marqueeText = (getMeta('marquee_text') as string) || "Don't Rush.";
  const ctaPrimaryLink = section?.cta_link || 'tshirts';
  const ctaSecondaryLink = (getMeta('cta_secondary_link') as string) || 'shirts';

  const buildCollectionCta = (category: string, label: string, fallback: string) => {
    const categoryProducts = products.filter((product) => product.category === category);
    const availableProducts = categoryProducts.filter((product) => product.status === 'active');
    const comingSoon = categoryProducts.some((product) => product.status === 'coming_soon');

    if (availableProducts.length > 0) {
      const prices = availableProducts.map((product) => product.price);
      const lowestPrice = Math.min(...prices);
      const pricePrefix = prices.some((price) => price !== lowestPrice) ? 'from ' : '';
      return `Shop ${label} — ${pricePrefix}₹${lowestPrice.toLocaleString('en-IN')}`;
    }

    return comingSoon ? `Shop ${label} — Coming Soon` : fallback;
  };

  // Prices and availability come from the live product catalogue, not old marketing copy.
  const ctaPrimaryText = buildCollectionCta(ctaPrimaryLink, 'T-Shirts', 'Shop T-Shirts — ₹1,199');
  const ctaSecondaryText = buildCollectionCta(ctaSecondaryLink, 'Shirts', 'Shop Shirts — Coming Soon');

  const handleCtaPrimary = () => {
    setCollectionFilter(ctaPrimaryLink, null);
    navigate(`/collections/${ctaPrimaryLink}`);
    window.scrollTo(0, 0);
  };

  const handleCtaSecondary = () => {
    setCollectionFilter(ctaSecondaryLink, null);
    navigate(`/collections/${ctaSecondaryLink}`);
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
              {marqueeText}
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
          {eyebrow}
        </div>

        <h2
          className="font-display text-[clamp(36px,6vw,80px)] font-light leading-[1.06] text-white mb-4"
          dangerouslySetInnerHTML={{ __html: heading }}
        />

        <p className="text-[13px] lg:text-[15px] font-light text-white/65 max-w-[500px] mx-auto mb-8 lg:mb-11 leading-[1.7] lg:leading-[1.8]">
          {bodyText}
        </p>

        <div className="flex gap-5 items-center justify-center flex-wrap">
          <button
            type="button"
            onClick={handleCtaPrimary}
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white text-[10px] lg:text-[11px] font-medium tracking-[0.17em] uppercase px-6 lg:px-8 py-3.5 lg:py-4 transition-all duration-300 hover:bg-black hover:-translate-y-0.5"
          >
            {ctaPrimaryText}
            <ArrowRight size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleCtaSecondary}
            className="inline-flex items-center gap-3 bg-white/15 text-white text-[10px] lg:text-[11px] font-medium tracking-[0.17em] uppercase px-6 lg:px-8 py-3.5 lg:py-4 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5"
          >
            {ctaSecondaryText}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
