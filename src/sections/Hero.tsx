import { useRef, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useSiteSection } from '@/context/SiteContentContext';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

const HERO_IMAGES = [
  '/images/blackvinylmodel.png',
  '/images/blue_turtle_hero_desktop.webp',
  '/images/green_tshirt_studio_hero.webp',
  '/images/seedhe%20pahad%20se%20model.webp'
] as const;
const BLUE_TURTLE_MOBILE_SRCSET = '/images/cdn/hero-blue-turtle-mobile-640.webp 640w, /images/cdn/hero-blue-turtle-mobile-960.webp 960w, /images/cdn/hero-blue-turtle-mobile-1440.webp 1440w';
const GREEN_STUDIO_SRCSET = '/images/cdn/hero-green-studio-640.webp 640w, /images/cdn/hero-green-studio-1280.webp 1280w, /images/cdn/hero-green-studio-1672.webp 1672w';
const HERO_ALT: Record<(typeof HERO_IMAGES)[number], string> = {
  '/images/blackvinylmodel.png': 'Model wearing the Slugsera Let The Moment Play Black Vinyl oversized graphic T-shirt',
  '/images/blue_turtle_hero_desktop.webp': 'Model wearing the blue Slugsera Slow Steady Savage turtle T-shirt at sea',
  '/images/green_tshirt_studio_hero.webp': 'Model wearing a green Slugsera T-shirt in a botanical photo studio',
  '/images/seedhe%20pahad%20se%20model.webp': 'Model wearing the Slugsera Seedhe Pahad Se graphic streetwear T-shirt',
};
const HERO_RESPONSIVE: Record<(typeof HERO_IMAGES)[number], string> = {
  '/images/blackvinylmodel.png': 'hero-black-vinyl-original',
  '/images/blue_turtle_hero_desktop.webp': 'hero-blue-turtle-desktop',
  '/images/green_tshirt_studio_hero.webp': 'hero-green-studio',
  '/images/seedhe%20pahad%20se%20model.webp': 'hero-pahad',
};
const HERO_DIMENSIONS: Record<(typeof HERO_IMAGES)[number], { width: number; height: number }> = {
  '/images/blackvinylmodel.png': { width: 6688, height: 3764 },
  '/images/blue_turtle_hero_desktop.webp': { width: 2400, height: 1351 },
  '/images/green_tshirt_studio_hero.webp': { width: 1672, height: 941 },
  '/images/seedhe%20pahad%20se%20model.webp': { width: 2000, height: 848 },
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentImage, setCurrentImage] = useState<(typeof HERO_IMAGES)[number]>(HERO_IMAGES[0]);
  const prefersReducedMotion = useReducedMotion();

  const { section } = useSiteSection('hero');
  const ctaText = section?.cta_text || 'Shop now';
  const ctaLink = section?.cta_link || '#products';
  const desktopHeroImage = section?.image_url || '';
  const mobileHeroImage = typeof section?.meta?.mobile_image_url === 'string' ? section.meta.mobile_image_url : '';
  const hasCustomHero = Boolean(desktopHeroImage || mobileHeroImage);

  const navigate = useNavigate();
  const setCollectionFilter = useStore(state => state.setCollectionFilter);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const rightBlockX = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const leftBlockX = useTransform(scrollYProgress, [0, 1], [0, -400]);

  // Autoplay Slider
  useEffect(() => {
    if (hasCustomHero) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => {
        const currentIndex = HERO_IMAGES.indexOf(prev);
        return HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length];
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [hasCustomHero]);

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
    if (ctaLink.includes('/collections')) {
      const match = ctaLink.match(/\/collections\/([^/]+)/);
      if (match) {
        setCollectionFilter(match[1], null);
      } else {
        setCollectionFilter(null, null);
      }
    }
    if (ctaLink.startsWith('/')) {
      navigate(ctaLink);
    } else {
      window.location.href = ctaLink;
    }
  };

  // Generate some random positions for floating elements
  const floatingElements = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 90 + 5}%`,
    left: `${Math.random() * 90 + 5}%`,
    scale: Math.random() * 0.8 + 0.4,
    rotation: Math.random() * 360,
    driftX: 8 + (i % 4) * 4,
    driftY: 10 + (i % 3) * 5,
    duration: 4.8 + (i % 5) * 0.75,
  })), []);

  const ButterflySVG = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5,12 C9.5,6 3.5,4 3.5,11.5 C3.5,15 9.5,13.5 11.5,12 Z" />
      <path d="M12.5,12 C14.5,6 20.5,4 20.5,11.5 C20.5,15 14.5,13.5 12.5,12 Z" />
      <path d="M11.5,12 C9.5,17 3.5,21 3.5,14 C3.5,11.5 9.5,13.5 11.5,12 Z" />
      <path d="M12.5,12 C14.5,17 20.5,21 20.5,14 C20.5,11.5 14.5,13.5 12.5,12 Z" />
    </svg>
  );

  const isTitleRightAligned = hasCustomHero || currentImage === HERO_IMAGES[0] || currentImage === HERO_IMAGES[2];

  const handleNext = () => {
    const currentIndex = HERO_IMAGES.indexOf(currentImage);
    setCurrentImage(HERO_IMAGES[(currentIndex + 1) % HERO_IMAGES.length]);
  };

  const handlePrev = () => {
    const currentIndex = HERO_IMAGES.indexOf(currentImage);
    setCurrentImage(HERO_IMAGES[(currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length]);
  };

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[520px] overflow-hidden bg-black flex flex-col items-center justify-center"
    >
      {/* Background Model Image - Takes Full Screen */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="sync">
          <motion.picture
            key={hasCustomHero ? `${desktopHeroImage}:${mobileHeroImage}` : currentImage}
            className={`absolute inset-0 block w-full h-full ${
              !hasCustomHero && currentImage === HERO_IMAGES[0] ? 'hero-black-vinyl-frame' : ''
            }`}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
          >
            {mobileHeroImage && <source media="(max-width: 767px)" srcSet={mobileHeroImage} />}
            {!hasCustomHero && currentImage === HERO_IMAGES[1] && (
              <source media="(max-width: 767px)" srcSet={BLUE_TURTLE_MOBILE_SRCSET} sizes="100vw" />
            )}
            {!hasCustomHero && currentImage === HERO_IMAGES[2] && (
              <source srcSet={GREEN_STUDIO_SRCSET} sizes="100vw" />
            )}
            {desktopHeroImage && <source media="(min-width: 768px)" srcSet={desktopHeroImage} />}
            <img
              src={desktopHeroImage || mobileHeroImage || currentImage}
              srcSet={hasCustomHero ? undefined : `/images/cdn/${HERO_RESPONSIVE[currentImage]}-640.webp 640w, /images/cdn/${HERO_RESPONSIVE[currentImage]}-1280.webp 1280w, /images/cdn/${HERO_RESPONSIVE[currentImage]}-1920.webp 1920w`}
              sizes="100vw"
              alt={hasCustomHero ? 'Slugsera seasonal hero cover' : HERO_ALT[currentImage]}
              width={hasCustomHero ? 2000 : HERO_DIMENSIONS[currentImage].width}
              height={hasCustomHero ? 1125 : HERO_DIMENSIONS[currentImage].height}
              className={`absolute inset-0 w-full h-full object-cover ${
                !hasCustomHero && currentImage === HERO_IMAGES[0]
                  ? 'hero-black-vinyl-image object-center'
                  : !hasCustomHero && currentImage === HERO_IMAGES[1]
                      ? 'object-center md:object-[center_64%]'
                  : !hasCustomHero && currentImage === '/images/seedhe%20pahad%20se%20model.webp'
                    ? 'object-[80%_center] sm:object-center'
                    : 'object-center'
              }`}
              decoding="async"
              fetchPriority="high"
            />
          </motion.picture>
        </AnimatePresence>
        {/* Subtle overlay to make text readable if needed */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      </div>

      {/* Swipe Interceptor Layer */}
      <motion.div
        className="absolute inset-0 z-10 touch-pan-y"
        onPanEnd={(_, info) => {
          if (hasCustomHero) return;
          const currentIndex = HERO_IMAGES.indexOf(currentImage);
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
          <motion.div
            animate={prefersReducedMotion ? undefined : {
              x: [0, el.driftX, -el.driftX * 0.45, 0],
              y: [0, -el.driftY, el.driftY * 0.4, 0],
              rotate: [0, 8, -5, 0],
            }}
            transition={{
              duration: el.duration,
              delay: index * 0.12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {index % 4 === 0 ? (
              <div className="w-6 h-6 sm:w-12 sm:h-12 text-white/50"><ButterflySVG /></div>
            ) : index % 4 === 1 ? (
              <div className="w-4 h-4 sm:w-8 sm:h-8 text-white/40"><ButterflySVG /></div>
            ) : index % 4 === 2 ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/50 blur-[2px]" />
            ) : (
              <div className="text-xl sm:text-3xl font-light text-white/40">+</div>
            )}
          </motion.div>
        </div>
      ))}

      {/* Vinyl Element */}
      <AnimatePresence>
        {!hasCustomHero && currentImage === HERO_IMAGES[0] && (
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
        className={`absolute top-[100px] sm:top-32 md:top-48 z-20 flex flex-col w-[calc(100%-3rem)] sm:w-full max-w-2xl ${
          isTitleRightAligned
            ? 'left-auto right-5 sm:right-6 md:right-12 lg:right-24 items-end text-right'
            : 'left-5 right-auto sm:left-12 md:left-24 lg:left-40 items-start text-left'
        }`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, layout: { duration: 0.8, ease: "easeInOut" } }}
        style={{ x: isTitleRightAligned ? rightBlockX : leftBlockX, willChange: "transform" }}
      >
        {/* Top Text */}
        <motion.div layout className={`flex items-center gap-2 sm:gap-4 text-white text-[8px] sm:text-[10px] md:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-4 md:mb-6 opacity-80 ${
          isTitleRightAligned ? 'md:mr-6 lg:mr-12' : ''
        }`}>
          <span className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/60 hidden sm:block"></span>
          <span>{section?.subtitle || 'MOVEMENT. NOT MERCH — NEW SEASON'}</span>
        </motion.div>

        {/* The logo is the page's primary visual heading. */}
        <h1>
          <span className="sr-only">Slugsera premium oversized streetwear made in India</span>
          <motion.img
            layout
            src="/images/texttttlogo.webp"
            alt=""
            aria-hidden="true"
            width="612"
            height="273"
            className="w-[160px] sm:w-[200px] md:w-[320px] lg:w-[420px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
          />
        </h1>
      </motion.div>

      {/* Bottom Left Content Block */}
      <motion.div 
        className="absolute left-4 sm:left-6 md:left-12 lg:left-24 bottom-16 sm:bottom-14 md:bottom-16 lg:bottom-24 z-20 flex flex-col items-start text-left w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ x: leftBlockX, willChange: "transform" }}
      >
        {/* Subtitle */}
        <p className="text-white text-sm sm:text-base md:text-xl font-light tracking-wide mb-3 sm:mb-4 md:mb-8 opacity-90">
          Premium Slow Fashion
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4 md:mb-8">
          <button 
            onClick={handleCta}
            className="bg-white text-[#C0132A] px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-[9px] sm:text-[10px] md:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold flex items-center gap-2 sm:gap-3 hover:bg-gray-100 transition-colors"
          >
            {ctaText} <span className="text-base sm:text-lg leading-none">→</span>
          </button>
          <a 
            href="#about"
            className="text-white text-[9px] sm:text-[10px] md:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium border-b border-white/40 pb-1 hover:border-white transition-colors"
          >
            OUR STORY
          </a>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-white/20 mb-3 sm:mb-4 md:mb-8"></div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 text-white text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase">
          <span className="border border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">100% ORGANIC</span>
          <span className="border border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">SLOW FASHION</span>
          <span className="border border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors">5 DROPS</span>
          <span className="border border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-black/10 backdrop-blur-sm cursor-default hover:bg-white/10 transition-colors hidden sm:inline-block">MOVEMENT. NOT MERCH</span>
        </div>
      </motion.div>

      {/* Navigation Arrows (Glassmorphism) — hidden on very small phones to prevent overlap */}
      {!hasCustomHero && <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-16 md:h-16 hidden sm:flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 hover:scale-105 transition-all duration-300"
        aria-label="Previous Look"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-8 md:h-8">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>}

      {!hasCustomHero && <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-16 md:h-16 hidden sm:flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 hover:scale-105 transition-all duration-300"
        aria-label="Next Look"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 md:w-8 md:h-8">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>}

      {/* Image Toggle Switch (Dots) */}
      {!hasCustomHero && <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-3 md:gap-4">
        {HERO_IMAGES.map((img, idx) => (
          <button
            key={img}
            onClick={() => setCurrentImage(img)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
              currentImage === img 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`View look ${idx + 1}`}
          />
        ))}
      </div>}
    </section>
  );
}
