import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="min-h-0 lg:min-h-screen grid grid-cols-1 lg:grid-cols-2 pt-[76px] lg:pt-0">
      {/* Left Content */}
      <div className="relative z-[2] flex flex-col justify-center px-6 lg:px-[72px] py-16 lg:py-20 overflow-hidden"
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
              sequence={[
                'Movement. Not Merch — The Slow Club',
                3000,
                'Movement. Not Merch — New Season',
                3000,
                'Movement. Not Merch — Exclusive Drops',
                3000,
                'Movement. Not Merch — Slugs Era',
                3000,
              ]}
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
            Wear the<br />
            <em className="italic text-white/95">Philosophy</em><br />
            of Slow Culture
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="text-[15px] font-light leading-[1.85] text-white/75 max-w-[380px] mb-12"
          >
            Premium pieces for those who value intention over impulse. Crafted without compromise.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
            className="flex gap-5 items-center mb-12"
          >
            <button onClick={scrollToProducts} className="btn-primary group">
              Shop Now
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
            </button>
            <button onClick={scrollToAbout} className="btn-outline">
              Our Story
            </button>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
            className="flex gap-2.5 flex-wrap pt-9 border-t border-white/[0.18]"
          >
            {['100% Organic', 'Slow Fashion', '5 Drops', 'Movement. Not Merch'].map((tag) => (
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

      {/* Right Image */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-[#5a0310] h-[35vh] min-h-[35vh] lg:min-h-screen lg:h-auto"
      >
        <motion.img
          ref={imageRef}
          src="/images/MODEL-WITH SHIRT.png"
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
