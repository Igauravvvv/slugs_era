import { Instagram } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { CDN } from '@/lib/cdn';
import { useAuth } from '@/context/AuthContext';

const footerLinks = {
  shop: [
    { label: 'T-Shirts', href: '/collections', category: 'tshirts' },
    { label: 'Shirts', href: '/collections', category: 'shirts' },
    { label: 'Hoodies', href: '/collections', category: 'hoodies' },
    { label: 'New Arrivals', href: '/collections', category: null },
  ],
  company: [
    { label: 'Our Story', href: '/about' },
    { label: 'Values', href: '#values' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/shipping-policy' },
    { label: 'Returns', href: '/return-policy' },
    { label: 'Size Guide', href: '/faq' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/slugsera/', label: 'Instagram' },
];

export default function Footer() {
  const { setCollectionFilter } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLink = (href: string, category?: string | null) => {
    if (href.startsWith('#')) {
      if (href === '#') return;
      const id = href.slice(1);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else if (href === '/collections' && category !== undefined) {
      setCollectionFilter(category, null);
      navigate('/collections');
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-black pt-12 lg:pt-20 pb-6 lg:pb-10 px-5 lg:px-20 relative overflow-hidden">
      {/* Scrolling Background Logo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        >
          {[...Array(10)].map((_, i) => (
            <img 
              key={i}
              src="/images/TEXT-LOGO.webp" 
              alt=""
              style={{ 
                width: '600px', 
                height: 'auto', 
                flexShrink: 0, 
                marginRight: '60px',
                opacity: 0.15,
                filter: 'grayscale(1) invert(1)',
                mixBlendMode: 'screen',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Top Section */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-6 lg:gap-14 pb-8 lg:pb-14 border-b border-white/[0.08] mb-6 lg:mb-9">
        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src={CDN.LOGO} alt="Slug's Era Logo" className="h-9 lg:h-12 w-auto object-contain brightness-0 invert" />
          </div>
          <p className="font-display text-[11px] lg:text-[13px] italic font-light text-white mb-4 lg:mb-5">
            MOVEMENT. not Merch

          </p>
          <div className="flex flex-col gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group flex items-center gap-3 w-fit"
              >
                <span className="w-[33px] h-[33px] border border-white/20 flex items-center justify-center text-white transition-all duration-200 group-hover:border-[#C0132A] group-hover:bg-[#C0132A]">
                  <social.icon size={14} strokeWidth={1.5} />
                </span>
                <span className="text-[13px] font-light text-white transition-colors duration-200 group-hover:text-gray-300">
                  @slugsera
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Shop
          </h4>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.shop.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleLink(link.href, link.category)}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Company
          </h4>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.company.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleLink(link.href)}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Support
          </h4>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.support.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleLink(link.href)}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <p className="text-[10px] lg:text-xs font-light text-white">
          © 2026 Slug's Era. All rights reserved.
        </p>
        <div className="flex gap-5">
          <button onClick={() => navigate('/shipping-policy')} className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">
            Shipping Policy
          </button>
          <button onClick={() => navigate('/return-policy')} className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">
            Return Policy
          </button>
          {user && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[10px] lg:text-[11px] font-light text-white/40 transition-colors duration-200 hover:text-[#C0132A]"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
