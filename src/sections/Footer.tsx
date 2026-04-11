import { Instagram } from 'lucide-react';
import { useStore } from '@/store';
import { motion } from 'framer-motion';

const footerLinks = {
  shop: [
    { label: 'T-Shirts', href: '/collections/t-shirts' },
    { label: 'Shirts', href: '/collections/shirts' },
    { label: 'Hoodies', href: '/collections/hoodies' },
    { label: 'New Arrivals', href: '/collections/all' },
  ],
  company: [
    { label: 'Our Story', href: '#about' },
    { label: 'Values', href: '#values' },
  ],
  support: [
    { label: 'Contact Us', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Size Guide', href: '#' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/slugsera/', label: 'Instagram' },
];

export default function Footer() {
  const { setView, setCollectionFilter, currentView } = useStore();

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      if (href === '#') return;
      if (currentView !== 'home') {
        setView('home');
        setTimeout(() => {
          const element = document.getElementById(href.slice(1));
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        const element = document.getElementById(href.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else if (href.startsWith('/collections')) {
      const category = href.split('/').pop();
      const mappedCategory = category === 'all' ? null : category?.replace('-', '') || null;
      setCollectionFilter(mappedCategory, null);
      setView('collections');
      window.scrollTo(0, 0);
    } else {
      window.location.href = href;
    }
  };

  return (
    <footer className="bg-black pt-12 lg:pt-20 pb-6 lg:pb-10 px-5 lg:px-20 relative overflow-hidden">
      {/* Background Text Logo */}
      <div className="absolute top-[60%] left-0 w-full -translate-y-1/2 flex items-center pointer-events-none opacity-10 z-0 overflow-hidden">
        <motion.div 
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-4 lg:px-6">
              <img src="/images/TEXT%20LOGO.png" alt="" className="w-[800px] lg:w-[1200px] max-w-none shrink-0 object-contain invert brightness-0" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Top Section */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-6 lg:gap-14 pb-8 lg:pb-14 border-b border-white/[0.08] mb-6 lg:mb-9">
        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src="/images/logo.png" alt="Slug's Era Logo" className="h-9 lg:h-12 w-auto object-contain brightness-0 invert" />
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
                  onClick={() => scrollToSection(link.href)}
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
                  onClick={() => scrollToSection(link.href)}
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
                  onClick={() => scrollToSection(link.href)}
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
          <a href="#" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">
            Privacy Policy
          </a>
          <a href="#" className="text-[10px] lg:text-[11px] font-light text-white transition-colors duration-200 hover:text-gray-300">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
