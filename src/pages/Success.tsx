import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastCompletedOrderId, setLastCompletedOrderId } = useStore();

  // Try to get order data from navigation state (passed from Payment)
  // or fall back to the store's lastCompletedOrderId
  const navState = location.state as { orderNumber?: string; orderId?: string; total?: number } | null;
  
  const orderNumber = navState?.orderNumber
    || (lastCompletedOrderId ? `SLG-${lastCompletedOrderId.slice(0, 6).toUpperCase()}` : null);
  const orderTotal = navState?.total;

  // Clean up the completed order flag after displaying
  useEffect(() => {
    return () => {
      // Clear on unmount so user can't revisit stale success page
      setLastCompletedOrderId(null);
    };
  }, [setLastCompletedOrderId]);

  // If there's no order context at all, show a generic success
  // (e.g., user navigated directly to /order-success)
  const displayOrderNumber = orderNumber || 'N/A';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-[#C0132A] rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Check size={48} className="text-white" strokeWidth={2} />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-4">
          Order Confirmed!
        </h1>

        {/* Message */}
        <p className="text-[#888880] mb-6">
          Thank you for your purchase. We've received your order and will send you a confirmation email shortly.
        </p>

        {/* Order Details */}
        <div className="bg-[#F9F7F5] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#888880]">Order Number</span>
            <span className="font-medium">#{displayOrderNumber}</span>
          </div>
          {orderTotal && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#888880]">Total Paid</span>
              <span className="font-medium">₹{orderTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888880]">Estimated Delivery</span>
            <span className="font-medium">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
              })}
              {' - '}
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>

        {/* Tracking Steps */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#C0132A] rounded-full flex items-center justify-center mb-2">
              <Check size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#1A1A1A]">
              Ordered
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#E8E4E0] rounded-full flex items-center justify-center mb-2">
              <Package size={18} className="text-[#888880]" />
            </div>
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
              Packed
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#E8E4E0] rounded-full flex items-center justify-center mb-2">
              <Truck size={18} className="text-[#888880]" />
            </div>
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
              Shipped
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#E8E4E0] rounded-full flex items-center justify-center mb-2">
              <Mail size={18} className="text-[#888880]" />
            </div>
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
              Delivered
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="btn-primary mx-auto"
        >
          Continue Shopping
          <ArrowRight size={13} />
        </button>
      </motion.div>
    </div>
  );
}
