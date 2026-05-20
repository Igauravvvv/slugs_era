import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useDashboardToast } from '@/store/dashboardToast';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: { bg: 'rgba(76, 175, 80, 0.12)', border: 'rgba(76, 175, 80, 0.3)', text: '#4CAF50' },
  error: { bg: 'rgba(244, 67, 54, 0.12)', border: 'rgba(244, 67, 54, 0.3)', text: '#F44336' },
  warning: { bg: 'rgba(255, 152, 0, 0.12)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' },
  info: { bg: 'rgba(200, 169, 110, 0.12)', border: 'rgba(200, 169, 110, 0.3)', text: '#C8A96E' },
};

export default function DashboardToasts() {
  const { toasts, removeToast } = useDashboardToast();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          const colors = colorMap[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl min-w-[320px] max-w-[420px] shadow-2xl"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(20px)',
              }}
            >
              <Icon size={18} style={{ color: colors.text, marginTop: 1, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded-md transition-colors hover:bg-white/10 flex-shrink-0"
              >
                <X size={14} style={{ color: '#888888' }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
