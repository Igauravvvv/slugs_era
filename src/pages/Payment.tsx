import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, Wallet, Banknote, Shield, Check, Lock } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { trackPurchase } from '@/lib/analytics';
import { calculateShipping } from '@/utils/shipping';
import ProductPrice from '@/components/ProductPrice';
import { getCartCompareAtTotal } from '@/lib/pricing';
import { api } from '@/lib/api';

type PaymentMethod = 'card' | 'upi' | 'cod';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export default function Payment() {
  const navigate = useNavigate();
  const { cart, getCartTotal, selectedAddress, clearCart, setLastCompletedOrderId } = useStore();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartTotal();
  const compareAtSubtotal = getCartCompareAtTotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  // Redirect if no address or cart
  useEffect(() => {
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
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Razorpay failed to load. Check your connection.'); setIsProcessing(false); return; }

      // 1. Create order on backend
      const checkoutItems = cart.map(i => ({ productId: i.product.id, size: i.size, color: i.color, quantity: i.quantity }));
      const orderData = await api.post<any>('/api/payment/create-order', { items: checkoutItems });

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
          });

          if (verifyData.success) {
            const orderData = verifyData.data?.order;
            const orderNumber = orderData?.order_number || verifyData.data?.orderNumber;
            const orderId = orderData?.id;

            trackPurchase(response.razorpay_payment_id, total, cart.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })));
            
            // Store order ID so Success page can display it
            if (orderId) setLastCompletedOrderId(orderId);
            clearCart();
            navigate('/order-success', { state: { orderNumber, orderId, total } });
          } else {
            alert(verifyData.error || 'Payment verification failed. Contact support.');
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: () => { setIsProcessing(false); },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };


  if (!selectedAddress || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/checkout/address')}
          className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Address
        </button>

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-8">
          Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Payment Methods */}
          <div>
            {/* Payment Method Info */}
            <div className="space-y-4 mb-8">
              <div className="p-6 border border-[#1A1A1A] bg-[#F9F7F5]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-[#1A1A1A]">Secure Checkout</h3>
                    <p className="text-sm text-[#888880]">Powered by Razorpay</p>
                  </div>
                </div>
                <p className="text-sm text-[#1A1A1A] mb-4">
                  You will be securely redirected to Razorpay to complete your purchase. We accept all major payment methods:
                </p>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-[#888880]">
                  <div className="flex items-center gap-2"><CreditCard size={16} /> Cards</div>
                  <div className="flex items-center gap-2"><Wallet size={16} /> UPI</div>
                  <div className="flex items-center gap-2"><Banknote size={16} /> Netbanking</div>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-[#888880]">
              <Lock size={14} />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="bg-[#F9F7F5] p-6 lg:p-8 h-fit"
          >
            <h3 className="font-display text-xl font-medium text-[#1A1A1A] mb-6">
              Order Summary
            </h3>

            {/* Delivery Address */}
            <div className="mb-6 pb-6 border-b border-[#E8E4E0]">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#C0132A]" />
                <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880]">
                  Delivering To
                </span>
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

            {/* Items */}
            <div className="space-y-3 mb-6 pb-6 border-b border-[#E8E4E0]">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                  <span className="text-[#888880]">
                    {item.product.name} x {item.quantity}
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

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Subtotal</span>
                <ProductPrice
                  price={subtotal}
                  compareAtPrice={compareAtSubtotal}
                  className="justify-end gap-2"
                  priceClassName="text-sm text-[#1A1A1A]"
                  compareClassName="text-xs text-[#888880] line-through"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="border-t border-[#E8E4E0] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full text-[11px] font-medium tracking-[0.17em] uppercase py-4 flex items-center justify-center gap-2 transition-colors ${
                !isProcessing
                  ? 'bg-[#1A1A1A] text-white hover:bg-black'
                  : 'bg-[#E8E4E0] text-[#888880] cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ₹{total.toLocaleString()}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
