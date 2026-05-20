import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center px-6">
      <SEOHead title="Page Not Found" noindex url="/404" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1 }}
        className="text-center max-w-lg"
      >
        {/* Large 404 */}
        <h1
          className="font-display text-[clamp(80px,15vw,180px)] font-light text-transparent leading-none mb-2"
          style={{ WebkitTextStroke: '1.5px #E8E4E0' }}
        >
          404
        </h1>

        <h2 className="font-display text-2xl lg:text-3xl font-light text-[#1A1A1A] mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-[#888880] mb-8 leading-relaxed max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white text-[11px] font-medium tracking-[0.17em] uppercase px-8 py-4 hover:bg-black transition-colors"
          >
            Back to Home
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => {
              navigate('/collections');
              window.scrollTo(0, 0);
            }}
            className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#888880] border-b border-[#E8E4E0] pb-1 hover:text-[#C0132A] hover:border-[#C0132A] transition-colors"
          >
            Browse Collection
          </button>
        </div>
      </motion.div>
    </div>
  );
}
