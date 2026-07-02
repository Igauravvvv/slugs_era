import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { ShoppingBag, X, Menu, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CDN } from '@/lib/cdn';

interface HeaderProps {
  minimal?: boolean;
}

export default function Header({ minimal = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const [isPastHero, setIsPastHero] = useState(false);
  const redHeaderRef = useRef<HTMLElement>(null);
  const whiteHeaderRef = useRef<HTMLElement>(null);
  const { getCartCount, setCollectionFilter, setAboutMobileVisible } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const currentView = isHomePage ? 'home' : location.pathname.slice(1);
  const { user, signInWithGoogle } = useAuth();
  const cartCount = getCartCount();

  // Solid navbar mode: on non-home pages, or once scrolled past the hero on home
  const isSolid = !isHomePage || isPastHero;

  useEffect(() => {
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      setIsTop(scrollY < 50);

      // Detect if we've scrolled past the hero section
      const heroSection = document.querySelector('#hero, section:first-of-type') as HTMLElement | null;
      const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
      const pastHero = heroBottom <= 76; // 76px = header height
      setIsPastHero(pastHero);

      if (!whiteHeaderRef.current || !redHeaderRef.current) {
        ticking = false;
        return;
      }

      // Once past the hero (or on non-home pages), disable clip-path and use solid bg
      if (!isHomePage || pastHero) {
        whiteHeaderRef.current.style.clipPath = 'none';
        redHeaderRef.current.style.clipPath = 'circle(0px at 0 0)';
        ticking = false;
        return;
      }

      // On home page within the hero — use the smart clip-path color-split logic
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

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    setTimeout(updateHeader, 100);
    setTimeout(updateHeader, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHomePage]);

  const scrollToSection = (id: string) => {
    if (id === 'about') {
      setAboutMobileVisible(true);
    }

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
    setIsMobileMenuOpen(false);
  };

  const goHome = () => {
    navigate('/');
    setAboutMobileVisible(false);
  };

  const goToCart = () => {
    navigate('/cart');
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
        {/* Left Side: Hamburger & Desktop Left Nav */}
        <div className="flex items-center justify-start gap-3 lg:gap-11">
          {!minimal && (
            <button
              className={`lg:hidden ibtn ${textColor}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {!minimal && (
            <nav className={`hidden lg:flex gap-11 items-center ${isTransparent ? 'pointer-events-auto' : ''}`}>
              <div className="relative group/nav">
                <button
                  onClick={() => { setCollectionFilter(null, null); navigate('/collections'); }}
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
                      <button onClick={() => { setCollectionFilter('shirts', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">Shirts</button>
                      <button onClick={() => { setCollectionFilter('tshirts', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">T-Shirts</button>
                      <div className="pt-2 border-t border-[#E8E4E0]">
                        <button onClick={() => { setCollectionFilter('hoodies', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors mb-2 block w-full">Hoodies</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'embroidery'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Embroidery</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'patchwork'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Patchwork</button>
                        <button onClick={() => { setCollectionFilter('hoodies', 'printed'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Printed</button>
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

        {/* Center: Desktop & Mobile Logo */}
        <div className={`absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex items-center justify-center ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
          <button onClick={() => scrollToSection('hero')} className="flex items-center">
            <motion.img
              src={CDN.LOGO}
              alt="Slug's Era Logo"
              className="h-[52px] lg:h-[72px] w-auto object-contain bg-transparent drop-shadow-md transition-all duration-500 delay-100"
              style={{ filter: logoFilter }}
              whileHover={{ scale: 1.05, y: 10 }}
            />
          </button>
        </div>

        {/* Right Side: Icons */}
        <div className={`flex items-center justify-end gap-4 ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
          <button
            onClick={goToCart}
            className={`cartbtn relative lg:w-9 lg:h-9 h-auto py-1.5 px-3 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 gap-1.5 ${theme === 'white' ? 'bg-white text-[#C0132A]' : 'bg-[#C0132A] text-white'
              }`}
          >
            <ShoppingBag size={15} strokeWidth={1.5} className="hidden lg:block" />
            <span className="text-[12px] font-medium tracking-wider lg:hidden">
              Cart ({cartCount})
            </span>
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[9px] w-4 h-4 rounded-full hidden lg:flex items-center justify-center font-medium ${theme === 'white' ? 'bg-[#1A1A1A] text-white' : 'bg-[#1A1A1A] text-white'
                }`}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (user) { navigate('/profile'); window.scrollTo(0, 0); }
              else signInWithGoogle();
            }}
            className={`ibtn hidden lg:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105 ${textColor} ${theme === 'white' ? 'bg-white/10' : 'bg-[#1A1A1A]/5'}`}
          >
            <User size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isSolid ? (
        /* ── SOLID NAVBAR: fully standalone, clean white navbar ── */
        <header className="fixed top-0 left-0 right-0 z-[501] bg-white border-b border-[#E8E4E0] shadow-[0_1px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex lg:grid lg:grid-cols-3 items-center justify-between px-6 lg:px-16 h-[76px] w-full">

            {/* Left: Hamburger + Desktop Nav */}
            <div className="flex items-center justify-start gap-3 lg:gap-11">
              {!minimal && (
                <button className="lg:hidden text-[#C0132A]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
              {!minimal && (
                <nav className="hidden lg:flex gap-11 items-center">
                  {/* Collection with dropdown */}
                  <div className="relative group/nav">
                    <button
                      onClick={() => { setCollectionFilter(null, null); navigate('/collections'); }}
                      className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#C0132A] opacity-85 hover:opacity-100 relative transition-opacity duration-200 group/link"
                    >
                      Collection
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C0132A] transition-all duration-300 group-hover/link:w-full" style={{ transitionTimingFunction: 'var(--ease)' }} />
                    </button>
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 pt-4 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 z-[502]">
                      <div className="bg-white border border-[#E8E4E0] shadow-xl rounded-sm p-4 w-48 flex flex-col gap-3">
                        <button onClick={() => { setCollectionFilter('shirts', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">Shirts</button>
                        <button onClick={() => { setCollectionFilter('tshirts', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">T-Shirts</button>
                        <div className="pt-2 border-t border-[#E8E4E0]">
                          <button onClick={() => { setCollectionFilter('hoodies', null); navigate('/collections'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors mb-2 block w-full">Hoodies</button>
                          <button onClick={() => { setCollectionFilter('hoodies', 'embroidery'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Embroidery</button>
                          <button onClick={() => { setCollectionFilter('hoodies', 'patchwork'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Patchwork</button>
                          <button onClick={() => { setCollectionFilter('hoodies', 'printed'); navigate('/collections'); }} className="text-left text-[10px] pl-3 uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C0132A] transition-colors block w-full py-1">Printed</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {[{ label: 'Our Story', id: 'about' }, { label: 'Values', id: 'values' }].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#C0132A] opacity-85 hover:opacity-100 relative transition-opacity duration-200 group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C0132A] transition-all duration-300 group-hover:w-full" style={{ transitionTimingFunction: 'var(--ease)' }} />
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex items-center justify-center">
              <button onClick={() => scrollToSection('hero')} className="flex items-center">
                <motion.img
                  src={CDN.LOGO}
                  alt="Slug's Era Logo"
                  className="h-[52px] lg:h-[72px] w-auto object-contain bg-transparent drop-shadow-md transition-all duration-500"
                  style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(74%) saturate(4422%) hue-rotate(343deg) brightness(85%) contrast(100%)' }}
                  whileHover={{ scale: 1.05, y: 10 }}
                />
              </button>
            </div>

            {/* Right: Cart + User */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={goToCart}
                className="cartbtn relative lg:w-9 lg:h-9 h-auto py-1.5 px-3 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 gap-1.5 bg-[#C0132A] text-white"
              >
                <ShoppingBag size={15} strokeWidth={1.5} className="hidden lg:block" />
                <span className="text-[12px] font-medium tracking-wider lg:hidden">Cart ({cartCount})</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] w-4 h-4 rounded-full hidden lg:flex items-center justify-center font-medium bg-[#1A1A1A] text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { if (user) { navigate('/profile'); window.scrollTo(0, 0); } else signInWithGoogle(); }}
                className="ibtn hidden lg:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105 text-[#C0132A] bg-[#1A1A1A]/5 hover:bg-[#C0132A]/10"
              >
                <User size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* ── HERO CLIP-PATH SYSTEM: only on home page while hero is visible ── */
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

          {/* Transparent Layer exclusively for Dropdowns */}
          <header className="fixed top-0 left-0 right-0 z-[501] pointer-events-none">
            {renderHeaderContent('transparent')}
          </header>
        </>
      )}

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
                  onClick={() => { setCollectionFilter(null, null); navigate('/collections'); setIsMobileMenuOpen(false); }}
                  className="text-sm font-medium tracking-[0.15em] uppercase text-[#1A1A1A] text-left w-full mb-3"
                >
                  Collection
                </button>
                <div className="flex flex-col gap-3 pl-4">
                  <button onClick={() => { setCollectionFilter('shirts', null); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left">Shirts</button>
                  <button onClick={() => { setCollectionFilter('tshirts', null); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left">T-Shirts</button>
                  <div className="pt-2">
                    <button onClick={() => { setCollectionFilter('hoodies', null); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A]/80 text-left w-full mb-2">Hoodies</button>
                    <div className="flex flex-col gap-2 pl-3">
                      <button onClick={() => { setCollectionFilter('hoodies', 'embroidery'); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Embroidery</button>
                      <button onClick={() => { setCollectionFilter('hoodies', 'patchwork'); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Patchwork</button>
                      <button onClick={() => { setCollectionFilter('hoodies', 'printed'); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-[10px] tracking-wider uppercase text-[#1A1A1A]/60 text-left">Printed</button>
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
