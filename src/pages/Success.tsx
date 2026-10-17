import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Success() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [emailState, setEmailState] = useState<'checking' | 'sent' | 'pending'>('checking');
  const [showCelebration, setShowCelebration] = useState(false);
  const [emailAttempt, setEmailAttempt] = useState(0);
  const [savedOrder, setSavedOrder] = useState<{ order_number: string; total: number; shipping_address?: { paymentMethod?: string } } | null>(null);
  const location = useLocation();
  const { lastCompletedOrderId, setLastCompletedOrderId } = useStore();

  // Try to get order data from navigation state (passed from Payment)
  // or fall back to the store's lastCompletedOrderId
  const navState = location.state as { orderNumber?: string; orderId?: string; total?: number; paymentMethod?: string } | null;
  
  const orderId = navState?.orderId || lastCompletedOrderId;
  const displayOrderNumber = navState?.orderNumber || savedOrder?.order_number;
  const orderTotal = navState?.total ?? savedOrder?.total;
  const paymentMethod = navState?.paymentMethod || savedOrder?.shipping_address?.paymentMethod;

  useEffect(() => {
    if (!navState?.orderId || !displayOrderNumber) return;
    const key = `slugsera-celebrated:${navState.orderId}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* Still celebrate if storage is unavailable. */ }
    setShowCelebration(true);
  }, [navState?.orderId, displayOrderNumber]);

  useEffect(() => {
    if (!orderId) { navigate('/profile', { replace: true }); return; }
    if (navState?.orderNumber) return;
    let active = true;
    supabase.from('orders').select('order_number,total,shipping_address').eq('id', orderId).single().then(({ data, error }) => {
      if (!active) return;
      if (error || !data) { setLastCompletedOrderId(null); navigate('/profile', { replace: true }); }
      else setSavedOrder(data);
    });
    return () => { active = false; };
  }, [orderId, navState?.orderNumber, navigate, setLastCompletedOrderId]);

  useEffect(() => {
    if (!orderId || !displayOrderNumber) return;
    let active = true;
    api.post<{ delivery: { customer: boolean } }>('/api/payment/order-notifications', { orderId })
      .then(result => { if (active) setEmailState(result.delivery.customer ? 'sent' : 'pending'); })
      .catch(() => { if (active) setEmailState('pending'); });
    return () => { active = false; };
  }, [orderId, displayOrderNumber, emailAttempt]);

  if (!orderId || !displayOrderNumber) return <div className="min-h-[60vh] flex items-center justify-center" role="status">Loading your order…</div>;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:py-16">
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent showCloseButton={false} className="z-[1500] max-w-[calc(100vw_-_2rem)] sm:max-w-md rounded-2xl border-0 bg-[#FFF9F2] p-6 sm:p-8 text-center">
          <motion.div initial={reduceMotion ? false : { scale: 0.6 }} animate={{ scale: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C0132A] text-white"><Check size={32} /></motion.div>
          <DialogTitle className="font-display text-3xl leading-tight">You made the right choice.</DialogTitle>
          <DialogDescription className="text-sm text-[#66665E]">Your Slugsera order is confirmed. Good style is on its way.</DialogDescription>
          <p className="text-sm">Order <strong className="text-[#C0132A]">{displayOrderNumber}</strong></p>
          {paymentMethod === 'COD' && <p className="text-sm">₹{orderTotal?.toLocaleString('en-IN')} due on delivery. Nothing to pay now.</p>}
          <button onClick={() => setShowCelebration(false)} className="min-h-12 rounded-lg bg-[#C0132A] px-5 text-sm font-semibold text-white">View my order</button>
        </DialogContent>
      </Dialog>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        <div className="relative" aria-hidden="true">
          {!reduceMotion && Array.from({ length: 16 }, (_, index) => (
            <motion.span key={index} className="absolute left-1/2 top-12 h-2 w-2 rounded-sm"
              style={{ backgroundColor: ['#C0132A', '#D6B56D', '#1A1A1A'][index % 3] }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: Math.cos(index * Math.PI / 8) * 140, y: Math.sin(index * Math.PI / 8) * 90, opacity: [0, 1, 0], scale: [0, 1, 0.5], rotate: index * 45 }}
              transition={{ duration: 1.4, delay: 0.25, ease: 'easeOut' }} />
          ))}
        </div>
        {/* Success Icon */}
        <motion.div
          initial={reduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-[#C0132A] rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <motion.path d="M10 25L20 35L38 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
          </svg>
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-4">
          Order Confirmed!
        </h1>

        {/* Message */}
        <p className="text-[#888880] mb-6">
          Thank you for your purchase. We've received your order. You can track its progress in your profile.
        </p>

        <motion.div role="status" aria-live="polite" className="mb-6"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <p className="text-xs uppercase tracking-[0.18em] text-[#888880]">Your order ID</p>
          <p className="mt-2 text-2xl font-semibold tracking-wide text-[#C0132A]">{displayOrderNumber}</p>
        </motion.div>
        <div className="mb-6 text-sm text-[#666660]" role="status">
          {emailState === 'checking' && 'Checking your confirmation email…'}
          {emailState === 'sent' && 'Your order confirmation email has been sent. Please also check Spam or Promotions.'}
          {emailState === 'pending' && <>
            <p>Your order is safely confirmed. Your email confirmation is still pending.</p>
            <button type="button" className="mt-2 underline underline-offset-4 text-[#C0132A]" onClick={() => { setEmailState('checking'); setEmailAttempt(value => value + 1); }}>Retry confirmation email</button>
          </>}
        </div>
        {/* Order Details */}
        <div className="bg-[#F9F7F5] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#888880]">Order Number</span>
            <span className="font-medium">#{displayOrderNumber}</span>
          </div>
          {orderTotal !== undefined && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#888880]">{paymentMethod === 'COD' ? 'Due on delivery (COD)' : 'Total Paid'}</span>
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
