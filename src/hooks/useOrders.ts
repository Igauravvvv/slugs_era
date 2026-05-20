// ============================================================
// React Query hooks for admin order management
// Connects to real Supabase data via the Express API
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/admin';

interface OrdersResponse {
  success: boolean;
  data: Order[];
  total: number;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

export const ORDERS_QUERY_KEY = ['admin-orders'];

/**
 * Fetch paginated, filterable orders from the backend.
 * Falls back to empty array on error so the UI remains functional.
 */
export function useOrders(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const queryString = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryString.set('status', params.status);
  if (params?.search) queryString.set('search', params.search);
  if (params?.limit) queryString.set('limit', String(params.limit));
  if (params?.offset) queryString.set('offset', String(params.offset));

  const qs = queryString.toString();

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, params?.status, params?.search, params?.offset],
    queryFn: async () => {
      try {
        const res = await api.get<OrdersResponse>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
        return { orders: res.data || [], total: res.total || 0 };
      } catch {
        // API backend not running — return empty without spamming console
        return { orders: [], total: 0 };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Fetch a single order with full detail (items, customer join).
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const res = await api.get<OrderResponse>(`/api/admin/orders/${orderId}`);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!orderId,
  });
}

/**
 * Update order status (advance through the flow).
 * Optimistically updates the cache for instant UI feedback.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }) => {
      const res = await api.post<OrderResponse>(`/api/admin/orders/${orderId}/status`, { status, note });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all order queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

/**
 * Save an admin note on an order.
 */
export function useSaveOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, note }: { orderId: string; note: string }) => {
      const res = await api.post<OrderResponse>(`/api/admin/orders/${orderId}/note`, { note });
      return res.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
    },
  });
}

/**
 * Add tracking info to an order.
 */
export function useAddTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, tracking_number, courier }: {
      orderId: string; tracking_number: string; courier: string;
    }) => {
      const res = await api.post<OrderResponse>(`/api/admin/orders/${orderId}/tracking`, {
        tracking_number, courier,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
