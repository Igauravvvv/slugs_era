import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
  isLoading: boolean;
}

export default function Loader({ isLoading }: LoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, visibility: 'hidden' }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 bg-white z-[9000] flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.img
              src="/images/logo.png"
              alt="Slug's Era Logo"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-24 lg:h-32 w-auto object-contain bg-transparent drop-shadow-lg"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="h-0.5 bg-[#C0132A] rounded-sm"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
