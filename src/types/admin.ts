// ============================================================
// Admin-specific type definitions for the dashboard
// ============================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type ShippingStatus = 'pending' | 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
export type ReturnStatus = 'requested' | 'approved' | 'picked_up' | 'refunded' | 'rejected';
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type AdminRole = 'owner' | 'manager' | 'support';
export type NotificationType = 'new_order' | 'low_stock' | 'return_request' | 'payment_failed' | 'system';

// ─── Order ─────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface TimelineEvent {
  status: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  items: OrderItem[];           // From order_items join, or legacy JSONB
  subtotal: number;
  shipping_cost: number;
  discount_code: string | null;
  discount_amount: number;
  total: number;
  status: OrderStatus;
  shipping_status: ShippingStatus;
  tracking_number: string | null;
  courier: string | null;
  payment_id: string | null;
  shipping_address: ShippingAddress | null;
  admin_note: string;
  created_at: string;
  updated_at: string;
  // Joined customer data (from users table)
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  // Client-side computed timeline (built from status history)
  timeline?: TimelineEvent[];
}

// ─── Notification ──────────────────────────────────────────
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ─── Return ────────────────────────────────────────────────
export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: ReturnStatus;
  refund_amount: number | null;
  admin_note: string;
  images: string[];
  created_at: string;
  updated_at: string;
  // Joined
  order?: Order;
  customer?: { name: string; email: string };
}

// ─── Discount ──────────────────────────────────────────────
export interface Discount {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  applies_to: string;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Analytics ─────────────────────────────────────────────
export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  deliveredOrders: number;
  pendingOrders: number;
  customerCount: number;
  productCount: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// ─── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  revenue: { total: number; change: number };
  orders: { total: number; pending: number; change: number };
  customers: { total: number; change: number };
  avgOrderValue: { value: number; change: number };
  lowStockCount: number;
  outOfStockCount: number;
  recentOrders: Order[];
  topProducts: { name: string; sold: number; revenue: number; stock: number }[];
}
