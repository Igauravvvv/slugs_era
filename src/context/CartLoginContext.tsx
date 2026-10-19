import { useNavigate } from 'react-router-dom';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import type { CartItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store';
import { CDN } from '@/lib/cdn';
import { isTshirtProduct } from '@/utils/launchSale';

const PENDING_CART_ITEM_KEY = 'slugsera-pending-cart-item';
const PENDING_CHECKOUT_KEY = 'slugsera-pending-checkout';

type CartLoginContextValue = {
  addToCartWithLogin: (item: CartItem, options?: { checkout?: boolean }) => boolean;
};

const CartLoginContext = createContext<CartLoginContextValue | null>(null);

export function CartLoginProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, signingIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const [showLoginOffer, setShowLoginOffer] = useState(false);
  const [showBundleNudge, setShowBundleNudge] = useState(false);
  const nudgeTimer = useRef<number | null>(null);

  const showNudgeWhenOneTshirt = useCallback(() => {
    const count = useStore.getState().cart.reduce(
      (total, item) => total + (isTshirtProduct(item.product) ? item.quantity : 0),
      0,
    );
    if (count !== 1) return;
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
    setShowBundleNudge(true);
    nudgeTimer.current = window.setTimeout(() => setShowBundleNudge(false), 9000);
  }, []);

  const addToCartWithLogin = useCallback((item: CartItem, options?: { checkout?: boolean }) => {
    if (!user) {
      try {
        window.sessionStorage.setItem(PENDING_CART_ITEM_KEY, JSON.stringify(item));
        if (options?.checkout) window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, 'true');
        else window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      } catch {
        // The login prompt still works if storage is unavailable.
      }
      setShowLoginOffer(true);
      return false;
    }

    addToCart(item);
    if (options?.checkout) navigate('/checkout/address');
    else showNudgeWhenOneTshirt();
    return true;
  }, [addToCart, navigate, showNudgeWhenOneTshirt, user]);

  useEffect(() => {
    if (loading || !user) return;

    let pending: CartItem | null = null;
    let checkout = false;
    try {
      const stored = window.sessionStorage.getItem(PENDING_CART_ITEM_KEY);
      if (stored) {
        window.sessionStorage.removeItem(PENDING_CART_ITEM_KEY);
        pending = JSON.parse(stored) as CartItem;
        checkout = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY) === 'true';
        window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      }
    } catch {
      pending = null;
    }

    if (!pending?.product?.id || !pending.quantity) return;
    addToCart(pending);
    setShowLoginOffer(false);
    if (checkout) navigate('/checkout/address');
    else window.setTimeout(showNudgeWhenOneTshirt, 50);
  }, [addToCart, loading, navigate, showNudgeWhenOneTshirt, user]);

  useEffect(() => () => {
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
  }, []);

  return (
    <CartLoginContext.Provider value={{ addToCartWithLogin }}>
      {children}

      <AnimatePresence>
        {showLoginOffer && !user && (
          <motion.div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-offer-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-[#FFF9F2] p-7 text-center shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close login offer"
                onClick={() => setShowLoginOffer(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-sm"
              >
                <X size={16} />
              </button>
              <img src={CDN.LOGO} alt="Slugs Era mascot" className="mx-auto mb-4 h-20 w-20 object-contain" />
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C0132A]">End of Monsoon Sale</p>
              <h2 id="login-offer-title" className="font-display text-3xl font-medium text-[#1A1A1A]">All T-shirts. Just ₹999.</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#6D6862]">Log in to save your bag and place your order. Cash on delivery is now available.</p>
              <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-[#C0132A]/40 bg-white px-4 py-2 text-xs text-[#1A1A1A]">
                <strong>COD is live</strong>
              </div>
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void signInWithGoogle()}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#C0132A] disabled:cursor-wait disabled:opacity-60"
              >
                <LogIn size={16} />
                {signingIn ? 'Opening login…' : 'Continue with Google'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBundleNudge && (
          <motion.aside
            initial={{ opacity: 0, x: -18, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, y: 5, scale: 0.98 }}
            className="fixed bottom-5 left-4 z-[1100] flex w-[min(350px,calc(100vw-2rem))] items-center gap-3 rounded-[22px] border border-[#E9DDD1] bg-[#FFF9F2]/95 p-3.5 pr-4 shadow-[0_16px_45px_rgba(38,29,22,0.18)] backdrop-blur-md"
          >
            <img src={CDN.LOGO} alt="Burpy the slug" className="h-14 w-14 flex-none object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C0132A]">Added to your bag</p>
              <p className="mt-0.5 text-xs leading-snug text-[#3D3935]">End of Monsoon Sale · <strong>All tees ₹999</strong>. COD is live!</p>
              <a href="/cart" onClick={() => setShowBundleNudge(false)} className="mt-2 inline-flex min-h-9 items-center text-xs font-bold text-[#C0132A]">View bag & checkout →</a>
            </div>
            <button type="button" aria-label="Dismiss offer" onClick={() => setShowBundleNudge(false)} className="self-start text-[#8B837B]">
              <X size={14} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </CartLoginContext.Provider>
  );
}

export function useCartLogin() {
  const context = useContext(CartLoginContext);
  if (!context) throw new Error('useCartLogin must be used inside CartLoginProvider');
  return context;
}
