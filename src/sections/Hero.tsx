import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSection } from '@/context/SiteContentContext';

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
  const [currentImage, setCurrentImage] = useState<(typeof HERO_IMAGES)[number]>(HERO_IMAGES[0]);

  const { section } = useSiteSection('hero');
  const desktopHeroImage = section?.image_url || '';
  const mobileHeroImage = typeof section?.meta?.mobile_image_url === 'string' ? section.meta.mobile_image_url : '';
  const hasCustomHero = Boolean(desktopHeroImage || mobileHeroImage);

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
        className="absolute top-[100px] left-5 right-auto sm:top-32 sm:left-12 md:top-48 md:left-24 lg:left-40 z-20 flex w-[calc(100%-3rem)] max-w-2xl flex-col items-start text-left"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {/* Top Text */}
        <div className="mb-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.15em] text-white opacity-80 sm:mb-4 sm:gap-4 sm:text-[10px] sm:tracking-[0.2em] md:mb-6 md:text-xs">
          <span className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/60 hidden sm:block"></span>
          <span>{section?.subtitle || 'MOVEMENT. NOT MERCH — NEW SEASON'}</span>
        </div>

        <h1 className="sr-only">Slugsera premium oversized streetwear made in India</h1>
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
