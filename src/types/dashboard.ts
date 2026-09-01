// ─── Slugsera Dashboard Type Definitions ─────────────────────
// Aligned with Supabase schema AND storefront Product type

export interface SizeStock {
  size: string;
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  mediaType?: 'image' | 'video';
}

export interface ProductColor {
  name: string;
  hex: string;
}

/** DB product row — matches Supabase `products` table exactly */
export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  sale_price: number | null;
  on_sale: boolean;
  category: string;
  subcategory: string | null;
  season: string | null;
  drop_name: string | null;
  badge: string | null;
  tags: string[];
  sizes: string[];
  colors: ProductColor[];
  images: ProductImage[];
  size_stock: SizeStock[];
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  status: 'active' | 'coming_soon' | 'sold_out';
  sort_order: number;
  material: string | null;
  fit: string | null;
  care_instructions: string[];
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export type ProductFormData = Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>;
export type Product = DbProduct;

export interface Drop {
  id: string;
  name: string;
  season: string;
  drop_date: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
  status: 'active' | 'coming_soon' | 'archived';
  product_ids: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DropFormData = Omit<Drop, 'id' | 'created_at' | 'updated_at'>;

/** Site sections for CMS control */
export interface SiteSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body_text: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  meta: Record<string, unknown>;
  updated_at: string;
}

/** Category */
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export type CategoryFormData = Omit<Category, 'id' | 'created_at'>;

/** Order from Supabase */
export interface Order {
  id: string;
  order_number: string | null;
  user_id: string | null;
  email: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: {
    street?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } | null;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  payment_id: string | null;
  status: string;
  notes: string | null;
  tracking_number?: string | null;
  courier?: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
  productId?: string;
  image?: string;
}

/** Dashboard stats */
export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalCategories: number;
  totalStock: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

/** Dashboard navigation view */
export type DashboardView =
  | 'overview'
  | 'products'
  | 'products-new'
  | 'products-edit'
  | 'categories'
  | 'homepage'
  | 'inventory'
  | 'orders'
  | 'settings';
