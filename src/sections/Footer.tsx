import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CDN } from '@/lib/cdn';
import { useAuth } from '@/context/AuthContext';

const footerLinks = {
  shop: [
    { label: 'T-Shirts', href: '/collections/tshirts' },
    { label: 'Shirts', href: '/collections/shirts' },
    { label: 'Hoodies', href: '/collections/hoodies' },
    { label: 'New Arrivals', href: '/collections' },
  ],
  company: [
    { label: 'Our Story', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Values', href: '/#values' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/shipping-policy' },
    { label: 'Returns', href: '/return-policy' },
    { label: 'Size Guide', href: '/faq' },
    { label: 'FAQ', href: '/faq' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/slugsera/', label: 'Instagram' },
];

export default function Footer() {
  const { user } = useAuth();

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
            <Link to="/" aria-label="Slugsera home"><img src={CDN.LOGO} alt="Slug's Era Logo" className="h-9 lg:h-12 w-auto object-contain brightness-0 invert" loading="lazy" decoding="async" /></Link>
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
          <h2 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Shop
          </h2>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.shop.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h2 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Company
          </h2>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.company.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h2 className="text-[9px] lg:text-[10px] font-medium tracking-[0.18em] uppercase text-white mb-3 lg:mb-5">
            Support
          </h2>
          <ul className="flex flex-col gap-2 lg:gap-2.5">
            {footerLinks.support.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-[11px] lg:text-[13px] font-light text-white transition-colors duration-200 hover:text-gray-300"
                >
                  {link.label}
                </Link>
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
        <div className="flex flex-wrap justify-center gap-5">
          <Link to="/shipping-policy" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">Shipping Policy</Link>
          <Link to="/return-policy" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">Return Policy</Link>
          <Link to="/privacy-policy" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">Privacy Policy</Link>
          <Link to="/terms" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">Terms</Link>
          <Link to="/privacy-policy#cookie-settings" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">Cookie Settings</Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-[10px] lg:text-[11px] font-light text-white/40 transition-colors duration-200 hover:text-[#C0132A]"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
