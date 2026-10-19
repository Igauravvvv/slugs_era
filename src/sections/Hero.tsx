import { useSiteSection } from '@/context/SiteContentContext';

const BLUE_TURTLE_DESKTOP_SRCSET = '/images/cdn/hero-blue-turtle-desktop-640.webp 640w, /images/cdn/hero-blue-turtle-desktop-1280.webp 1280w, /images/cdn/hero-blue-turtle-desktop-1920.webp 1920w';
const BLUE_TURTLE_MOBILE_SRCSET = '/images/cdn/hero-blue-turtle-mobile-640.webp 640w, /images/cdn/hero-blue-turtle-mobile-960.webp 960w, /images/cdn/hero-blue-turtle-mobile-1440.webp 1440w';

export default function Hero() {
  const { section } = useSiteSection('hero');

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

      <div className="absolute top-[100px] left-5 right-auto sm:top-32 sm:left-12 md:top-48 md:left-24 lg:left-40 z-20 flex w-[calc(100%-3rem)] max-w-2xl flex-col items-start text-left">
        <div className="mb-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.15em] text-white opacity-80 sm:mb-4 sm:gap-4 sm:text-[10px] sm:tracking-[0.2em] md:mb-6 md:text-xs">
          <span className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/60 hidden sm:block" />
          <span>{section?.subtitle || 'MOVEMENT. NOT MERCH — NEW SEASON'}</span>
        </div>
        <h1 className="sr-only">Slugsera premium oversized streetwear made in India</h1>
      </div>
    </section>
  );
}
