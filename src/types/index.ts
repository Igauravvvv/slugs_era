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
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
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

export type View = 'home' | 'product' | 'cart' | 'address' | 'payment' | 'success' | 'collections';
