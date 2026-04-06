import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { Search, ShoppingBag, X, Menu } from 'lucide-react';

interface HeaderProps {
  minimal?: boolean;
}

export default function Header({ minimal = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const redHeaderRef = useRef<HTMLElement>(null);
  const whiteHeaderRef = useRef<HTMLElement>(null);
  const { getCartCount, setView, currentView, setCollectionFilter } = useStore();
  const cartCount = getCartCount();

  useEffect(() => {
    let ticking = false;

    const updateClipPath = () => {
      if (!whiteHeaderRef.current || !redHeaderRef.current) return;

      const elements = Array.from(document.querySelectorAll('section, footer'));
      const darkRects: { top: number; bottom: number }[] = [];

      elements.forEach((el) => {
        const className = el.className || '';
        const isLight = className.includes('bg-white') || className.includes('bg-[#F9F7F5]');

        if (!isLight) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            darkRects.push({
              top: Math.max(0, rect.top),
              bottom: Math.min(window.innerHeight, rect.bottom)
            });
          }
        }
      });

      // Sort and merge overlapping dark rectangles
      darkRects.sort((a, b) => a.top - b.top);
      const mergedDark: { top: number; bottom: number }[] = [];
      darkRects.forEach((r) => {
        if (mergedDark.length === 0) {
          mergedDark.push({ ...r });
        } else {
          const last = mergedDark[mergedDark.length - 1];
          if (r.top <= last.bottom) {
            last.bottom = Math.max(last.bottom, r.bottom);
          } else {
            mergedDark.push({ ...r });
          }
        }
      });

      let darkPath = '';
      mergedDark.forEach((r) => {
        darkPath += `M 0 ${r.top} H ${window.innerWidth} V ${r.bottom} H 0 Z `;
      });

      // Light path is the inverse (all spaces not covered by dark sections)
      let lightPath = '';
      let currentY = 0;
      mergedDark.forEach((r) => {
        if (r.top > currentY) {
          lightPath += `M 0 ${currentY} H ${window.innerWidth} V ${r.top} H 0 Z `;
        }
        currentY = r.bottom;
      });
      if (currentY < window.innerHeight) {
        lightPath += `M 0 ${currentY} H ${window.innerWidth} V ${window.innerHeight} H 0 Z `;
      }

      // Apply paths
      if (darkPath) {
        whiteHeaderRef.current.style.clipPath = `path('${darkPath.trim()}')`;
      } else {
        whiteHeaderRef.current.style.clipPath = `circle(0px at 0 0)`;
      }

      if (lightPath) {
        redHeaderRef.current.style.clipPath = `path('${lightPath.trim()}')`;
      } else {
        redHeaderRef.current.style.clipPath = `circle(0px at 0 0)`;
      }

      setIsTop(window.scrollY < 50);

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateClipPath);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // Initial check (give DOM a moment to paint)
    setTimeout(updateClipPath, 100);
    setTimeout(updateClipPath, 500); // Failsafe for slow loading fonts/images

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setView('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const goHome = () => {
    setView('home');
    window.scrollTo(0, 0);
  };

  const goToCart = () => {
    setView('cart');
    window.scrollTo(0, 0);
  };

  // Helper function to render header contents, reducing code duplication
  const renderHeaderContent = (theme: 'red' | 'white' | 'transparent') => {
    // If 'transparent', force invisible text to keep exact layout spacing but avoid rendering double text
    const textColor = theme === 'transparent' ? 'text-transparent' : (theme === 'white' ? 'text-white' : 'text-[#C0132A]');
    // Use valid raw CSS filter strings
    const logoFilter = theme === 'white'
      ? 'brightness(0) invert(1)'
      : 'brightness(0) saturate(100%) invert(18%) sepia(74%) saturate(4422%) hue-rotate(343deg) brightness(85%) contrast(100%)';

    const isTransparent = theme === 'transparent';

    return (
      <div className={`flex lg:grid lg:grid-cols-3 items-center justify-between px-6 lg:px-16 h-[76px] w-full bg-transparent ${isTransparent ? 'pointer-events-none' : ''}`}>
        {/* Left Side: Mobile Logo & Desktop Left Nav */}
        <div className="flex items-center justify-start gap-11">
          <button onClick={goHome} className={`flex items-center lg:hidden ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
            {theme === 'red' && currentView === 'home' && isTop ? (
              <video
                src="/images/logo's animated.mp4"
                autoPlay
                muted
                playsInline
                ref={(el) => {
                  if (el && !el.dataset.started) {
                    el.dataset.started = 'true';
                    el.currentTime = 0.2;
                    el.play().catch(() => { });
                  }
                }}
                className="h-10 w-auto object-contain object-left scale-[2.3] origin-left translate-x-[2px] translate-y-2 bg-transparent mix-blend-multiply transition-all duration-500"
              />
            ) : (
              <motion.img
                src="/images/logo.png"
                alt="Slug's Era Logo"
                className="h-10 w-auto object-contain bg-transparent transition-all duration-500 delay-100"
                style={{ filter: logoFilter }}
              />
            )}
          </button>

          {!minimal && (
            <nav className={`hidden lg:flex gap-11 items-center ${isTransparent ? 'pointer-events-auto' : ''}`}>
              <div className="relative group/nav">
                <button
                  onClick={() => { setCollectionFilter(null, null); setView('collections'); }}
                  className={`text-[11px] font-medium tracking-[0.15em] uppercase ${textColor} ${!isTransparent ? 'opacity-85 hover:opacity-100' : ''} relative transition-opacity duration-200 group/link`}
                >
                  Collection
                  {!isTransparent && (
                    <span className={`absolute -bottom-1 left-0 w-0 h-px ${theme === 'white' ? 'bg-white' : 'bg-[#C0132A]'} transition-all duration-300 group-hover/link:w-full`}
                      style={{ transitionTimingFunction: 'var(--ease)' }} />
                  )}
                </button>

                {/* Dropdown Menu - ONLY render in the transparent (unclipped) layer to overcome clip-path z-index bug */}
                {isTransparent && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-[502]">
                    <div className="bg-white border border-[#E8E4E0] shadow-xl rounded-sm p-4 w-48 flex flex-col gap-3">
                      <button onClick={() => { setCollectionFilter('shirts', null); setView('collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">Shirts</button>
                      <button onClick={() => { setCollectionFilter('tshirts', null); setView('collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">T-Shirts</button>
                      <div className="pt-2 border-t border-[#E8E4E0]">
                        <button onClick={() => { setCollectionFilter('hoodies', null); setView('collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors mb-2 block w-full">Hoodies</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'embroidery'); setView('collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Embroidery</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'patchwork'); setView('collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Patchwork</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'printed'); setView('collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Printed</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {[
                { label: 'Our Story', id: 'about' },
                { label: 'Values', id: 'values' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-[11px] font-medium tracking-[0.15em] uppercase ${textColor} ${!isTransparent ? 'opacity-85 hover:opacity-100' : ''} relative transition-opacity duration-200 group`}
                >
                  {item.label}
                  {!isTransparent && (
                    <span className={`absolute -bottom-1 left-0 w-0 h-px ${theme === 'white' ? 'bg-white' : 'bg-[#C0132A]'} transition-all duration-300 group-hover:w-full`}
                      style={{ transitionTimingFunction: 'var(--ease)' }} />
                  )}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Center: Desktop Logo */}
        <div className={`hidden lg:flex items-center justify-center ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
          <button onClick={goHome} className="flex items-center">
            {theme === 'red' && currentView === 'home' && isTop ? (
              <video
                src="/images/logo's animated.mp4"
                autoPlay
                muted
                playsInline
                ref={(el) => {
                  if (el && !el.dataset.started) {
                    el.dataset.started = 'true';
                    el.currentTime = 0.2;
                    el.play().catch(() => { });
                  }
                }}
                className="h-14 lg:h-[72px] w-auto object-contain object-center scale-[2.3] lg:scale-[2.3] translate-x-[2px] translate-y-2 lg:translate-y-3 bg-transparent mix-blend-multiply transition-transform duration-500"
              />
            ) : (
              <motion.img
                src="/images/logo.png"
                alt="Slug's Era Logo"
                className="h-14 lg:h-[72px] w-auto object-contain bg-transparent drop-shadow-md transition-all duration-500 delay-100"
                style={{ filter: logoFilter }}
                whileHover={{ scale: 1.05, y: 10 }}
              />
            )}
          </button>
        </div>

        {/* Right Side: Icons */}
        <div className={`flex items-center justify-end gap-4 ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
          {!minimal && (
            <button className={`ibtn hidden lg:flex ${textColor}`}>
              <Search size={17} strokeWidth={1.5} />
            </button>
          )}

          <button
            onClick={goToCart}
            className={`cartbtn relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${theme === 'white' ? 'bg-white text-[#C0132A]' : 'bg-[#C0132A] text-white'
              }`}
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium ${theme === 'white' ? 'bg-[#1A1A1A] text-white' : 'bg-[#1A1A1A] text-white'
                }`}>
                {cartCount}
              </span>
            )}
          </button>

          {!minimal && (
            <button
              className={`lg:hidden ibtn ${textColor}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Base Header: Red Theme for Light Backgrounds */}
      <header
        ref={redHeaderRef}
        className="fixed top-0 left-0 right-0 z-[498] pointer-events-auto"
      >
        {renderHeaderContent('red')}
      </header>

      {/* Overlaid Header: White Theme for Dark Backgrounds */}
      <header
        ref={whiteHeaderRef}
        className="fixed top-0 left-0 right-0 z-[499] pointer-events-auto mix-blend-normal"
      >
        {renderHeaderContent('white')}
      </header>

      {/* Transparent Layer exclusively for Dropdowns so they don't get clipped by the path crop */}
      <header className="fixed top-0 left-0 right-0 z-[501] pointer-events-none">
        {renderHeaderContent('transparent')}
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && !minimal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[76px] left-0 right-0 bg-white z-[498] border-b border-[#E8E4E0] p-6 lg:hidden"
          >
            <nav className="flex flex-col gap-4">
              <div className="py-2 border-b border-[#E8E4E0]/50">
                <button
                  onClick={() => { setCollectionFilter(null, null); setView('collections'); setIsMobileMenuOpen(false); }}
                  className="text-sm font-medium tracking-[0.15em] uppercase text-[#1A1A1A] text-left w-full mb-3"
                >
                  Collection
                </button>
                <div className="flex flex-col gap-3 pl-4">
                  <button onClick={() => { setCollectionFilter('shirts', null); setView('collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left">Shirts</button>
                  <button onClick={() => { setCollectionFilter('tshirts', null); setView('collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left">T-Shirts</button>
                  <div className="pt-2">
                    <button onClick={() => { setCollectionFilter('hoodies', null); setView('collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left w-full mb-2">Hoodies</button>
                    <div className="flex flex-col gap-2 pl-3">
                      <button onClick={() => { setCollectionFilter('hoodies', 'embroidery'); setView('collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Embroidery</button>
                      <button onClick={() => { setCollectionFilter('hoodies', 'patchwork'); setView('collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Patchwork</button>
                      <button onClick={() => { setCollectionFilter('hoodies', 'printed'); setView('collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Printed</button>
                    </div>
                  </div>
                </div>
              </div>

              {[
                { label: 'Our Story', id: 'about' },
                { label: 'Values', id: 'values' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium tracking-[0.15em] uppercase text-[#1A1A1A] text-left py-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
