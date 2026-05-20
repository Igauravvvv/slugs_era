import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, Wallet, Banknote, Shield, Check, Lock } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { trackPurchase } from '@/lib/analytics';
import { calculateShipping } from '@/utils/shipping';

type PaymentMethod = 'card' | 'upi' | 'cod';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Payment() {
  const navigate = useNavigate();
  const { cart, getCartTotal, selectedAddress, clearCart, setLastCompletedOrderId } = useStore();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');

  const subtotal = getCartTotal();
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

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

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
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) { throw new Error('Failed to create order'); }

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
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
              items: cart.map(i => ({ productId: i.product.id, name: i.product.name, size: i.size, color: i.color, quantity: i.quantity, price: i.product.price })),
              totalAmount: total,
              shippingFee: shipping,
            }),
          });
          const verifyData = await verifyRes.json();

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
            alert('Payment verification failed. Contact support.');
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

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return (
        cardData.number.replace(/\s/g, '').length === 16 &&
        cardData.name.length > 0 &&
        cardData.expiry.length === 5 &&
        cardData.cvv.length === 3
      );
    } else if (paymentMethod === 'upi') {
      return upiId.includes('@') && upiId.length > 3;
    }
    return true; // COD is always valid
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
            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8">
              {/* Credit/Debit Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-5 border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#1A1A1A] bg-[#F9F7F5]'
                    : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'card' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#E8E4E0]'
                  }`}>
                    {paymentMethod === 'card' && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <CreditCard size={20} className="text-[#888880]" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" alt="Visa" className="h-5 opacity-50" />
                    <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" className="h-5 opacity-50" />
                  </div>
                </div>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-[#E8E4E0]"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={cardData.number}
                          onChange={handleCardInput}
                          placeholder="1234 5678 9012 3456"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={cardData.name}
                          onChange={handleCardInput}
                          placeholder="Name as on card"
                          className="input-field"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                            Expiry (MM/YY) *
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardData.expiry}
                            onChange={handleCardInput}
                            placeholder="MM/YY"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                            CVV *
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardInput}
                            placeholder="123"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-5 border cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#1A1A1A] bg-[#F9F7F5]'
                    : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'upi' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#E8E4E0]'
                  }`}>
                    {paymentMethod === 'upi' && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <Wallet size={20} className="text-[#888880]" />
                    <span className="font-medium">UPI</span>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-[#E8E4E0]"
                  >
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="input-field"
                    />
                  </motion.div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#1A1A1A] bg-[#F9F7F5]'
                    : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'cod' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#E8E4E0]'
                  }`}>
                    {paymentMethod === 'cod' && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <Banknote size={20} className="text-[#888880]" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
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
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-[#888880]">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
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
              disabled={!isFormValid() || isProcessing}
              className={`w-full text-[11px] font-medium tracking-[0.17em] uppercase py-4 flex items-center justify-center gap-2 transition-colors ${
                isFormValid() && !isProcessing
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
