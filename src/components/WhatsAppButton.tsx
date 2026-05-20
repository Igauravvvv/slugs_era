import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const WHATSAPP_NUMBER = '917701815002';
const DEFAULT_MESSAGE = "Hi! I have a question about Slug's Era 🐌";

export default function WhatsAppButton() {
  const location = useLocation();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl group"
      style={{
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        boxShadow: '0 4px 24px rgba(37, 211, 102, 0.4)',
      }}
    >
      <MessageCircle size={24} className="text-white" fill="white" strokeWidth={0} />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-white text-[#1A1A1A] text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with us
      </span>

      {/* Ping animation */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#25D366' }} />
    </motion.a>
  );
}
