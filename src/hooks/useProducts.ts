import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { products as localProducts } from '@/data/products';
import type { Product } from '@/types';

function mapDbToProduct(dbRow: any): Product {
  const images = dbRow.images || [];
  const primaryImg = images.find((img: any) => img.isPrimary)?.url || images[0]?.url || '';
  
  // Generate slug from DB field or derive from name
  const slug = dbRow.slug || (dbRow.name ? dbRow.name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');

  return {
    id: dbRow.id,
    name: dbRow.name || '',
    slug,
    slogan: dbRow.description ? dbRow.description.split('.')[0] : '',
    price: dbRow.price || 0,
    originalPrice: dbRow.compare_price || undefined,
    category: dbRow.category || 'tshirts',
    image: primaryImg,
    images: images.map((img: any) => img.url),
    badge: dbRow.tags && dbRow.tags.length > 0 ? dbRow.tags[dbRow.tags.length - 1] : undefined,
    colors: dbRow.colors?.map((c: any) => c.hex) || [],
    sizes: dbRow.sizes || [],
    description: dbRow.description || '',
    features: dbRow.tags || [],
    inStock: (dbRow.stock_quantity || 0) > 0,
    sizeStock: (dbRow.sizes || []).map((s: string) => ({
      size: s,
      stock: dbRow.stock_quantity > 0 ? Math.floor((dbRow.stock_quantity || 0) / (dbRow.sizes?.length || 1)) : 0,
    })),
    status: dbRow.is_published ? 'active' : 'draft',
    // stock field for admin use
    stock: dbRow.stock_quantity || 0
  } as any;
}

function mapProductToDb(p: Partial<Product> & { stock?: number }) {
  const slug = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
  let images = [];
  if (p.images && p.images.length > 0) {
    images = p.images.map((url, i) => ({ url, alt: `${p.name} - ${i + 1}`, isPrimary: i === 0 }));
  } else if (p.image) {
    images = [{ url: p.image, alt: p.name || '', isPrimary: true }];
  }
  
  const tags = [...(p.features || [])];
  if (p.badge) tags.push(p.badge);

  return {
    name: p.name,
    ...(slug && { slug }),
    description: p.description || '',
    category: p.category,
    price: p.price,
    compare_price: p.originalPrice || null,
    sizes: p.sizes || [],
    colors: p.colors?.map((c) => ({ name: c, hex: c })) || [],
    images: images,
    stock_quantity: p.stock ?? (p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0),
    is_published: p.status === 'active',
    is_featured: p.badge === 'Bestseller' || p.badge === 'Exclusive',
    tags: tags
  };
}

// Key for React Query cache
export const PRODUCTS_QUERY_KEY = ['products'];

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed, using local fallback:', error.message);
        return localProducts as Product[];
      }
      
      // If the table exists but is completely empty (no products migrated yet)
      // fallback to the mock data for testing purposes.
      if (!data || data.length === 0) {
        console.warn('No products found in DB. Falling back to local data.');
        return localProducts as Product[];
      }

      // Map DB fields back to our frontend Product type if necessary
      return data.map(mapDbToProduct);
    },
    initialData: localProducts as Product[],
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: Partial<Product> & { stock?: number }) => {
      // Omit frontend-only or local mock IDs when inserting if you rely on DB serial
      const dbPayload = mapProductToDb(newProduct);
      const { data, error } = await supabase
        .from('products')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed:', error.message);
        // Simulate success for local testing when keys are missing
        return { ...newProduct, id: `prod-${Date.now()}` } as Product;
      }
      return mapDbToProduct(data);
    },
    onSuccess: (savedProduct) => {
      queryClient.setQueryData(PRODUCTS_QUERY_KEY, (oldData: Product[] = []) => {
        return [savedProduct, ...oldData];
      });
    },
  });
}

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

      if (error) {
        console.warn('Supabase update failed:', error.message);
        return updatedProduct; // Simulate success
      }
      return mapDbToProduct(data);
    },
    onSuccess: (savedProduct) => {
      queryClient.setQueryData(PRODUCTS_QUERY_KEY, (oldData: Product[] = []) => {
        return oldData.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.warn('Supabase delete failed:', error.message);
      }
      return productId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(PRODUCTS_QUERY_KEY, (oldData: Product[] = []) => {
        return oldData.filter((p) => p.id !== deletedId);
      });
    },
  });
}
