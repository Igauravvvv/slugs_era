import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSiteSection } from '@/context/SiteContentContext';

const HERO_IMAGES = [
  '/images/Female_model_vinyl.webp',
  '/images/turtlemodelimage.webp',
  '/images/slow_down_model.webp',
  '/images/seedhe_pahad_se_model.webp'
] as const;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLImageElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentImage, setCurrentImage] = useState<string>(HERO_IMAGES[0]);

  const { section } = useSiteSection('hero');
  const ctaText = section?.cta_text || 'Shop now';
  const ctaLink = section?.cta_link || '#products';

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const rightBlockX = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const leftBlockX = useTransform(scrollYProgress, [0, 1], [0, -400]);

  // Autoplay Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => {
        const currentIndex = HERO_IMAGES.indexOf(prev as any);
        return HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length];
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [currentImage]);

  // Parallax on mouse move
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let requestRef: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      cancelAnimationFrame(requestRef);
      requestRef = requestAnimationFrame(() => {
        // Move floating elements with different depths
        elementsRef.current.forEach((el, index) => {
          if (!el) return;
          const depth = (index % 4) + 1.5; // varying depths
          const invert = index % 2 === 0 ? 1 : -1;
          el.style.transform = `translate(${x * 40 * depth * invert}px, ${y * 40 * depth * invert}px) rotate(${x * 30 * invert}deg)`;
        });
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(requestRef);
      elementsRef.current.forEach((el) => {
        if (!el) return;
        el.style.transform = `translate(0px, 0px) rotate(0deg)`;
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  const handleCta = () => {
    if (ctaLink.startsWith('#')) {
      const id = ctaLink.slice(1);
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate some random positions for floating elements
  const floatingElements = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 90 + 5}%`,
    left: `${Math.random() * 90 + 5}%`,
    scale: Math.random() * 0.8 + 0.4,
    rotation: Math.random() * 360,
  }));

  const ButterflySVG = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5,12 C9.5,6 3.5,4 3.5,11.5 C3.5,15 9.5,13.5 11.5,12 Z" />
      <path d="M12.5,12 C14.5,6 20.5,4 20.5,11.5 C20.5,15 14.5,13.5 12.5,12 Z" />
      <path d="M11.5,12 C9.5,17 3.5,21 3.5,14 C3.5,11.5 9.5,13.5 11.5,12 Z" />
      <path d="M12.5,12 C14.5,17 20.5,21 20.5,14 C20.5,11.5 14.5,13.5 12.5,12 Z" />
    </svg>
  );

  const isTitleRightAligned = currentImage === HERO_IMAGES[0] || currentImage === HERO_IMAGES[2];

  const handleNext = () => {
    const currentIndex = HERO_IMAGES.indexOf(currentImage as any);
    setCurrentImage(HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length]);
  };

  const handlePrev = () => {
    const currentIndex = HERO_IMAGES.indexOf(currentImage as any);
    setCurrentImage(HERO_IMAGES[(currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length]);
  };

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative w-full h-screen min-h-[600px] overflow-hidden bg-black flex flex-col items-center justify-center"
    >
      {/* Background Model Image - Takes Full Screen */}
      <div className="absolute inset-0 w-full h-full z-0">
        {HERO_IMAGES.map((img) => (
          <motion.img
            key={img}
            src={img}
            alt="Fashion Model"
            className={`absolute inset-0 w-full h-full ${img.includes('seedhe_pahad_se') ? 'object-contain' : 'object-cover object-center'}`}
            style={img.includes('seedhe_pahad_se') ? { backgroundColor: '#7BA7C2' } : undefined}
            initial={false}
            animate={{ 
              opacity: currentImage === img ? 1 : 0,
              scale: currentImage === img ? 1 : 1.05
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        ))}
        {/* Subtle overlay to make text readable if needed */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      </div>

      {/* Swipe Interceptor Layer */}
      <motion.div
        className="absolute inset-0 z-10 touch-pan-y"
        onPanEnd={(e, info) => {
          const currentIndex = HERO_IMAGES.indexOf(currentImage as any);
          if (info.offset.x < -50) {
            // swipe left -> next
            setCurrentImage(HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length]);
          } else if (info.offset.x > 50) {
            // swipe right -> prev
            setCurrentImage(HERO_IMAGES[(currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length]);
          }
        }}
      />

      {/* Floating Elements */}
      {floatingElements.map((el, index) => (
        <div
          key={el.id}
          ref={(node) => (elementsRef.current[index] = node)}
          className="absolute z-[1] pointer-events-none transition-transform duration-1000 ease-out mix-blend-overlay"
          style={{
            top: el.top,
            left: el.left,
            transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
          }}
        >
          {index % 4 === 0 ? (
            <div className="w-12 h-12 text-white/50"><ButterflySVG /></div>
          ) : index % 4 === 1 ? (
            <div className="w-8 h-8 text-white/40"><ButterflySVG /></div>
          ) : index % 4 === 2 ? (
            <div className="w-4 h-4 rounded-full bg-white/50 blur-[2px]" />
          ) : (
            <div className="text-3xl font-light text-white/40">+</div>
          )}
        </div>
      ))}

      {/* Vinyl Element */}
      <AnimatePresence>
        {currentImage === '/images/Female_model_vinyl.webp' && (
          <motion.div 
            className="absolute -right-16 lg:-right-24 -bottom-4 lg:-bottom-8 z-10 hidden md:block pointer-events-none"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100, transition: { duration: 0.5 } }}
            transition={{ duration: 1.2, type: "spring", stiffness: 40 }}
          >
            <motion.img 
              src="/images/Vinyl_Only-removebg-preview.webp"
              alt="Vinyl"
              className="w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-95"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Title Block */}
      <motion.div 
        layout
        className={`absolute top-36 md:top-48 z-20 flex flex-col w-full max-w-2xl ${
          isTitleRightAligned
            ? 'right-6 md:right-12 lg:right-24 items-start md:items-end text-left md:text-right'
            : 'left-12 md:left-24 lg:left-40 items-start text-left'
        }`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, layout: { duration: 0.8, ease: "easeInOut" } }}
        style={{ x: isTitleRightAligned ? rightBlockX : leftBlockX, willChange: "transform" }}
      >
        {/* Top Text */}
        <motion.div layout className={`flex items-center gap-4 text-white text-[10px] md:text-xs tracking-[0.2em] uppercase mb-4 md:mb-6 opacity-80 ${
          isTitleRightAligned ? 'md:mr-6 lg:mr-12' : ''
        }`}>
          <span className="w-8 md:w-12 h-[1px] bg-white/60 hidden md:block"></span>
          <span>MOVEMENT. NOT MERCH — NEW SEASON</span>
        </motion.div>

        {/* Title Logo */}
        <motion.img 
          layout
          src="/images/texttttlogo.webp" 
          alt="Slugsera Logo" 
          className="w-[200px] md:w-[320px] lg:w-[420px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
        />
      </motion.div>

      {/* Bottom Left Content Block */}
      <motion.div 
        className="absolute left-6 md:left-12 lg:left-24 bottom-12 md:bottom-16 lg:bottom-24 z-20 flex flex-col items-start text-left w-full max-w-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ x: leftBlockX, willChange: "transform" }}
      >
        {/* Subtitle */}
        <p className="text-white text-base md:text-xl font-light tracking-wide mb-6 md:mb-8 opacity-90">
          Premium Slow Fashion
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6 md:gap-8 mb-6 md:mb-8">
          <button 
            onClick={handleCta}
            className="bg-white text-[#C0132A] px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-3 hover:bg-gray-100 transition-colors"
          >
            SHOP NOW <span className="text-lg leading-none">→</span>
          </button>
          <a 
            href="#about"
            className="text-white text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium border-b border-white/40 pb-1 hover:border-white transition-colors"
          >
            OUR STORY
          </a>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-white/20 mb-6 md:mb-8"></div>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 text-white text-[9px] md:text-[10px] tracking-[0.15em] uppercase">
          <span className="border border-white/30 px-3 py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">100% ORGANIC</span>
          <span className="border border-white/30 px-3 py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">SLOW FASHION</span>
          <span className="border border-white/30 px-3 py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">5 DROPS</span>
          <span className="border border-white/30 px-3 py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">MOVEMENT. NOT MERCH</span>
        </div>
      </motion.div>

      {/* Navigation Arrows (Glassmorphism) */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 hover:scale-105 transition-all duration-300"
        aria-label="Previous Look"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 hover:scale-105 transition-all duration-300"
        aria-label="Next Look"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Image Toggle Switch (Dots) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {HERO_IMAGES.map((img, idx) => (
          <button
            key={img}
            onClick={() => setCurrentImage(img)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentImage === img 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`View look ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
