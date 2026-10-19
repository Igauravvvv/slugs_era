import { motion, useReducedMotion } from 'framer-motion';

const BLUE_TURTLE_DESKTOP_SRCSET = '/images/cdn/hero-blue-turtle-desktop-640.webp 640w, /images/cdn/hero-blue-turtle-desktop-1280.webp 1280w, /images/cdn/hero-blue-turtle-desktop-1920.webp 1920w';
const BLUE_TURTLE_MOBILE_SRCSET = '/images/cdn/hero-blue-turtle-mobile-640.webp 640w, /images/cdn/hero-blue-turtle-mobile-960.webp 960w, /images/cdn/hero-blue-turtle-mobile-1440.webp 1440w';

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative w-full h-[100svh] min-h-[520px] overflow-hidden bg-[#76c6df] flex flex-col items-center justify-center"
    >
      <picture className="absolute inset-0 block w-full h-full">
        <source media="(max-width: 767px)" srcSet={BLUE_TURTLE_MOBILE_SRCSET} sizes="100vw" />
        <img
          src="/images/blue_turtle_hero_desktop.webp"
          srcSet={BLUE_TURTLE_DESKTOP_SRCSET}
          sizes="100vw"
          alt="Model wearing the blue Slugsera Slow Steady Savage turtle T-shirt at sea"
          width="2400"
          height="1351"
          className="absolute inset-0 w-full h-full object-cover object-center md:object-[center_64%]"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/45 to-transparent" />
      <motion.div
        className="absolute bottom-10 left-6 right-6 z-20 sm:bottom-12 sm:left-12 md:bottom-16 md:left-24"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-4 text-white drop-shadow-md sm:gap-6"
        >
          <motion.span
            aria-hidden="true"
            className="h-px w-9 origin-left bg-white/80 sm:w-14"
            animate={reduceMotion ? undefined : { scaleX: [0.6, 1, 0.6], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="font-display text-[clamp(24px,4vw,52px)] leading-none tracking-tight">
            <span className="font-semibold">MOVEMENT.</span>{' '}
            <span className="font-light italic">NOT MERCH.</span>
          </p>
        </motion.div>
        <h1 className="sr-only">Slugsera premium oversized streetwear made in India</h1>
      </motion.div>
    </section>
  );
}
