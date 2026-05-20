// ─── CMS Dashboard Type Definitions ──────────────────────────

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  category: 'tops' | 'bottoms' | 'outerwear' | 'accessories' | null;
  season: 'SS25' | 'FW24' | 'FW25' | 'Resort' | 'Limited' | null;
  drop_name: string | null;
  tags: string[] | null;
  sizes: string[] | null;
  colors: ProductColor[];
  images: ProductImage[];
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

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

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type DropFormData = Omit<Drop, 'id' | 'created_at' | 'updated_at'>;

export type SiteSectionFormData = Omit<SiteSection, 'id' | 'updated_at'>;

export type CategoryFormData = Omit<Category, 'id' | 'created_at'>;

// Dashboard stats
export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  activeDrops: number;
  totalCategories: number;
  totalStock: number;
  featuredProducts: number;
}

// Media library
export interface MediaFile {
  name: string;
  id: string;
  bucket_id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl?: string;
  } | null;
  publicUrl: string;
}

// Toast
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
