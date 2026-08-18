import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { calculateShipping } from '@/utils/shipping';
import { getSizeStock } from '@/types';
import { generateSlug } from '@/types';
import ProductPrice from '@/components/ProductPrice';
import { getCartCompareAtTotal } from '@/lib/pricing';
import InstagramFeed from '@/components/InstagramFeed';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartCount,
    products,
    setCollectionFilter,
  } = useStore();

  const subtotal = getCartTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const itemCount = getCartCount();
  const compareAtSubtotal = getCartCompareAtTotal(cart);
  const cartCategories = Array.from(new Set(cart.map((item) => item.product.category)));
  const recommendationGroups = cartCategories.map((category) => ({
    category,
    products: products
      .filter((product) => product.inStock && product.category === category && !cart.some((item) => item.product.id === product.id))
      .slice(0, 4),
  })).filter((group) => group.products.length > 0);

  const categoryLabel = (category: string) => ({
    tshirts: 'T-Shirts',
    shirts: 'Shirts',
    hoodies: 'Hoodies',
    accessories: 'Accessories',
  }[category] || category);

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
    <div className="min-h-screen bg-white py-5 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-6 sm:mb-8">
          Shopping Bag ({itemCount})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="space-y-5 sm:space-y-6">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-3 sm:gap-6 pb-5 sm:pb-6 border-b border-[#E8E4E0]"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-[#F9F7F5] flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-medium text-[#1A1A1A] line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#888880]">
                      Size: {item.size} | Color: 
                      <span 
                        className="inline-block w-3 h-3 rounded-full ml-1 align-middle"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 mt-3 sm:mt-0">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#E8E4E0]">
                      <button
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.product.id, item.size, item.color, item.quantity - 1);
                          else removeFromCart(item.product.id, item.size, item.color);
                        }}
                        type="button"
                        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#F9F7F5] transition-colors touch-manipulation"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 sm:w-10 text-center text-sm">{item.quantity}</span>
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
                        className={`w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center transition-colors touch-manipulation ${
                          item.quantity >= getMaximumQuantity(item)
                            ? 'text-[#E8E4E0] cursor-not-allowed'
                            : 'hover:bg-[#F9F7F5]'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                      <ProductPrice
                        price={item.product.price}
                        compareAtPrice={item.product.originalPrice}
                        quantity={item.quantity}
                        className="justify-end gap-2"
                        priceClassName="text-lg font-medium text-[#1A1A1A]"
                        compareClassName="text-sm text-[#888880] line-through"
                      />
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        type="button"
                        className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center text-[#888880] hover:text-[#C0132A] transition-colors touch-manipulation"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {recommendationGroups.map((group) => (
              <section key={group.category} className="pt-6 sm:pt-8">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#C0132A]">More in your style</p>
                    <h2 className="font-display text-2xl font-light text-[#1A1A1A]">More {categoryLabel(group.category)}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCollectionFilter(group.category, null); navigate(`/collections/${group.category}`); window.scrollTo(0, 0); }}
                    className="min-h-10 text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A] underline underline-offset-4 hover:text-[#C0132A] touch-manipulation"
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {group.products.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => { navigate(`/product/${product.slug || generateSlug(product.name)}`); window.scrollTo(0, 0); }}
                      className="text-left group touch-manipulation"
                    >
                      <div className="aspect-[3/4] bg-[#F9F7F5] overflow-hidden mb-2">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                      <p className="font-display text-sm text-[#1A1A1A] truncate">{product.name}</p>
                      <ProductPrice
                        price={product.price}
                        compareAtPrice={product.originalPrice}
                        className="gap-1.5 mt-0.5"
                        priceClassName="text-xs font-medium text-[#1A1A1A]"
                        compareClassName="text-[11px] text-[#888880] line-through"
                      />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="bg-[#F9F7F5] p-5 sm:p-6 lg:p-8 h-fit lg:sticky lg:top-6"
          >
            <h3 className="font-display text-xl font-medium text-[#1A1A1A] mb-6">
              Order Summary
            </h3>

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
        <InstagramFeed className="mt-14 sm:mt-20" />
      </div>
    </div>
  );
}
