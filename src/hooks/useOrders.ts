// ============================================================
// React Query hooks for admin order management
// Reads directly from Supabase orders table
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types/dashboard';

export const ORDERS_QUERY_KEY = ['admin-orders'];

/**
 * Fetch orders directly from Supabase.
 */
export function useOrders(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, params?.status, params?.search, params?.offset],
    queryFn: async () => {
      try {
        let query = supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (params?.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }
        if (params?.search) {
          query = query.or(
            `customer_name.ilike.%${params.search}%,order_number.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`
          );
        }
        if (params?.limit) {
          const offset = params.offset || 0;
          query = query.range(offset, offset + params.limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
          console.warn('Orders fetch failed:', error.message);
          return { orders: [] as Order[], total: 0 };
        }
        return { orders: (data || []) as Order[], total: count || 0 };
      } catch {
        return { orders: [] as Order[], total: 0 };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Fetch a single order by ID.
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) return null;
      return data as Order;
    },
    enabled: !!orderId,
  });
}

/**
 * Update order status.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }) => {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (note !== undefined) updates.notes = note;

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update order: ${error.message}`);
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
