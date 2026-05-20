import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Truck, CheckCircle, Clock, Package as PackageIcon,
  XCircle, RotateCcw, ChevronRight, MapPin, Phone, Mail, FileText,
  ArrowLeft, X, Check, AlertCircle
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus, useSaveOrderNote } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types/admin';

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock,       label: 'Pending' },
  confirmed:  { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: PackageIcon, label: 'Processing' },
  packed:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: PackageIcon, label: 'Packed' },
  shipped:    { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: Truck,       label: 'Shipped' },
  delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Delivered' },
  cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle,     label: 'Cancelled' },
  returned:   { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: RotateCcw,  label: 'Returned' },
};

// ─── Helper: human-readable time ago ───────────────────────
function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ─── Helper: extract items from order (handles legacy JSONB + normalized) ──
function getOrderItems(order: Order): { name: string; size: string; qty: number; price: number }[] {
  // If we have normalized order_items from the join
  if (order.items && Array.isArray(order.items) && order.items.length > 0 && order.items[0]?.product_name) {
    return order.items.map(item => ({
      name: item.product_name,
      size: item.size,
      qty: item.quantity,
      price: item.unit_price,
    }));
  }
  // Legacy: items stored as JSONB[] directly on the order
  if (order.items && Array.isArray(order.items)) {
    return (order.items as unknown as { name?: string; product_name?: string; size?: string; qty?: number; quantity?: number; price?: number; unit_price?: number }[]).map(item => ({
      name: item.name || item.product_name || 'Unknown Product',
      size: item.size || '—',
      qty: item.qty || item.quantity || 1,
      price: item.price || item.unit_price || 0,
    }));
  }
  return [];
}

// ==========================================
// ORDER DETAIL VIEW
// ==========================================
function OrderDetail({ order, onBack, onUpdateStatus, onCancel }: {
  order: Order; onBack: () => void;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}) {
  const config = statusConfig[order.status] || statusConfig.pending;
  const saveNoteMutation = useSaveOrderNote();
  const [note, setNote] = useState(order.admin_note || '');
  const [noteSaved, setNoteSaved] = useState(false);

  const nextStatus = statusFlow[statusFlow.indexOf(order.status as OrderStatus) + 1];
  const nextConfig = nextStatus ? statusConfig[nextStatus] : null;
  const items = getOrderItems(order);

  const handleSaveNote = () => {
    saveNoteMutation.mutate({ orderId: order.id, note });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Derive address display from shipping_address JSONB or fallback
  const addressStr = order.shipping_address
    ? `${order.shipping_address.address_line1}${order.shipping_address.address_line2 ? ', ' + order.shipping_address.address_line2 : ''}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}`
    : '—';

  const customerName = order.customer?.name || order.shipping_address?.full_name || 'Customer';
  const customerEmail = order.customer?.email || '—';
  const customerPhone = order.customer?.phone || order.shipping_address?.phone || '—';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{order.order_number || order.id.slice(0, 12)}</h2>
          <p className="text-gray-500 text-sm mt-0.5">Placed {getTimeAgo(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
            <FileText size={14} /> Invoice
          </button>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button onClick={() => onCancel(order.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-center gap-2">
              <XCircle size={14} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status + Actions */}
          <div className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Order Status</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase"
                  style={{ background: config.bg, color: config.color }}>{config.label}</span>
              </div>
              {nextStatus && order.status !== 'cancelled' && (
                <button onClick={() => onUpdateStatus(order.id, nextStatus)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-2 hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
                  Move to {nextConfig?.label} →
                </button>
              )}
            </div>

            {/* Status Progress Bar */}
            <div className="flex items-center gap-1 mb-6">
              {statusFlow.map((s, i) => {
                const reached = statusFlow.indexOf(order.status as OrderStatus) >= i;
                const sc = statusConfig[s];
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${reached ? '' : 'bg-white/5'}`}
                      style={reached ? { background: sc.bg } : {}}>
                      {reached ? <sc.icon size={13} style={{ color: sc.color }} /> : <div className="w-2 h-2 rounded-full bg-gray-700" />}
                    </div>
                    {i < statusFlow.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${reached ? 'bg-white/10' : 'bg-white/[0.03]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mb-4">
              {statusFlow.map((s) => (
                <span key={s} className="text-[9px] text-gray-600 uppercase tracking-wider text-center flex-1">{statusConfig[s].label}</span>
              ))}
            </div>

            {/* Tracking info if available */}
            {order.tracking_number && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mt-4">
                <p className="text-gray-400 text-xs">Tracking: <span className="text-white font-mono">{order.tracking_number}</span></p>
                {order.courier && <p className="text-gray-500 text-xs mt-0.5">Courier: {order.courier}</p>}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 className="text-white font-semibold mb-4">Order Items ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <PackageIcon size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">Size: {item.size} • Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No items data available</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">₹{(order.subtotal || order.total || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Shipping</span><span className="text-white">{(order.shipping_cost || 0) === 0 ? 'Free' : `₹${order.shipping_cost}`}</span></div>
              {(order.discount_amount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Discount</span><span className="text-emerald-400">-₹{order.discount_amount?.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5"><span className="text-white">Total</span><span className="text-white text-lg">₹{(order.total || 0).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-white font-semibold mb-3">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>{customerName[0]}</div>
                <div><p className="text-white text-sm font-medium">{customerName}</p></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Mail size={12} /> {customerEmail}</div>
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Phone size={12} /> {customerPhone}</div>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-white font-semibold mb-3">Shipping Address</h3>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed">{addressStr}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-white font-semibold mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="text-white">Razorpay</span></div>
              {order.payment_id && <div className="flex justify-between"><span className="text-gray-400">Payment ID</span><span className="text-white text-xs font-mono">{order.payment_id}</span></div>}
              <div className="flex justify-between"><span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {order.status === 'cancelled' ? 'REFUNDED' : 'PAID'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-white font-semibold mb-3">Admin Notes</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this order..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 resize-none"
              rows={3} />
            <button onClick={handleSaveNote}
              className={`mt-2 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${noteSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {noteSaved ? <><Check size={12} /> Saved!</> : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN ORDERS PAGE
// ==========================================
export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Real data from Supabase via API
  const { data: ordersData, isLoading } = useOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });
  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.total || 0;

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateStatusMutation.mutate(
      { orderId, status: nextStatus },
      {
        onSuccess: () => showNotif('success', `Order moved to "${statusConfig[nextStatus]?.label}"`),
        onError: (err) => showNotif('error', `Failed: ${err.message}`),
      }
    );
  };

  const handleCancel = (orderId: string) => {
    updateStatusMutation.mutate(
      { orderId, status: 'cancelled', note: 'Cancelled by admin' },
      {
        onSuccess: () => showNotif('success', 'Order cancelled'),
        onError: (err) => showNotif('error', `Failed: ${err.message}`),
      }
    );
  };

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrderId(null)}
      onUpdateStatus={handleUpdateStatus} onCancel={handleCancel} />;
  }

  // Compute status counts from full unfiltered data (we approximate from current page)
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[200] px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <p className="text-gray-500 text-sm mt-1">{totalCount > 0 ? `${totalCount} total orders` : isLoading ? 'Loading...' : 'No orders yet'}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'processing', label: 'Processing' },
          { key: 'shipped', label: 'Shipped' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'returned', label: 'Returned' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${statusFilter === tab.key ? 'text-white' : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'}`}
            style={statusFilter === tab.key ? { background: 'linear-gradient(135deg, rgba(192,19,42,0.2), rgba(255,71,87,0.1))', border: '1px solid rgba(192,19,42,0.3)' } : {}}>
            {tab.label}
            {statusCounts[tab.key] && tab.key !== 'all' ? (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === tab.key ? 'bg-[#C0132A] text-white' : 'bg-white/5 text-gray-500'}`}>{statusCounts[tab.key]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="Search by order number or customer..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {/* Loading skeleton */}
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                <div>
                  <div className="h-4 w-32 bg-white/5 animate-pulse rounded mb-1" />
                  <div className="h-3 w-48 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-white/5 animate-pulse rounded" />
            </div>
          </div>
        ))}

        {!isLoading && orders.map((order, i) => {
          const cfg = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = cfg.icon;
          const customerName = order.customer?.name || order.shipping_address?.full_name || 'Customer';
          const items = getOrderItems(order);
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedOrderId(order.id)}
              className="rounded-2xl p-4 cursor-pointer hover:bg-white/[0.02] transition-all group"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                    <StatusIcon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{order.order_number || order.id.slice(0, 12)}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{customerName} • {items.length} item{items.length !== 1 ? 's' : ''} • {getTimeAgo(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-bold">₹{(order.total || 0).toLocaleString('en-IN')}</p>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {!isLoading && orders.length === 0 && (
          <div className="py-16 text-center">
            <PackageIcon size={40} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">No orders found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers place them'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
