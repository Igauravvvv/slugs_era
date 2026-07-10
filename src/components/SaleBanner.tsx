import { useSiteSection } from '@/context/SiteContentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SaleBanner() {
  const { section: saleBanner, loading } = useSiteSection('sale_banner');

  if (loading) return null;

  // Check if banner is active via meta flags
  const isActive = (saleBanner?.meta as any)?.active === true;
  if (!isActive || !saleBanner?.title) return null;

  const bgColor = (saleBanner.meta as any)?.bgColor || '#C0132A';
  const textColor = (saleBanner.meta as any)?.textColor || '#FFFFFF';
  
  const content = (
    <div 
      className="py-2.5 px-4 w-full text-center overflow-hidden" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
          className="flex items-center gap-8 font-bebas text-lg md:text-xl tracking-[0.2em] whitespace-nowrap"
          style={{ color: textColor }}
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>{saleBanner.title}</span>
              {i < 5 && <span className="opacity-50 text-[10px]">✦</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
      >
        {saleBanner.cta_link ? (
          <Link to={saleBanner.cta_link} className="block w-full hover:opacity-95 transition-opacity">
            {content}
          </Link>
        ) : (
          content
        )}
      </motion.div>
    </AnimatePresence>
  );
}
