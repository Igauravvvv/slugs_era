import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Address, User, Product } from '@/types';
import { calculateShipping } from '@/utils/shipping';
import {
  FIRST_BUYER_DISCOUNT,
  calculatePrivateCouponDiscount,
  calculateLaunchSale,
  isFirstBuyerCode,
  isPrivateCouponCode,
  isTshirtBundleCode,
} from '@/utils/launchSale';

interface AppState {
  // Collection filters (used by Collections page via URL params too)
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  setCollectionFilter: (category: string | null, subcategory: string | null) => void;

  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Mobile About Section
  isAboutMobileVisible: boolean;
  setAboutMobileVisible: (visible: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getShipping: () => number;
  getOrderTotal: () => number;
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  bundlePromoCode: string | null;
  setBundlePromoCode: (code: string | null) => void;

  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Addresses
  addresses: Address[];
  selectedAddress: Address | null;
  addAddress: (address: Address) => void;
  selectAddress: (address: Address) => void;
  removeAddress: (id: string) => void;

  // Order
  orderNote: string;
  setOrderNote: (note: string) => void;

  // Order completion flag (to prevent direct access to success page)
  lastCompletedOrderId: string | null;
  setLastCompletedOrderId: (id: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Collection filters
      selectedCategory: null,
      selectedSubcategory: null,
      setCollectionFilter: (category, subcategory) => set({ selectedCategory: category, selectedSubcategory: subcategory }),

      // Products
      products: [],
      setProducts: (products) => set({ products }),

      // Wishlist
      wishlist: [],
      toggleWishlist: (productId) => {
        const { wishlist } = get();
        if (wishlist.includes(productId)) {
          set({ wishlist: wishlist.filter((id) => id !== productId) });
        } else {
          set({ wishlist: [...wishlist, productId] });
        }
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),

      // Mobile About Section
      isAboutMobileVisible: false,
      setAboutMobileVisible: (visible) => set({ isAboutMobileVisible: visible }),

      // Cart
      cart: [],
      promoCode: null,
      setPromoCode: (promoCode) => set({ promoCode }),
      bundlePromoCode: null,
      setBundlePromoCode: (bundlePromoCode) => set({ bundlePromoCode }),
      addToCart: (item) => {
        const { cart } = get();
        const existingIndex = cart.findIndex(
          (i) => i.product.id === item.product.id && i.size === item.size && i.color === item.color
        );
        if (existingIndex >= 0) {
          const newCart = [...cart];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + item.quantity,
          };
          set({ cart: newCart });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (productId, size, color) => {
        set({ cart: get().cart.filter((i) => !(i.product.id === productId && i.size === size && i.color === color)) });
      },
      updateQuantity: (productId, size, color, quantity) => {
        const safeQuantity = Math.max(1, Math.floor(quantity) || 1);
        const newCart = get().cart.map((item) =>
          item.product.id === productId && item.size === size && item.color === color
            ? { ...item, quantity: safeQuantity }
            : item
        );
        set({ cart: newCart });
      },
      clearCart: () => set({ cart: [], promoCode: null, bundlePromoCode: null }),
      getCartTotal: () => {
        const state = get();
        const privateCouponApplied = isPrivateCouponCode(state.promoCode);
        const launchPricing = calculateLaunchSale(
          state.cart,
          !privateCouponApplied && isTshirtBundleCode(state.bundlePromoCode),
        );
        const welcomeDiscount = !privateCouponApplied && isFirstBuyerCode(state.promoCode) ? FIRST_BUYER_DISCOUNT : 0;
        const privateDiscount = calculatePrivateCouponDiscount(state.cart, privateCouponApplied);
        return Math.max(0, launchPricing.saleSubtotal - welcomeDiscount - privateDiscount);
      },
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      getShipping: () => {
        return calculateShipping(get().getCartTotal());
      },
      getOrderTotal: () => {
        return get().getCartTotal() + get().getShipping();
      },

      // User
      user: null,
      setUser: (user) => set({ user }),

      // Addresses — fixed: no longer mutates existing objects in-place
      addresses: [],
      selectedAddress: null,
      addAddress: (address) => {
        const { addresses } = get();
        const updated = address.isDefault
          ? addresses.map((a) => ({ ...a, isDefault: false }))
          : addresses;
        set({ addresses: [...updated, address] });
      },
      selectAddress: (address) => set({ selectedAddress: address }),
      removeAddress: (id) => {
        set({ addresses: get().addresses.filter((a) => a.id !== id) });
      },

      // Order
      orderNote: '',
      setOrderNote: (note) => set({ orderNote: note }),

      // Order completion flag
      lastCompletedOrderId: null,
      setLastCompletedOrderId: (id) => set({ lastCompletedOrderId: id }),
    }),
    {
      name: 'slugs-era-store',
      version: 2,
      migrate: (persisted: any, _version: number) => {
        // v0/v1 → v2: no breaking changes, just return persisted state
        return persisted;
      },
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        addresses: state.addresses,
        wishlist: state.wishlist,
        promoCode: state.promoCode,
        bundlePromoCode: state.bundlePromoCode,
      }),
      merge: (persisted: any, current: AppState) => ({
        ...current,
        ...(persisted || {}),
        // Always start with empty products — they're set fresh from useProducts()
        products: [],
      }),
    }
  )
);
