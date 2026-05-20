import { useAdminProducts, useAdminOrders, useAdminCustomers, formatINR, formatDate } from '@/hooks/useAdminData';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ─── Status Badge ────────────────────────────────────────────
const statusColors: Record<string, { bg: string; text: string }> = {
  Pending:    { bg: '#FFF8E1', text: '#F57F17' },
  Processing: { bg: '#FFF8E1', text: '#F57F17' },
  Dispatched: { bg: '#E8F0FE', text: '#1A73E8' },
  Delivered:  { bg: '#E6F4EA', text: '#2E7D32' },
  Cancelled:  { bg: '#FEECEC', text: '#C0392B' },
  Paid:       { bg: '#E6F4EA', text: '#2E7D32' },
  Refunded:   { bg: '#FEECEC', text: '#C0392B' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
}

interface OverviewProps {
  onNavigate: (view: string) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const products = useAdminProducts();
  const orders = useAdminOrders();
  const customers = useAdminCustomers();

  const allProducts = products.data || [];
  const allOrders = orders.data || [];
  const allCustomers = customers.data || [];
  const isLoading = products.isLoading || orders.isLoading || customers.isLoading;

  // ─── Compute metrics ──────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  const ordersToday = allOrders.filter(o => o.created_at.startsWith(today) && o.status !== 'Cancelled');
  const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  const liveProducts = allProducts.filter(p => p.is_visible).length;
  const customersToday = allCustomers.filter(c => c.created_at.startsWith(today)).length;

  const lowStockProducts = allProducts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.is_visible);
  const recentOrders = allOrders.slice(0, 5);

  // Top sellers (from order items)
  const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
  allOrders.forEach(o => {
    if (o.status === 'Cancelled' || !o.items) return;
    (o.items as any[]).forEach(item => {
      const key = item.name || 'Unknown';
      if (!productSales[key]) productSales[key] = { name: key, units: 0, revenue: 0 };
      productSales[key].units += item.qty || 1;
      productSales[key].revenue += (item.price || 0) * (item.qty || 1);
    });
  });
  const topSellers = Object.values(productSales).sort((a, b) => b.units - a.units).slice(0, 3);

  // ─── Greeting ─────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">{greeting}, Slugsera.</h1>
        <p className="text-sm text-[#9E9E9E] mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#C0392B]/20"
             style={{ borderLeft: '3px solid #C0392B' }}>
          <AlertTriangle size={18} className="text-[#C0392B] flex-shrink-0" />
          <p className="text-sm text-[#1A1A1A] flex-1">
            <span className="font-semibold">{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock</span>
            {' — '}
            {lowStockProducts.slice(0, 2).map(p => p.name).join(', ')}
            {lowStockProducts.length > 2 && ` +${lowStockProducts.length - 2} more`}
          </p>
          <button onClick={() => onNavigate('products')} className="text-sm font-medium text-[#C0392B] hover:underline whitespace-nowrap">
            View
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
              <Skeleton className="w-24 h-3 mb-3" />
              <Skeleton className="w-32 h-7" />
            </div>
          ))
        ) : (
          <>
            <MetricCard icon={TrendingUp} label="Revenue today" value={formatINR(revenueToday)} />
            <MetricCard icon={ShoppingCart} label="Orders today" value={String(ordersToday.length)} />
            <MetricCard icon={Package} label="Products live" value={String(liveProducts)} />
            <MetricCard icon={Users} label="New customers today" value={String(customersToday)} />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <ActionButton label="+ Add Product" onClick={() => onNavigate('product-edit')} />
        <ActionButton label="View Orders" onClick={() => onNavigate('orders')} />
        <ActionButton label="See Analytics" onClick={() => onNavigate('analytics')} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E5E5]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Recent Orders</h2>
            <button onClick={() => onNavigate('orders')} className="text-xs font-medium text-[#C0392B] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingCart size={32} className="mx-auto text-[#E5E5E5] mb-2" />
              <p className="text-sm text-[#9E9E9E]">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">
                    <th className="text-left px-5 py-2.5">Order</th>
                    <th className="text-left px-3 py-2.5">Customer</th>
                    <th className="text-left px-3 py-2.5 hidden sm:table-cell">Product(s)</th>
                    <th className="text-right px-3 py-2.5">Amount</th>
                    <th className="text-left px-3 py-2.5">Status</th>
                    <th className="text-left px-5 py-2.5 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const items = (order.items as any[]) || [];
                    const productNames = items.map(i => i.name).join(', ');
                    return (
                      <tr key={order.id} className="border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors cursor-pointer" onClick={() => onNavigate('orders')}>
                        <td className="px-5 py-3 font-medium text-[#1A1A1A]">{order.order_number}</td>
                        <td className="px-3 py-3 text-[#6B6B6B]">{order.customer_name}</td>
                        <td className="px-3 py-3 text-[#6B6B6B] truncate max-w-[180px] hidden sm:table-cell">{productNames}</td>
                        <td className="px-3 py-3 text-right font-medium text-[#1A1A1A]">{formatINR(order.total)}</td>
                        <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-5 py-3 text-[#9E9E9E] hidden sm:table-cell">{formatDate(order.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Top Selling (All Time)</h2>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : topSellers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#9E9E9E]">No sales data yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {topSellers.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F6F6F4] flex items-center justify-center text-sm font-bold text-[#9E9E9E]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                    <p className="text-xs text-[#9E9E9E]">{item.units} units · {formatINR(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-[#9E9E9E]" />
        <span className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-[#C0392B] border border-[#C0392B] rounded-lg hover:bg-[#C0392B] hover:text-white transition-colors"
    >
      {label}
    </button>
  );
}
