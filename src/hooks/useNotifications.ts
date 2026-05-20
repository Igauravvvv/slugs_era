// ============================================================
// React Query hooks for admin notifications
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Notification } from '@/types/admin';

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

export const NOTIFICATIONS_QUERY_KEY = ['admin-notifications'];

/**
 * Fetch latest notifications (unread first).
 * Polls every 15 seconds to surface new order alerts quickly.
 */
export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get<NotificationsResponse>('/api/admin/notifications');
        return res.data || [];
      } catch {
        // API backend not running — return empty silently
        return [];
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Mark one or all notifications as read.
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      await api.post('/api/admin/notifications/read', { ids: notificationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
