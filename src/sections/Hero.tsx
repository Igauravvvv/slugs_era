import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { section, getMeta } = useSiteSection('hero');

  const heading = section?.title || 'Wear the Philosophy of Slow Culture';
  const subtitle = section?.subtitle || 'Premium pieces for those who value intention over impulse. Crafted without compromise.';
  const heroImage = section?.image_url || CDN.MODEL_HERO;
  const ctaText = section?.cta_text || 'Shop Now';
  const ctaLink = section?.cta_link || '#products';
  const ctaSecondaryText = (getMeta('cta_secondary_text') as string) || 'Our Story';
  const ctaSecondaryLink = (getMeta('cta_secondary_link') as string) || '#about';
  const eyebrowSequences = (getMeta('eyebrow_sequences') as string[]) || [
    'Movement. Not Merch — The Slow Club',
    'Movement. Not Merch — New Season',
    'Movement. Not Merch — Exclusive Drops',
    'Movement. Not Merch — Slugs Era',
  ];
  const tags = (getMeta('tags') as string[]) || ['100% Organic', 'Slow Fashion', '5 Drops', 'Movement. Not Merch'];

  useEffect(() => {
    const hero = heroRef.current;
    const image = imageRef.current;
    if (!hero || !image) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      image.style.transform = `scale(1.04) translate(${x * 8}px, ${y * 5}px)`;
      image.style.transition = 'transform 0.1s';
    };

    const handleMouseLeave = () => {
      image.style.transform = 'scale(1)';
      image.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleCtaPrimary = () => {
    if (ctaLink.startsWith('#')) {
      const id = ctaLink.slice(1);
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCtaSecondary = () => {
    if (ctaSecondaryLink.startsWith('#')) {
      const id = ctaSecondaryLink.slice(1);
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="min-h-0 lg:min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ===== MOBILE HERO: Full-screen image with overlay ===== */}
      <div className="relative lg:hidden h-[85vh] min-h-[500px] overflow-hidden">
        {/* Background image */}
      <motion.img
        src={heroImage}
        alt="Fashion Model"
          className="absolute inset-0 w-full h-full object-cover object-top"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Dark gradient overlay from bottom */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }} />
        {/* Red tint overlay */}
        <div className="absolute inset-0 z-[1] bg-[#6B0000]/20" />

        {/* Overlay content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-[2] px-6 pb-10 pt-16">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="font-display text-[38px] font-light leading-[1.08] text-white mb-3"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        >
          {heading.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === arr.length - 2 ? <em className="italic text-white/95">{line}</em> : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="text-[13px] font-light leading-[1.7] text-white/70 max-w-[300px] mb-6"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
        >
          <button
            onClick={handleCtaPrimary}
            className="w-full py-4 bg-white/90 text-[#C0132A] text-[13px] font-semibold tracking-[0.2em] uppercase rounded-full backdrop-blur-sm transition-all duration-300 active:scale-95"
          >
            {ctaText}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ===== DESKTOP HERO: Original 2-column layout (unchanged) ===== */}
      {/* Left Content - Desktop Only */}
      <div className="relative z-[2] hidden lg:flex flex-col justify-center px-[72px] py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #6B0000 0%, #9B0015 40%, #C0132A 75%, #8B0010 100%)'
        }}>
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10">
          {/* Eye text */}
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="text-[10px] font-medium tracking-[0.24em] uppercase text-white/85 mb-6 flex items-center gap-3 h-[20px]"
          >
            <span className="w-7 h-px bg-white/60 shrink-0" />
            <TypeAnimation
              sequence={eyebrowSequences.flatMap(s => [s, 3000])}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              cursor={true}
            />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          className="font-display text-[clamp(42px,6vw,92px)] font-light leading-[1.04] text-white mb-6"
          style={{ textShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
        >
          {heading.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === arr.length - 2 ? <em className="italic text-white/95">{line}</em> : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="text-[15px] font-light leading-[1.85] text-white/75 max-w-[380px] mb-12"
          >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -120 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
          className="flex gap-5 items-center mb-12"
        >
          <button onClick={handleCtaPrimary} className="btn-primary group">
            {ctaText}
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
          </button>
          <button onClick={handleCtaSecondary} className="btn-outline">
            {ctaSecondaryText}
          </button>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, x: -120 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
          className="flex gap-2.5 flex-wrap pt-9 border-t border-white/[0.18]"
        >
          {tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/72 border border-white/[0.22] px-3.5 py-1.5 transition-all duration-200 cursor-default hover:text-white hover:border-white/50 hover:bg-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Image - Desktop Only */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-[#5a0310] hidden lg:block lg:min-h-screen"
      >
        <motion.img
          ref={imageRef}
          src={heroImage}
          alt="Fashion Model"
          className="w-full h-full object-cover object-top"
          initial={{ opacity: 0, x: 120 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute left-0 top-0 w-[35%] h-full pointer-events-none z-[2]"
          style={{ background: 'linear-gradient(to right, rgba(107,0,0,0.4) 0%, transparent 100%)' }}
        />
      </div>
    </section>
  );
}
