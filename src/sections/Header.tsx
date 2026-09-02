import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { ShoppingBag, X, Menu, User, Settings } from 'lucide-react';
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
  const customerFirstName = user
    ? String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Account')
        .trim()
        .split(/\s+/)[0]
    : null;

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobileMenuOpen]);

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
    // Render the raster logo as an alpha mask. Unlike CSS filter chains, this
    // keeps the brand red consistent between wide-gamut iPhone displays and
    // standard desktop panels.
    const logoColor = theme === 'white' ? '#FFFFFF' : '#C0132A';

    const isTransparent = theme === 'transparent';

    return (
      <div className={`flex lg:grid lg:grid-cols-3 items-center justify-between px-6 lg:px-16 h-[76px] w-full bg-transparent ${isTransparent ? 'pointer-events-none' : ''}`}>
        {/* Left Side: Hamburger & Desktop Left Nav */}
        <div className="flex items-center justify-start gap-3 lg:gap-11">
          {!minimal && (
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
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
                      <button onClick={() => { setCollectionFilter('shirts', null); navigate('/collections/shirts'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">Shirts</button>
                      <button onClick={() => { setCollectionFilter('tshirts', null); navigate('/collections/tshirts'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">T-Shirts</button>
                      <div className="pt-2 border-t border-[#E8E4E0]">
                        <button onClick={() => { setCollectionFilter('hoodies', null); navigate('/collections/hoodies'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors mb-2 block w-full">Hoodies</button>
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
          <button type="button" aria-label="Go to Slug's Era home" onClick={() => scrollToSection('hero')} className="flex items-center">
            <motion.span
              role="img"
              aria-label="Slug's Era Logo"
              className="block h-[46px] w-[76px] transition-transform duration-500 delay-100 lg:h-[72px] lg:w-[123px]"
              style={{
                backgroundColor: logoColor,
                WebkitMaskImage: `url(${CDN.LOGO})`,
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskImage: `url(${CDN.LOGO})`,
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
              }}
              whileHover={{ scale: 1.05, y: 10 }}
            />
          </button>
        </div>

        {/* Right Side: Icons */}
        <div className={`flex items-center justify-end gap-1.5 lg:gap-4 ${isTransparent ? 'opacity-0 pointer-events-none' : ''}`}>
          <button
            type="button"
            aria-label={user ? 'Open your profile' : 'Sign in'}
            onClick={() => { if (user) { navigate('/profile'); window.scrollTo(0, 0); } else signInWithGoogle(); }}
            className={`flex h-9 w-9 items-center justify-center gap-1.5 rounded-full px-0 transition-all active:scale-[0.97] min-[440px]:w-auto min-[440px]:px-3 lg:hidden ${theme === 'white' ? 'bg-[#710015]/75 text-white backdrop-blur-sm' : 'bg-[#C0132A]/10 text-[#C0132A]'}`}
          >
            <User size={14} strokeWidth={1.6} />
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.1em] min-[440px]:inline">{user ? 'Account' : 'Sign in'}</span>
          </button>

          <button
            type="button"
            aria-label={`Open shopping cart with ${cartCount} items`}
            onClick={goToCart}
            className={`cartbtn relative flex h-9 w-9 items-center justify-center rounded-full p-0 transition-all duration-200 hover:scale-105 ${theme === 'white' ? 'bg-white text-[#C0132A]' : 'bg-[#C0132A] text-white'
              }`}
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium ${theme === 'white' ? 'bg-[#1A1A1A] text-white' : 'bg-[#1A1A1A] text-white'
                }`}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label={user ? 'Open your profile' : 'Sign in'}
            onClick={() => {
              if (user) { navigate('/profile'); window.scrollTo(0, 0); }
              else signInWithGoogle();
            }}
            className={`ibtn hidden lg:flex h-9 items-center justify-center gap-2 rounded-full px-3.5 transition-all duration-200 hover:scale-[1.03] ${textColor} ${theme === 'white' ? 'bg-white/10' : 'bg-[#1A1A1A]/5'}`}
          >
            <User size={15} strokeWidth={1.5} />
            <span className="max-w-28 truncate text-[10px] font-medium uppercase tracking-[0.12em]">{user ? customerFirstName : 'Sign in'}</span>
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
                <button type="button" aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMobileMenuOpen} className="lg:hidden text-[#C0132A]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
                        <button onClick={() => { setCollectionFilter('shirts', null); navigate('/collections/shirts'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">Shirts</button>
                        <button onClick={() => { setCollectionFilter('tshirts', null); navigate('/collections/tshirts'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors">T-Shirts</button>
                        <div className="pt-2 border-t border-[#E8E4E0]">
                          <button onClick={() => { setCollectionFilter('hoodies', null); navigate('/collections/hoodies'); }} className="text-left text-xs uppercase tracking-wider text-[#1A1A1A] hover:text-[#C0132A] transition-colors mb-2 block w-full">Hoodies</button>
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
              <button type="button" aria-label="Go to Slug's Era home" onClick={() => scrollToSection('hero')} className="flex items-center">
                <motion.span
                  role="img"
                  aria-label="Slug's Era Logo"
                  className="block h-[46px] w-[76px] bg-[#C0132A] transition-transform duration-500 lg:h-[72px] lg:w-[123px]"
                  style={{
                    WebkitMaskImage: `url(${CDN.LOGO})`,
                    WebkitMaskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskImage: `url(${CDN.LOGO})`,
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    maskSize: 'contain',
                  }}
                  whileHover={{ scale: 1.05, y: 10 }}
                />
              </button>
            </div>

            {/* Right: Cart + User */}
            <div className="flex items-center justify-end gap-1.5 lg:gap-4">
              <button
                type="button"
                aria-label={user ? 'Open your profile' : 'Sign in'}
                onClick={() => { if (user) { navigate('/profile'); window.scrollTo(0, 0); } else signInWithGoogle(); }}
                className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-full bg-[#C0132A]/10 px-0 text-[#C0132A] transition-all active:scale-[0.97] min-[440px]:w-auto min-[440px]:px-3 lg:hidden"
              >
                <User size={14} strokeWidth={1.6} />
                <span className="hidden text-[9px] font-semibold uppercase tracking-[0.1em] min-[440px]:inline">{user ? 'Account' : 'Sign in'}</span>
              </button>

              <button
                type="button"
                aria-label={`Open shopping cart with ${cartCount} items`}
                onClick={goToCart}
                className="cartbtn relative flex h-9 w-9 items-center justify-center rounded-full bg-[#C0132A] p-0 text-white transition-all duration-200 hover:scale-105"
              >
                <ShoppingBag size={15} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label={user ? 'Open your profile' : 'Sign in'}
                onClick={() => { if (user) { navigate('/profile'); window.scrollTo(0, 0); } else signInWithGoogle(); }}
                className="ibtn hidden lg:flex h-9 items-center justify-center gap-2 rounded-full px-3.5 transition-all duration-200 hover:scale-[1.03] text-[#C0132A] bg-[#1A1A1A]/5 hover:bg-[#C0132A]/10"
              >
                <User size={15} strokeWidth={1.5} />
                <span className="max-w-28 truncate text-[10px] font-medium uppercase tracking-[0.12em]">{user ? customerFirstName : 'Sign in'}</span>
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
          <>
            <motion.button
              key="mobile-menu-backdrop"
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="fixed inset-x-0 bottom-0 top-[76px] z-[499] bg-black/20 backdrop-blur-[1px] lg:hidden"
            />
            <motion.div
              key="mobile-menu-panel"
              initial={{ opacity: 0, y: -14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-2 top-[76px] z-[500] max-h-[calc(100dvh-92px)] overflow-y-auto rounded-b-[28px] bg-[#F9F7F5] shadow-[0_24px_60px_rgba(26,26,26,0.20)] lg:hidden"
            >
            <nav className="mx-auto w-full max-w-lg px-5 pb-5 pt-6">
              <div className="mb-6">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C0132A]">Menu</p>
                <h2 className="font-serif text-[28px] font-light leading-tight text-[#1A1A1A]">Explore Slugsera</h2>
              </div>

              <div>
                <div className="flex items-center justify-between border-b border-[#DCD6D0] pb-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">Shop</p>
                  <button onClick={() => { setCollectionFilter(null, null); navigate('/collections'); setIsMobileMenuOpen(false); }} className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C0132A]">View all</button>
                </div>
                {[
                  { label: 'T-Shirts', category: 'tshirts', href: '/collections/tshirts' },
                  { label: 'Shirts', category: 'shirts', href: '/collections/shirts' },
                  { label: 'Hoodies', category: 'hoodies', href: '/collections/hoodies' },
                ].map((item) => (
                  <button key={item.category} onClick={() => { setCollectionFilter(item.category, null); navigate(item.href); setIsMobileMenuOpen(false); }} className="group flex w-full items-center justify-between border-b border-[#E8E3DE] py-4 text-left transition-colors active:text-[#C0132A]">
                    <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A] group-active:text-[#C0132A]">{item.label}</span>
                    <span className="text-sm text-[#C0132A] transition-transform group-active:translate-x-1">→</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-[#DCD6D0] py-5">
                {[
                  { label: 'Our Story', id: 'about' },
                  { label: 'Our Values', id: 'values' },
                ].map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-[#1A1A1A]/70 transition-colors active:text-[#C0132A]">
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_30px_rgba(26,26,26,0.05)] ring-1 ring-[#E8E3DE]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C0132A] text-white"><User size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[16px] text-[#1A1A1A]">{user ? `Hey, ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'}` : 'Your Slugsera account'}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[#1A1A1A]/40">Orders, saved pieces & details</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-5 border-t border-[#EEE9E4] pt-3.5">
                  <button onClick={() => { setIsMobileMenuOpen(false); if (user) { navigate('/profile'); window.scrollTo(0, 0); } else signInWithGoogle(); }} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#C0132A]">
                    <User size={12} /> {user ? 'My Profile' : 'Sign In'}
                  </button>
                  {user && (
                    <button onClick={() => { navigate('/profile?tab=settings'); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#1A1A1A]/55">
                      <Settings size={12} /> Settings
                    </button>
                  )}
                </div>
              </div>
            </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
