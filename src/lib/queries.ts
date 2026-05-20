import { supabase } from './supabase';
import type {
  Product,
  Drop,
  SiteSection,
  Category,
  DashboardStats,
  ProductFormData,
  DropFormData,
  CategoryFormData,
} from '@/types/dashboard';

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────

export async function fetchProducts(filters?: {
  category?: string;
  season?: string;
  published?: boolean;
  search?: string;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.season) {
    query = query.eq('season', filters.season);
  }
  if (filters?.published !== undefined) {
    query = query.eq('is_published', filters.published);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return (data || []) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  return data as Product;
}

export async function createProduct(product: ProductFormData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<ProductFormData>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
}

export async function updateProductSortOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
  // Update each product's sort_order — silently skip if column doesn't exist
  try {
    const promises = updates.map(({ id, sort_order }) =>
      supabase.from('products').update({ sort_order }).eq('id', id)
    );
    const results = await Promise.all(promises);
    const err = results.find((r) => r.error);
    if (err?.error) console.warn('sort_order update skipped:', err.error.message);
  } catch (e) {
    console.warn('sort_order column may not exist yet:', e);
  }
}

export async function toggleProductPublished(id: string, is_published: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_published })
    .eq('id', id);

  if (error) throw new Error(`Failed to toggle published: ${error.message}`);
}

export async function updateProductStock(id: string, stock_quantity: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity })
    .eq('id', id);

  if (error) throw new Error(`Failed to update stock: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────
// DROPS
// ─────────────────────────────────────────────────────────────

export async function fetchDrops(): Promise<Drop[]> {
  try {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Drops table not available:', error.message);
      return [];
    }
    return (data || []) as Drop[];
  } catch {
    return [];
  }
}

export async function fetchDropById(id: string): Promise<Drop | null> {
  try {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Drop;
  } catch {
    return null;
  }
}

export async function createDrop(drop: DropFormData): Promise<Drop> {
  const { data, error } = await supabase
    .from('drops')
    .insert(drop)
    .select()
    .single();

  if (error) throw new Error(`Drops table not ready. Run schema migration first. (${error.message})`);
  return data as Drop;
}

export async function updateDrop(id: string, updates: Partial<DropFormData>): Promise<Drop> {
  const { data, error } = await supabase
    .from('drops')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update drop: ${error.message}`);
  return data as Drop;
}

export async function deleteDrop(id: string): Promise<void> {
  const { error } = await supabase.from('drops').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete drop: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────
// SITE SECTIONS
// ─────────────────────────────────────────────────────────────

export async function fetchSiteSections(): Promise<SiteSection[]> {
  try {
    const { data, error } = await supabase
      .from('site_sections')
      .select('*')
      .order('section_key');

    if (error) {
      console.warn('Site sections table not available:', error.message);
      return [];
    }
    return (data || []) as SiteSection[];
  } catch {
    return [];
  }
}

export async function fetchSiteSection(key: string): Promise<SiteSection | null> {
  const { data, error } = await supabase
    .from('site_sections')
    .select('*')
    .eq('section_key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch section: ${error.message}`);
  }
  return data as SiteSection;
}

export async function updateSiteSection(
  key: string,
  updates: Partial<Omit<SiteSection, 'id' | 'updated_at'>>
): Promise<SiteSection> {
  const { data, error } = await supabase
    .from('site_sections')
    .update(updates)
    .eq('section_key', key)
    .select()
    .single();

  if (error) throw new Error(`Failed to update section: ${error.message}`);
  return data as SiteSection;
}

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Categories table not available:', error.message);
      return [];
    }
    return (data || []) as Category[];
  } catch {
    return [];
  }
}

export async function createCategory(category: CategoryFormData): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<CategoryFormData>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Products table is guaranteed — others may not exist yet
  const productsRes = await supabase.from('products').select('id, is_published, is_featured, stock_quantity');
  
  // Gracefully handle missing drops/categories tables
  let dropsCount = 0;
  let categoriesCount = 0;
  try {
    const dropsRes = await supabase.from('drops').select('id, is_active');
    if (!dropsRes.error) dropsCount = (dropsRes.data || []).filter((d: any) => d.is_active).length;
  } catch { /* drops table doesn't exist yet */ }
  try {
    const categoriesRes = await supabase.from('categories').select('id');
    if (!categoriesRes.error) categoriesCount = (categoriesRes.data || []).length;
  } catch { /* categories table doesn't exist yet */ }

  const products = productsRes.data || [];
  if (productsRes.error) console.warn('Products fetch warning:', productsRes.error.message);

  return {
    totalProducts: products.length,
    publishedProducts: products.filter((p) => p.is_published).length,
    draftProducts: products.filter((p) => !p.is_published).length,
    activeDrops: dropsCount,
    totalCategories: categoriesCount,
    totalStock: products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0),
    featuredProducts: products.filter((p) => p.is_featured).length,
  };
}

export async function fetchRecentProducts(limit = 5): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Failed to fetch recent products:', error.message);
    return [];
  }
  return (data || []) as Product[];
}
