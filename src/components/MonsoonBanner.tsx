import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const messages = [
  'END OF MONSOON SALE · ALL TEES ₹999',
  'CASH ON DELIVERY AVAILABLE · PAY WHEN IT ARRIVES',
];

export default function MonsoonBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % messages.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  return (
    <Link
      to="/collections/tshirts"
      aria-label="Shop all tees at ₹999 in the End of Monsoon Sale. Cash on delivery available."
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative flex h-12 items-center justify-center overflow-hidden bg-[#C0132A] px-3 text-center text-[10px] font-semibold tracking-[0.02em] text-white sm:h-8 sm:text-xs"
    >
      {reduceMotion ? (
        <span aria-hidden="true">ALL TEES ₹999 · CASH ON DELIVERY AVAILABLE</span>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            aria-hidden="true"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {messages[active]}
          </motion.span>
        </AnimatePresence>
      )}
    </Link>
  );
}
