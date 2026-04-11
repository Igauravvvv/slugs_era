import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, Address, User, View } from '@/types';

interface AppState {
  // Navigation
  currentView: View;
  selectedProduct: Product | null;
  setView: (view: View) => void;
  setSelectedProduct: (product: Product | null) => void;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  setCollectionFilter: (category: string | null, subcategory: string | null) => void;

  // Mobile About Section
  isAboutMobileVisible: boolean;
  setAboutMobileVisible: (visible: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  hasToteBag: boolean;
  addToteBag: () => void;

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
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      selectedProduct: null,
      setView: (view) => set({ currentView: view }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      selectedCategory: null,
      selectedSubcategory: null,
      setCollectionFilter: (category, subcategory) => set({ selectedCategory: category, selectedSubcategory: subcategory }),

      // Mobile About Section
      isAboutMobileVisible: false,
      setAboutMobileVisible: (visible) => set({ isAboutMobileVisible: visible }),

      // Cart
      cart: [],
      hasToteBag: false,
      addToCart: (item) => {
        const { cart } = get();
        const existingIndex = cart.findIndex(
          (i) => i.product.id === item.product.id && i.size === item.size
        );
        if (existingIndex >= 0) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += item.quantity;
          set({ cart: newCart });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (productId, size) => {
        set({ cart: get().cart.filter((i) => !(i.product.id === productId && i.size === size)) });
      },
      updateQuantity: (productId, size, quantity) => {
        const newCart = get().cart.map((item) =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        );
        set({ cart: newCart });
      },
      clearCart: () => set({ cart: [], hasToteBag: false }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      addToteBag: () => set({ hasToteBag: true }),

      // User
      user: null,
      setUser: (user) => set({ user }),

      // Addresses
      addresses: [],
      selectedAddress: null,
      addAddress: (address) => {
        const { addresses } = get();
        if (address.isDefault) {
          addresses.forEach((a) => (a.isDefault = false));
        }
        set({ addresses: [...addresses, address] });
      },
      selectAddress: (address) => set({ selectedAddress: address }),
      removeAddress: (id) => {
        set({ addresses: get().addresses.filter((a) => a.id !== id) });
      },

      // Order
      orderNote: '',
      setOrderNote: (note) => set({ orderNote: note }),
    }),
    {
      name: 'slugs-era-store',
      partialize: (state) => ({
        cart: state.cart,
        hasToteBag: state.hasToteBag,
        user: state.user,
        addresses: state.addresses,
      }),
    }
  )
);
