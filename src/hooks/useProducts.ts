import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, SizeStock } from '@/types';

// ─── DB ↔ Frontend Mapping ───────────────────────────────────

/** RichTextEditor stores HTML. Storefront cards and product details use plain
 * text, so convert it before rendering rather than exposing literal tags. */
function richTextToPlainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const withBreaks = value.replace(/<\/?(?:p|div|li|br|h[1-6])\b[^>]*>/gi, ' ');
  const withoutTags = withBreaks.replace(/<[^>]*>/g, ' ');
  const decoded = typeof document !== 'undefined'
    ? (() => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = withoutTags;
        return textarea.value;
      })()
    : withoutTags;
  return decoded.replace(/\s+/g, ' ').trim();
}

function mapDbToProduct(row: any): Product {
  const images: { url: string; alt: string; isPrimary: boolean }[] = row.images || [];
  const primaryImg = images.find((img) => img.isPrimary)?.url || images[0]?.url || row.image || '';

  const slug =
    row.slug ||
    (row.name
      ? row.name
          .toLowerCase()
          .replace(/[&]/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : '');

  // Build sizeStock — prefer DB size_stock. Legacy products only had one total,
  // so distribute that total without losing the remainder until an admin enters
  // the exact per-size quantities.
  let sizeStock: SizeStock[] = [];
  if (row.size_stock && Array.isArray(row.size_stock) && row.size_stock.length > 0) {
    sizeStock = row.size_stock.map((entry: SizeStock) => ({ size: entry.size, stock: Number(entry.stock) || 0 }));
  } else if (row.sizes && row.sizes.length > 0) {
    const perSize = row.stock_quantity > 0 ? Math.floor(row.stock_quantity / row.sizes.length) : 0;
    let remainder = row.stock_quantity > 0 ? row.stock_quantity % row.sizes.length : 0;
    sizeStock = row.sizes.map((s: string) => ({ size: s, stock: perSize + (remainder-- > 0 ? 1 : 0) }));
  }

  const totalStock = sizeStock.length > 0
    ? sizeStock.reduce((sum, s) => sum + s.stock, 0)
    : Number(row.stock_quantity) || 0;

  // Determine status
  let status: Product['status'] = 'active';
  if (row.status) {
    status = row.status;
  } else if (!row.is_published) {
    status = 'active'; // draft but still typed as active
  } else if (totalStock === 0) {
    status = 'sold_out';
  }

  // Badge
  const badge = row.badge || (row.tags && row.tags.length > 0 ? row.tags[row.tags.length - 1] : undefined);

  const description = richTextToPlainText(row.description);

  return {
    id: row.id,
    name: row.name || '',
    slug,
    slogan: description ? description.split('.')[0] : '',
    price: Number(row.price) || 0,
    originalPrice: row.compare_price ? Number(row.compare_price) : undefined,
    category: row.category || 'tshirts',
    subcategory: row.subcategory || undefined,
    image: primaryImg,
    images: images.map((img) => img.url),
    badge,
    colors: row.colors?.map((c: any) => (typeof c === 'string' ? c : c.hex)) || [],
    sizes: row.sizes || [],
    description,
    features: row.tags || [],
    inStock: totalStock > 0,
    isFeatured: Boolean(row.is_featured),
    sizeStock,
    status,
    material: row.material || undefined,
    fit: row.fit || undefined,
    careInstructions: row.care_instructions || [],
  };
}

function mapProductToDb(p: Partial<Product> & { stock?: number }) {
  const slug = p.name
    ? p.name
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : undefined;

  let images: { url: string; alt: string; isPrimary: boolean }[] = [];
  if (p.images && p.images.length > 0) {
    images = p.images.map((url, i) => ({ url, alt: `${p.name || ''} - ${i + 1}`, isPrimary: i === 0 }));
  } else if (p.image) {
    images = [{ url: p.image, alt: p.name || '', isPrimary: true }];
  }

  const totalStock =
    p.stock ?? p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) ?? 0;

  return {
    name: p.name,
    ...(slug && { slug }),
    description: p.description || '',
    category: p.category,
    subcategory: (p as any).subcategory || null,
    price: p.price,
    compare_price: p.originalPrice || null,
    sizes: p.sizes || [],
    colors: p.colors?.map((c) => ({ name: c, hex: c })) || [],
    images,
    size_stock: p.sizeStock || [],
    stock_quantity: totalStock,
    is_published: p.status !== 'sold_out',
    status: p.status || 'active',
    is_featured: p.isFeatured ?? (p.badge === 'Bestseller' || p.badge === 'Exclusive'),
    tags: p.features || [],
    badge: p.badge || null,
    material: p.material || null,
    fit: p.fit || null,
    care_instructions: (p as any).careInstructions || [],
  };
}

// ─── React Query Key ─────────────────────────────────────────
export const PRODUCTS_QUERY_KEY = ['products'];

// ─── Main Hook: Fetch All Products from Supabase ─────────────
export function useProducts() {
  const queryClient = useQueryClient();

  // Set up Supabase Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Invalidate the cache so React Query refetches
          queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch products:', error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(mapDbToProduct);
    },
    // Realtime is a convenience, not the source of truth. Refetch on each
    // storefront mount/focus so published description edits never remain stale.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
}

// ─── Create Product ──────────────────────────────────────────
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: Partial<Product> & { stock?: number }) => {
      const dbPayload = mapProductToDb(newProduct);
      const { data, error } = await supabase.from('products').insert(dbPayload).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

// ─── Update Product ──────────────────────────────────────────
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedProduct: Product & { stock?: number }) => {
      const dbPayload = mapProductToDb(updatedProduct);
      const { data, error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', updatedProduct.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['products'], (old: Product[] | undefined) => {
        if (!old) return old;
        return old.map((p) => (p.id === variables.id ? mapDbToProduct(data) : p));
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Delete Product ──────────────────────────────────────────
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw new Error(error.message);
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
