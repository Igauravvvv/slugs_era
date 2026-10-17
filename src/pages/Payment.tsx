import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, Shield, Lock } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { trackPurchase } from '@/lib/analytics';
import { calculateShipping } from '@/utils/shipping';
import ProductPrice from '@/components/ProductPrice';
import CheckoutSteps from '@/components/CheckoutSteps';
import CheckoutAction from '@/components/CheckoutAction';
import { api } from '@/lib/api';
import {
  FIRST_BUYER_DISCOUNT,
  TSHIRT_BUNDLE_CODE,
  calculatePrivateCouponDiscount,
  calculateLaunchSale,
  isFirstBuyerCode,
  isPrivateCouponCode,
  isTshirtBundleCode,
} from '@/utils/launchSale';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export default function Payment() {
  const navigate = useNavigate();
  const { cart, getCartTotal, selectedAddress, setLastCompletedOrderId, promoCode, bundlePromoCode } = useStore();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const submissionLock = useRef(false);
  const completed = useRef(false);
  const [paymentError, setPaymentError] = useState('');

  const subtotal = getCartTotal();
  const privateCouponApplied = isPrivateCouponCode(promoCode);
  const launchPricing = calculateLaunchSale(cart, !privateCouponApplied && isTshirtBundleCode(bundlePromoCode));
  const welcomeDiscount = !privateCouponApplied && isFirstBuyerCode(promoCode)
    ? Math.min(FIRST_BUYER_DISCOUNT, launchPricing.saleSubtotal)
    : 0;
  const privateDiscount = calculatePrivateCouponDiscount(cart, privateCouponApplied);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const promoCodes = [bundlePromoCode, promoCode].filter((code): code is string => Boolean(code));

  // Redirect if no address or cart
  useEffect(() => {
    if (completed.current) return;
    if (cart.length === 0) {
      navigate('/cart');
    } else if (!selectedAddress) {
      navigate('/checkout/address');
    }
  }, [cart, selectedAddress, navigate]);


  // Load Razorpay script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
      window.setTimeout(() => resolve(Boolean((window as any).Razorpay)), 15_000);
    });
  };

  const handlePayment = async () => {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setIsProcessing(true);
    setPaymentError('');
    
    try {
      if (paymentMethod === 'cod') {
        const checkout = {
          items: cart.map(i => ({ productId: i.product.id, size: i.size, color: i.color, quantity: i.quantity })),
          promoCodes, customerName: selectedAddress?.fullName, customerPhone: selectedAddress?.phone,
          shippingAddress: selectedAddress ? {
            street: [selectedAddress.addressLine1, selectedAddress.addressLine2].filter(Boolean).join(', '),
            city: selectedAddress.city, state: selectedAddress.state, pincode: selectedAddress.pincode, country: 'India',
          } : null,
        };
        const retryKey = `cod-checkout:${user?.id}:${JSON.stringify(checkout)}`;
        const requestId = sessionStorage.getItem(retryKey) || crypto.randomUUID();
        sessionStorage.setItem(retryKey, requestId);
        const result = await api.post<{ success: boolean; data?: { order: { id: string; order_number: string; total: number } } }>('/api/payment/cod', { ...checkout, requestId });
        const order = result.data?.order;
        if (!result.success || !order?.id) throw new Error('Could not confirm your COD order. Please retry.');
        setLastCompletedOrderId(order.id);
        completed.current = true;
        try { sessionStorage.removeItem(retryKey); } catch { /* Confirmed order must still be shown. */ }
        navigate('/order-success', { replace: true, state: { orderId: order.id, orderNumber: order.order_number, total: order.total, paymentMethod: 'COD' } });
        setIsProcessing(false); submissionLock.current = false;
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) {
        setPaymentError('Razorpay checkout could not load. Check your connection or disable the browser blocker, then retry.');
        setIsProcessing(false); submissionLock.current = false;
        return;
      }

      // 1. Create order on backend
      const checkoutItems = cart.map(i => ({ productId: i.product.id, size: i.size, color: i.color, quantity: i.quantity }));
      const orderData = await api.post<any>('/api/payment/create-order', {
        items: checkoutItems,
        promoCodes,
        browserKeyId: RAZORPAY_KEY_ID,
      });
      if (!orderData?.data?.id || !Number.isFinite(Number(orderData?.data?.amount))) {
        throw new Error('The payment server returned an invalid order. Please retry.');
      }

      // 2. Open Razorpay modal
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: 'INR',
        name: "Slug's Era",
        description: `Order — ${cart.length} item(s)`,
        order_id: orderData.data.id,
        prefill: {
          name: selectedAddress?.fullName || user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: selectedAddress?.phone || '',
        },
        theme: { color: '#C0132A' },
        handler: async (response: any) => {
          try {
          // 3. Verify payment on backend
          const verifyData = await api.post<any>('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id || '',
              customerName: selectedAddress?.fullName || user?.user_metadata?.full_name || '',
              customerEmail: user?.email || '',
              customerPhone: selectedAddress?.phone || '',
              shippingAddress: selectedAddress ? {
                street: [selectedAddress.addressLine1, selectedAddress.addressLine2].filter(Boolean).join(', '),
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
                country: 'India',
              } : null,
              items: checkoutItems,
              promoCodes,
              browserKeyId: RAZORPAY_KEY_ID,
          });

          if (verifyData.success) {
            const orderData = verifyData.data?.order;
            const orderNumber = orderData?.order_number || verifyData.data?.orderNumber;
            const orderId = orderData?.id;
            if (!orderId || !orderNumber) throw new Error('The saved order reference is missing.');

            trackPurchase(response.razorpay_payment_id, total, cart.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })));
            
            // Store order ID so Success page can display it
            if (orderId) setLastCompletedOrderId(orderId);
            completed.current = true;
            navigate('/order-success', { replace: true, state: { orderNumber, orderId, total } });
          } else {
            setPaymentError(verifyData.error || 'Payment verification failed. Contact support.');
          }
          } catch {
            setPaymentError('We could not confirm your payment status. If money was deducted, please contact slugsera@gmail.com before paying again.');
          } finally {
            setIsProcessing(false); submissionLock.current = false;
          }
        },
        modal: {
          ondismiss: () => { setIsProcessing(false); submissionLock.current = false; },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        const description = response?.error?.description || response?.error?.reason || 'Razorpay declined the payment attempt.';
        setPaymentError(`Razorpay: ${description}`);
        setIsProcessing(false); submissionLock.current = false;
      });
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      const source = (err as any)?.source;
      setPaymentError(source === 'razorpay' ? `Razorpay: ${message}` : message);
      setIsProcessing(false); submissionLock.current = false;
    }
  };


  if (!selectedAddress || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-white pt-4 pb-28 sm:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutSteps current={2} />
        {/* Back Button */}
        <button
          onClick={() => navigate('/checkout/address')}
          className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Address
        </button>

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-4">
          Complete your order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 lg:gap-8">
          {/* Payment Methods */}
          <div>
            <p className="text-[#66665E] mb-4">One last step. Choose how you’d like to pay.</p>
            <fieldset disabled={isProcessing} className="space-y-3 mb-4">
              <legend className="font-medium mb-3">Choose payment method</legend>
              {([
                { value: 'online', title: 'Pay online', description: 'UPI, debit / credit cards & netbanking', icon: CreditCard },
                { value: 'cod', title: 'Cash on delivery', description: 'Place your order now. Pay when it arrives.', icon: Banknote },
              ] as const).map(({ value, title, description, icon: Icon }) => (
                <label key={value} className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#C0132A] focus-within:ring-offset-2 ${paymentMethod === value ? 'border-[#C0132A] bg-[#FFF7F8]' : 'border-[#E8E4E0] hover:border-[#888880]'}`}>
                  <input className="mt-1 accent-[#C0132A] w-4 h-4" type="radio" name="paymentMethod" checked={paymentMethod === value} onChange={() => { setPaymentMethod(value); setPaymentError(''); }} />
                  <span className="flex-1"><span className="block font-semibold">{title}</span><span className="block text-sm text-[#66665E] mt-1">{description}</span></span>
                  <Icon size={22} className="text-[#C0132A] shrink-0" />
                </label>
              ))}
            </fieldset>
            {paymentMethod === 'cod' && <div className="mb-4 rounded-xl bg-[#F9F7F5] p-5 text-sm"><p className="font-semibold">₹{total.toLocaleString('en-IN')} due on delivery</p><p className="mt-1 text-[#66665E]">No advance payment. Your order ID will appear as soon as your order is confirmed.</p></div>}
            <div className="mb-4 rounded-xl border border-[#E8E4E0] p-5">
              <p className="text-sm font-semibold">Order updates</p>
              <p className="mt-1 text-sm text-[#66665E] break-words">Your confirmation will be sent to <span className="font-medium text-[#1A1A1A]">{user?.email || 'your signed-in email address'}</span>.</p>
            </div>
            <p className="flex items-center gap-2 text-xs text-[#66665E]"><Lock size={14} /> {paymentMethod === 'cod' ? 'No payment details needed for COD.' : 'Payment is processed securely by Razorpay.'}</p>
            <p className="mt-3 text-xs text-[#66665E]">Need help? <a className="underline" href="mailto:slugsera@gmail.com">slugsera@gmail.com</a></p>
            {paymentError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}

          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#F9F7F5] border border-[#E8E4E0] rounded-xl p-4 lg:p-5 h-fit lg:sticky lg:top-24"
          >
            <h3 className="font-display text-xl font-medium text-[#1A1A1A] mb-4">
              Order Summary
            </h3>

            {/* Delivery Address */}
            <div className="mb-4 pb-6 border-b border-[#E8E4E0]">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#C0132A]" />
                <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880]">
                  Delivering To
                </span>
                <button disabled={isProcessing} onClick={() => navigate('/checkout/address')} className="ml-auto text-sm text-[#C0132A] underline underline-offset-4">Change</button>
              </div>
              <div className="text-sm">
                <p className="font-medium">{selectedAddress.fullName}</p>
                <p className="text-[#888880]">{selectedAddress.phone}</p>
                <p className="text-[#888880] mt-1">
                  {selectedAddress.addressLine1}
                  {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                </p>
                <p className="text-[#888880]">
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </p>
              </div>
            </div>

            <details className="mb-4"><summary className="cursor-pointer text-sm font-semibold">View items & price breakdown ({cart.reduce((n, item) => n + item.quantity, 0)} items)</summary><div className="mt-3">
            <div className="space-y-3 mb-4 pb-6 border-b border-[#E8E4E0]">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                  <span className="text-[#888880]">
                    {item.product.name} × {item.quantity}
                    <span className="block text-xs mt-1">{item.size} · {item.color}</span>
                  </span>
                  <ProductPrice
                    price={item.product.price}
                    compareAtPrice={item.product.originalPrice}
                    quantity={item.quantity}
                    className="justify-end gap-2"
                    priceClassName="text-sm text-[#1A1A1A]"
                    compareClassName="text-xs text-[#888880] line-through"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Items subtotal</span>
                <span>₹{launchPricing.retailSubtotal.toLocaleString()}</span>
              </div>
              {launchPricing.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>{TSHIRT_BUNDLE_CODE} bundle savings</span>
                  <span>−₹{launchPricing.discount.toLocaleString()}</span>
                </div>
              )}
              {welcomeDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>First-buyer offer</span>
                  <span>−₹{welcomeDiscount.toLocaleString()}</span>
                </div>
              )}
              {privateDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Private offer</span>
                  <span>−₹{privateDiscount.toLocaleString()}</span>
                </div>
              )}
              {(launchPricing.discount > 0 || welcomeDiscount > 0 || privateDiscount > 0) && (
                <div className="flex justify-between text-sm font-medium">
                  <span>Discounted subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            </div></details>
            <div className="border-t border-[#E8E4E0] pt-4 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">{paymentMethod === 'cod' ? 'Due on delivery' : 'Total to pay'}</span>
                <span className="font-display text-2xl">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <CheckoutAction total={total} label={paymentMethod === 'cod' ? 'Place COD order' : `Pay ₹${total.toLocaleString('en-IN')}`} onClick={handlePayment} busy={isProcessing} note={paymentMethod === 'cod' ? 'Due on delivery' : 'Total · incl. taxes'} />

          </motion.div>
        </div>
      </div>
    </div>
  );
}
