import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { calculateShipping } from '@/utils/shipping';
import { getSizeStock } from '@/types';
import { generateSlug } from '@/types';
import ProductPrice from '@/components/ProductPrice';
import { optimizedProductImageUrl, optimizedProductImageSrcSet } from '@/lib/cdn';
import CheckoutAction from '@/components/CheckoutAction';
import { trackAddToCart, trackBeginCheckout, trackRemoveFromCart, trackViewCart } from '@/lib/analytics';
import {
  FIRST_BUYER_CODE,
  FIRST_BUYER_DISCOUNT,
  PRIVATE_COUPON_CODE,
  TSHIRT_BUNDLE_CODE,
  calculatePrivateCouponDiscount,
  calculateLaunchSale,
  isFirstBuyerCode,
  isPrivateCouponCode,
  isTshirtBundleCode,
} from '@/utils/launchSale';

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
    promoCode,
    setPromoCode,
    bundlePromoCode,
    setBundlePromoCode,
  } = useStore();

  const [offerCode, setOfferCode] = useState(promoCode || bundlePromoCode || '');
  const [offerMessage, setOfferMessage] = useState('');

  const subtotal = getCartTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const itemCount = getCartCount();
  const privateCouponApplied = isPrivateCouponCode(promoCode);
  const bundleCodeApplied = !privateCouponApplied && isTshirtBundleCode(bundlePromoCode);
  const launchPricing = calculateLaunchSale(cart, bundleCodeApplied);
  const potentialLaunchPricing = calculateLaunchSale(cart, true);
  const welcomeDiscount = !privateCouponApplied && isFirstBuyerCode(promoCode)
    ? Math.min(FIRST_BUYER_DISCOUNT, launchPricing.saleSubtotal)
    : 0;
  const privateDiscount = calculatePrivateCouponDiscount(cart, privateCouponApplied);
  const cartCategories = Array.from(new Set(cart.map((item) => item.product.category)));
  const recommendationGroups = cartCategories.map((category) => ({
    category,
    products: products
      .filter((product) => product.inStock && product.category === category && !cart.some((item) => item.product.id === product.id))
      .slice(0, 3),
  })).filter((group) => group.products.length > 0);
  const trackedInitialCart = useRef(false);

  useEffect(() => {
    if (trackedInitialCart.current || cart.length === 0) return;
    trackedInitialCart.current = true;
    trackViewCart(total, cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })));
  }, [cart, total]);

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

  const applyOfferCode = (code = offerCode) => {
    if (isPrivateCouponCode(code)) {
      setPromoCode(PRIVATE_COUPON_CODE);
      setBundlePromoCode(null);
      setOfferCode('');
      setOfferMessage('Private offer applied.');
      return;
    }
    if (isTshirtBundleCode(code)) {
      if (privateCouponApplied) setPromoCode(null);
      setBundlePromoCode(TSHIRT_BUNDLE_CODE);
      setOfferCode(TSHIRT_BUNDLE_CODE);
      setOfferMessage('Launch bundle code applied.');
      return;
    }
    if (isFirstBuyerCode(code)) {
      setPromoCode(FIRST_BUYER_CODE);
      setOfferCode(FIRST_BUYER_CODE);
      setOfferMessage('₹99 first-buyer offer applied.');
      return;
    }
    setOfferMessage('That code is not part of the current launch offers.');
  };

  const proceed = () => {
    trackBeginCheckout(total, cart.map(item => ({ id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })));
    navigate('/checkout/address'); window.scrollTo(0, 0);
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
          <p className="text-[#888880] mb-4">
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
    <div className="min-h-screen bg-white pt-4 pb-28 sm:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
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

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-6 sm:mb-4">
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
                <div className="w-[38%] max-w-36 sm:w-44 sm:max-w-none lg:w-48 aspect-[4/5] self-start overflow-hidden rounded-xl border border-[#E8E4E0] bg-[#F9F7F5] flex-shrink-0">
                  <img
                    src={optimizedProductImageUrl(item.product.image, 640)}
                    srcSet={optimizedProductImageSrcSet(item.product.image)}
                    sizes="(min-width: 1024px) 192px, (min-width: 640px) 176px, 38vw"
                    width="640"
                    height="640"
                    decoding="async"
                    alt={item.product.name}
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
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
                      {item.quantity > 1 && (
                      <button
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        onClick={() => {
                          if (item.quantity <= 1) return;
                          trackRemoveFromCart({
                            id: item.product.id,
                            name: item.product.name,
                            category: item.product.category,
                            price: item.product.price,
                            quantity: 1,
                            size: item.size,
                          });
                          updateQuantity(item.product.id, item.size, item.color, item.quantity - 1);
                        }}
                        type="button"
                        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#F9F7F5] transition-colors touch-manipulation"
                      >
                        <Minus size={14} />
                      </button>
                      )}
                      <span className="w-10 sm:w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label={`Increase quantity of ${item.product.name}`}
                        onClick={() => {
                          const maxQty = getMaximumQuantity(item);
                          if (item.quantity < maxQty) {
                            trackAddToCart({
                              id: item.product.id,
                              name: item.product.name,
                              category: item.product.category,
                              price: item.product.price,
                              quantity: 1,
                              size: item.size,
                            });
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
                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 ml-auto">
                      <ProductPrice
                        price={item.product.price}
                        compareAtPrice={item.product.originalPrice}
                        quantity={item.quantity}
                        className="justify-end gap-2"
                        priceClassName="text-lg font-medium text-[#1A1A1A]"
                        compareClassName="text-sm text-[#888880] line-through"
                      />
                      <button
                        aria-label={`Delete ${item.product.name} from bag`}
                        onClick={() => {
                          trackRemoveFromCart({
                            id: item.product.id,
                            name: item.product.name,
                            category: item.product.category,
                            price: item.product.price,
                            quantity: item.quantity,
                            size: item.size,
                          });
                          removeFromCart(item.product.id, item.size, item.color);
                        }}
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


          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#F9F7F5] rounded-xl p-4 sm:p-5 h-fit lg:sticky lg:top-6 border border-[#E8E4E0]"
          >
            <h3 className="font-display text-xl font-medium text-[#1A1A1A] mb-3">
              Order summary
            </h3>

            <div className="mb-4">
              <div className="flex gap-2">
                <input value={offerCode} onChange={e => setOfferCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applyOfferCode(); }} aria-label="Offer code" placeholder="Have a coupon?" className="min-w-0 flex-1 rounded-lg border border-[#DCD5CF] bg-white px-3 py-2.5 text-sm" />
                <button type="button" onClick={() => applyOfferCode()} className="rounded-lg bg-[#1A1A1A] px-4 text-sm text-white">Apply</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {potentialLaunchPricing.discount > 0 && <button type="button" onClick={() => applyOfferCode(TSHIRT_BUNDLE_CODE)} className="rounded-full border border-[#DCD5CF] px-3 py-2 text-xs">{bundleCodeApplied ? '✓ Bundle applied' : `Bundle · save ₹${potentialLaunchPricing.discount}`}</button>}
              </div>
              {(promoCode || bundlePromoCode) && <button onClick={() => { setPromoCode(null); setBundlePromoCode(null); setOfferMessage('Offer removed.'); }} className="mt-2 text-xs underline">Remove offer</button>}
              {offerMessage && <p role="status" className="mt-2 text-xs text-[#66665E]">{offerMessage}</p>}
            </div>
            <details className="mb-3"><summary className="cursor-pointer text-xs text-[#66665E]">View price breakdown</summary>
            <div className="space-y-2 mt-3 mb-3">
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

            </details>
            <div className="border-t border-[#E8E4E0] pt-3 mb-3">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#888880] mt-1">
                Including all taxes
              </p>
            </div>

            <button onClick={proceed} className="mb-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#C0132A] px-4 text-sm font-semibold text-white lg:hidden">Proceed to checkout <ArrowRight size={16} /></button>
            <CheckoutAction total={total} label="Proceed to checkout" onClick={proceed} />
            <p className="mt-3 text-center text-xs text-[#66665E]">COD available · Online payments via Razorpay</p>

          </motion.div>
        </div>
        <div className="mt-8">            {recommendationGroups.map((group) => (
              <section key={group.category} className="pt-8 sm:pt-10 border-t border-[#E8E4E0]">
                <div className="bg-[#F9F7F5] p-4 sm:p-6">
                <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#C0132A] mb-1">Selected for your bag</p>
                    <h2 className="font-display text-[25px] sm:text-[28px] font-light leading-none text-[#1A1A1A]">More {categoryLabel(group.category)}</h2>
                    <p className="hidden sm:block text-xs text-[#888880] mt-2">Pieces from the same collection, chosen to go together.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCollectionFilter(group.category, null); navigate(`/collections/${group.category}`); window.scrollTo(0, 0); }}
                    className="min-h-10 px-3 border border-[#1A1A1A] text-[10px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors touch-manipulation"
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {group.products.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => { navigate(`/product/${product.slug || generateSlug(product.name)}`); window.scrollTo(0, 0); }}
                      className="text-left group bg-white border border-transparent hover:border-[#1A1A1A]/15 transition-colors touch-manipulation"
                    >
                      <div className="aspect-[4/5] bg-[#F2EFEC] overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                      <div className="p-2.5 sm:p-3">
                      <p className="font-display text-sm text-[#1A1A1A] truncate">{product.name}</p>
                      <ProductPrice
                        price={product.price}
                        compareAtPrice={product.originalPrice}
                        className="gap-1.5 mt-0.5"
                        priceClassName="text-xs font-medium text-[#1A1A1A]"
                        compareClassName="text-[11px] text-[#888880] line-through"
                      />
                      </div>
                    </button>
                  ))}
                </div>
                </div>
              </section>
            ))}</div>
      </div>
    </div>
  );
}
