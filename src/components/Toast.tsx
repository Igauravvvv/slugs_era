import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, ShoppingBag, Heart } from 'lucide-react';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'cart' | 'wishlist';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto remove
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

const toastConfig: Record<ToastType, { icon: React.ElementType; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  cart: { icon: ShoppingBag, color: '#C0132A', bg: 'rgba(192,19,42,0.08)' },
  wishlist: { icon: Heart, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 bg-white shadow-xl border border-[#E8E4E0] max-w-sm"
              style={{ borderLeft: `3px solid ${config.color}` }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: config.bg }}
              >
                <Icon size={16} style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{toast.message}</p>
                {toast.description && (
                  <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="mt-0.5 text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
