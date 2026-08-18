import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { calculateShipping } from '@/utils/shipping';
import { getSizeStock } from '@/types';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartCount,
  } = useStore();

  const subtotal = getCartTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const itemCount = getCartCount();

  const getMaximumQuantity = (item: (typeof cart)[number]) => {
    const sizeStock = getSizeStock(item.product, item.size);
    if (item.isPreOrder || sizeStock?.preOrder) return 5;
    return sizeStock?.stock ?? (item.product.inStock ? 10 : 0);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className="text-center"
        >
          <ShoppingBag size={64} className="mx-auto text-[#E8E4E0] mb-6" strokeWidth={1} />
          <h2 className="font-display text-3xl font-light text-[#1A1A1A] mb-3">
            Your bag is empty
          </h2>
          <p className="text-[#888880] mb-8">
            Discover our collection and add something special.
          </p>
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            className="btn-primary"
          >
            Continue Shopping
            <ArrowRight size={13} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>
        </div>

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-8">
          Shopping Bag ({itemCount})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-6 pb-6 border-b border-[#E8E4E0]"
              >
                {/* Image */}
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#F9F7F5] flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-medium text-[#1A1A1A]">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-[#888880]">
                      Size: {item.size} | Color: 
                      <span 
                        className="inline-block w-3 h-3 rounded-full ml-1 align-middle"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#E8E4E0]">
                      <button
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1);
                          }
                        }}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#F9F7F5] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label={`Increase quantity of ${item.product.name}`}
                        onClick={() => {
                          const maxQty = getMaximumQuantity(item);
                          if (item.quantity < maxQty) {
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1);
                          }
                        }}
                        type="button"
                        disabled={item.quantity >= getMaximumQuantity(item)}
                        className={`w-8 h-8 flex items-center justify-center transition-colors ${
                          item.quantity >= getMaximumQuantity(item)
                            ? 'text-[#E8E4E0] cursor-not-allowed'
                            : 'hover:bg-[#F9F7F5]'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-medium">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        type="button"
                        className="text-[#888880] hover:text-[#C0132A] transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

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

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">
                  You qualify for free shipping!
                </p>
              )}
            </div>

            <div className="border-t border-[#E8E4E0] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#888880] mt-1">
                Including all taxes
              </p>
            </div>

            <button
              onClick={() => {
                navigate('/checkout/address');
                window.scrollTo(0, 0);
              }}
              className="w-full bg-[#1A1A1A] text-white text-[11px] font-medium tracking-[0.17em] uppercase py-4 flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </button>

            <div className="mt-6 text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349221.png"
                alt="Visa"
                className="h-6 inline-block mx-1 opacity-50"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349228.png"
                alt="Mastercard"
                className="h-6 inline-block mx-1 opacity-50"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349230.png"
                alt="Amex"
                className="h-6 inline-block mx-1 opacity-50"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349219.png"
                alt="PayPal"
                className="h-6 inline-block mx-1 opacity-50"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
