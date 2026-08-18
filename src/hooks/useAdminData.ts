/**
 * React Query hooks for the Slugsera Admin Dashboard v2.
 * Uses the SAME "products" and "orders" tables as the storefront.
 * Changes here reflect on the main site immediately.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────
export interface AdminProduct {
  id: string; name: string; description: string | null; category: string | null;
  sku: string | null; price: number; compare_at_price: number | null;
  on_sale: boolean; discount_value: number | null; discount_type: string | null;
  sale_price: number | null; cost_of_goods: number; stock_quantity: number;
  low_stock_threshold: number; ribbon: string | null; is_visible: boolean;
  show_in_pos: boolean; product_info: string | null; return_policy: string | null;
  shipping_info: string | null; created_at: string; updated_at: string;
  image: string | null; // primary image URL
  images_raw: string[]; // all image URLs from DB
}
export interface AdminProductImage { id: string; product_id: string; url: string; position: number; is_primary: boolean; }
export interface AdminProductVariant { id: string; product_id: string; variant_name: string | null; size: string | null; color: string | null; sku_suffix: string | null; price_override: number | null; stock_quantity: number; created_at: string; }
export interface AdminOrder { id: string; order_number: string; customer_name: string; customer_email: string | null; customer_phone: string | null; shipping_address: { street?: string; city?: string; state?: string; pincode?: string; country?: string } | null; items: Array<{ name: string; qty: number; price: number; size?: string }>; subtotal: number; shipping_fee: number; total: number; payment_method: string | null; payment_status: string; status: string; notes: string | null; created_at: string; updated_at: string; }
export interface AdminCustomer { id: string; name: string; email: string | null; phone: string | null; city: string | null; state: string | null; total_orders: number; total_spent: number; last_order_at: string | null; created_at: string; }
export interface AdminAnalyticsEvent { id: string; date: string; sessions: number; unique_visitors: number; page_views: number; source: string | null; created_at: string; }
export interface CustomerEvent {
  id: string;
  event_name: 'page_view' | 'product_clicked' | 'product_viewed' | 'size_selected' | 'add_to_cart' | 'quick_add' | 'signed_in';
  product_id: string | null;
  user_id: string | null;
  session_id: string;
  properties: Record<string, string | number | boolean | null>;
  created_at: string;
}
export interface StorefrontProfile { id: string; email: string; name: string | null; created_at: string; }
export interface AdminSiteSettings { id: string; store_name: string; currency: string; currency_symbol: string; timezone: string; founder_name: string | null; founder_email: string | null; logo_url: string | null; updated_at: string; }

const keys = {
  products: ['admin-products'] as const, product: (id: string) => ['admin-products', id] as const,
  productImages: (id: string) => ['admin-product-images', id] as const,
  productVariants: (id: string) => ['admin-product-variants', id] as const,
  orders: ['admin-orders'] as const, customers: ['admin-customers'] as const,
  analytics: ['admin-analytics'] as const, settings: ['admin-settings'] as const,
};

// Storefront query key — invalidate this so main site refreshes too
const STOREFRONT_PRODUCTS_KEY = ['products'];

// ─── Map DB row → AdminProduct ──────────────────────────────
function mapProduct(p: any): AdminProduct {
  const imgs: string[] = Array.isArray(p.images) ? p.images : [];
  return {
    id: p.id, name: p.name, description: p.description,
    category: p.category || 'Tee', sku: p.slug || null,
    price: Number(p.price) || 0,
    compare_at_price: p.compare_price ? Number(p.compare_price) : null,
    on_sale: !!p.compare_price,
    discount_value: p.compare_price ? Math.round((1 - Number(p.price) / Number(p.compare_price)) * 100) : null,
    discount_type: p.compare_price ? 'percent' : null,
    sale_price: Number(p.price) || 0,
    cost_of_goods: Math.round((Number(p.price) || 0) * 0.3),
    stock_quantity: p.stock_quantity ?? p.stock ?? 0,
    low_stock_threshold: 5,
    ribbon: p.is_featured ? 'Bestseller' : (p.badge || null),
    is_visible: p.is_published ?? true,
    show_in_pos: true,
    product_info: null, return_policy: null, shipping_info: null,
    created_at: p.created_at, updated_at: p.updated_at || p.created_at,
    image: p.image || imgs[0] || null,
    images_raw: imgs,
  };
}

// ─── PRODUCTS (same table as storefront) ────────────────────
export function useAdminProducts() {
  return useQuery({
    queryKey: keys.products,
    queryFn: async (): Promise<AdminProduct[]> => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: keys.product(id || ''), enabled: !!id,
    queryFn: async (): Promise<AdminProduct | null> => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id!).single();
      if (error) throw error;
      return mapProduct(data);
    },
  });
}

export function useAdminProductImages(productId: string | undefined) {
  return useQuery({ queryKey: keys.productImages(productId || ''), enabled: !!productId,
    queryFn: async () => [] as AdminProductImage[],
  });
}
export function useAdminProductVariants(productId: string | undefined) {
  return useQuery({ queryKey: keys.productVariants(productId || ''), enabled: !!productId,
    queryFn: async () => [] as AdminProductVariant[],
  });
}

export function useCreateAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<AdminProduct>) => {
      const payload: any = { name: product.name, description: product.description, price: product.price, category: product.category, stock_quantity: product.stock_quantity || 0, is_published: product.is_visible ?? true, is_featured: product.ribbon === 'Bestseller' };
      if (product.sku) payload.slug = product.sku;
      const { data, error } = await supabase.from('products').insert([payload]).select().single();
      if (error) throw error;
      return mapProduct(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: STOREFRONT_PRODUCTS_KEY });
    },
  });
}

export function useUpdateAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminProduct> & { id: string }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.stock_quantity !== undefined) payload.stock_quantity = updates.stock_quantity;
      if (updates.is_visible !== undefined) payload.is_published = updates.is_visible;
      if (updates.ribbon !== undefined) payload.is_featured = updates.ribbon === 'Bestseller';
      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapProduct(data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: keys.product(vars.id) });
      qc.invalidateQueries({ queryKey: STOREFRONT_PRODUCTS_KEY });
    },
  });
}

export function useDeleteAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: STOREFRONT_PRODUCTS_KEY });
    },
  });
}

export function useUploadProductImage() { return useMutation({ mutationFn: async (_: any) => ({} as AdminProductImage) }); }
export function useDeleteProductImage() { return useMutation({ mutationFn: async (_: any) => '' }); }
export function useCreateVariant() { return useMutation({ mutationFn: async (_: any) => ({} as AdminProductVariant) }); }
export function useDeleteVariant() { return useMutation({ mutationFn: async (_: any) => '' }); }

// ─── ORDERS ─────────────────────────────────────────────────
export function useAdminOrders() {
  return useQuery({
    queryKey: keys.orders,
    queryFn: async (): Promise<AdminOrder[]> => {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((o: any) => ({
          id: o.id, order_number: o.order_number || `#SLG-${o.id.slice(0, 4)}`,
          customer_name: o.customer_name || 'Customer', customer_email: o.customer_email,
          customer_phone: o.customer_phone, shipping_address: o.shipping_address,
          items: o.items || [], subtotal: Number(o.subtotal || o.total || 0),
          shipping_fee: Number(o.shipping_fee || 0), total: Number(o.total || 0),
          payment_method: o.payment_method, payment_status: o.payment_status || 'Pending',
          status: o.status || 'Pending', notes: o.notes,
          created_at: o.created_at, updated_at: o.updated_at || o.created_at,
        }));
      } catch { return []; }
    },
  });
}

export function useUpdateAdminOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminOrder> & { id: string }) => {
      const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as AdminOrder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.orders }),
  });
}

// ─── CUSTOMERS (fallback) ───────────────────────────────────
const FALLBACK_CUSTOMERS: AdminCustomer[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '9876543210', city: 'Noida', state: 'UP', total_orders: 3, total_spent: 4497, last_order_at: new Date(Date.now() - 2*86400000).toISOString(), created_at: new Date(Date.now() - 30*86400000).toISOString() },
  { id: '2', name: 'Priya Patel', email: 'priya.p@gmail.com', phone: '9123456789', city: 'Mumbai', state: 'MH', total_orders: 2, total_spent: 5497, last_order_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 20*86400000).toISOString() },
  { id: '3', name: 'Arjun Mehta', email: 'arjun.m@outlook.com', phone: '9988776655', city: 'Bangalore', state: 'KA', total_orders: 1, total_spent: 2998, last_order_at: new Date(Date.now() - 6*3600000).toISOString(), created_at: new Date(Date.now() - 10*86400000).toISOString() },
  { id: '4', name: 'Sneha Gupta', email: 'sneha.g@gmail.com', phone: '8877665544', city: 'Kolkata', state: 'WB', total_orders: 1, total_spent: 1499, last_order_at: new Date().toISOString(), created_at: new Date(Date.now() - 5*86400000).toISOString() },
  { id: '5', name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '7766554433', city: 'Jaipur', state: 'RJ', total_orders: 1, total_spent: 1299, last_order_at: new Date(Date.now() - 3*3600000).toISOString(), created_at: new Date(Date.now() - 7*86400000).toISOString() },
  { id: '6', name: 'Ananya Reddy', email: 'ananya.r@gmail.com', phone: '9654321876', city: 'Hyderabad', state: 'TS', total_orders: 4, total_spent: 7996, last_order_at: new Date(Date.now() - 5*86400000).toISOString(), created_at: new Date(Date.now() - 45*86400000).toISOString() },
  { id: '7', name: 'Karan Chopra', email: 'karan.c@gmail.com', phone: '8899001122', city: 'Delhi', state: 'DL', total_orders: 2, total_spent: 2998, last_order_at: new Date(Date.now() - 7*86400000).toISOString(), created_at: new Date(Date.now() - 15*86400000).toISOString() },
];
export function useAdminCustomers() {
  return useQuery({ queryKey: keys.customers, queryFn: async () => FALLBACK_CUSTOMERS });
}

// ─── ANALYTICS (real storefront events) ─────────────────────
export function useAdminAnalytics(days = 30) {
  return useQuery({
    queryKey: [...keys.analytics, days],
    queryFn: async (): Promise<AdminAnalyticsEvent[]> => {
      const from = new Date();
      from.setDate(from.getDate() - days);
      const { data, error } = await supabase
        .from('customer_events')
        .select('id, event_name, user_id, session_id, created_at')
        .gte('created_at', from.toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;

      const byDate = new Map<string, { sessions: Set<string>; visitors: Set<string>; pageViews: number }>();
      for (let i = days; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        byDate.set(d.toISOString().slice(0, 10), { sessions: new Set(), visitors: new Set(), pageViews: 0 });
      }
      (data || []).forEach((event: any) => {
        const date = event.created_at.slice(0, 10);
        const row = byDate.get(date);
        if (!row) return;
        row.sessions.add(event.session_id);
        row.visitors.add(event.user_id || event.session_id);
        if (event.event_name === 'page_view' || event.event_name === 'product_viewed') row.pageViews += 1;
      });
      return Array.from(byDate.entries()).map(([date, value]) => ({
        id: date,
        date,
        sessions: value.sessions.size,
        unique_visitors: value.visitors.size,
        page_views: value.pageViews,
        source: 'Storefront activity',
        created_at: date,
      }));
    },
  });
}

export function useCustomerActivity(days = 30) {
  return useQuery({
    queryKey: ['customer-activity', days],
    queryFn: async (): Promise<CustomerEvent[]> => {
      const from = new Date();
      from.setDate(from.getDate() - days);
      const { data, error } = await supabase
        .from('customer_events')
        .select('id, event_name, product_id, user_id, session_id, properties, created_at')
        .gte('created_at', from.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CustomerEvent[];
    },
  });
}

export function useStorefrontProfiles() {
  return useQuery({
    queryKey: ['storefront-profiles'],
    queryFn: async (): Promise<StorefrontProfile[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as StorefrontProfile[];
    },
  });
}

// ─── SITE SETTINGS (in-memory) ──────────────────────────────
let localSettings: AdminSiteSettings = { id: '1', store_name: 'Slugsera', currency: 'INR', currency_symbol: '₹', timezone: 'Asia/Kolkata', founder_name: 'Gaurav', founder_email: 'slugsera@gmail.com', logo_url: null, updated_at: new Date().toISOString() };
export function useAdminSettings() { return useQuery({ queryKey: keys.settings, queryFn: async () => localSettings }); }
export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<AdminSiteSettings>) => { localSettings = { ...localSettings, ...updates, updated_at: new Date().toISOString() }; return localSettings; },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  });
}

// ─── Helpers ────────────────────────────────────────────────
export function formatINR(amount: number): string { return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
export function formatDate(dateStr: string): string { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
export function formatDateTime(dateStr: string): string { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
