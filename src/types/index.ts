export interface SizeStock {
  size: string;
  stock: number;         // 0 = out of stock
  preOrder?: boolean;    // true = available for pre-order
}

export interface Product {
  id: string;
  name: string;
  slogan: string;
  price: number;
  originalPrice?: number;
  category: 'tshirts' | 'shirts' | 'hoodies' | 'accessories';
  image: string;
  images: string[];
  badge?: string;
  colors: string[];
  sizes: string[];
  description: string;
  features: string[];
  inStock: boolean;
  subcategory?: string;
  slug?: string;             // DB slug for URL-based lookups

  // Deep stock & availability
  sizeStock?: SizeStock[];     // Per-size stock levels
  status?: 'active' | 'coming_soon' | 'pre_book' | 'sold_out';
  launchDate?: string;         // For coming-soon products
  preOrderPrice?: number;      // Discounted pre-order price
  maxPreOrders?: number;       // Limit pre-orders
  careInstructions?: string[];
  material?: string;
  fit?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  isPreOrder?: boolean;  // Track pre-order items in cart
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
}

// Product slug helper
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
