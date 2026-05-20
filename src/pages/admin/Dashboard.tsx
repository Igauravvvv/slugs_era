import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  Clock, CheckCircle, Truck, Package, Box, Bell
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useNotifications } from '@/hooks/useNotifications';
import type { Product } from '@/types';
import type { Order } from '@/types/admin';

// ─── Stat Card Component ───────────────────────────────────
function StatCard({ title, value, change, icon: Icon, prefix = '', loading }: {
  title: string; value: string; change: number; icon: React.ElementType; prefix?: string; loading?: boolean;
}) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: 'linear-gradient(135deg, rgba(192,19,42,0.05), transparent)' }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-24 mt-1 rounded-lg bg-white/5 animate-pulse" />
          ) : (
            <motion.p
              className="text-2xl font-bold text-white mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {prefix}{value}
            </motion.p>
          )}
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, rgba(192,19,42,0.15), rgba(255,71,87,0.08))' }}>
          <Icon size={18} className="text-[#ff4757]" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Status config for order badges ────────────────────────
const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  confirmed: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: CheckCircle },
  processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Package },
  packed: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Package },
  shipped: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: Truck },
  delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
};

// ─── Compute stats from real product data ──────────────────
function computeProductStats(products: Product[]) {
  let totalStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const categoryBreakdown: Record<string, number> = {};

  products.filter(p => p.status !== 'coming_soon').forEach(p => {
    const stock = p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
    totalStock += stock;

    const cat = p.category === 'tshirts' ? 'T-Shirts' : p.category === 'shirts' ? 'Shirts' : p.category === 'hoodies' ? 'Hoodies' : 'Accessories';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

    p.sizeStock?.forEach(s => {
      if (s.stock === 0 && !s.preOrder) outOfStockCount++;
      else if (s.stock > 0 && s.stock <= 3) lowStockCount++;
    });
  });

  return { totalStock, lowStockCount, outOfStockCount, categoryBreakdown };
}

// ─── Compute order-based stats ─────────────────────────────
function computeOrderStats(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue trend — compute a simple month-over-month % (or return 0 if insufficient data)
  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter(o => {
    const d = new Date(o.created_at);
    const lm = new Date(now); lm.setMonth(lm.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const thisMonthRev = thisMonth.reduce((s, o) => s + (o.total || 0), 0);
  const lastMonthRev = lastMonth.reduce((s, o) => s + (o.total || 0), 0);
  const revenueChange = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : 0;
  const orderChange = lastMonth.length > 0 ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0;

  return { totalRevenue, totalOrders, pendingOrders, avgOrderValue, revenueChange, orderChange };
}

// ─── Generate revenue chart data from orders ───────────────
function buildRevenueChartData(orders: Order[]) {
  if (orders.length === 0) {
    // Return placeholder data so the chart isn't empty
    const data = [];
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 3);
      data.push({
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: 0, orders: 0,
      });
    }
    return data;
  }

  const byDate: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach(o => {
    if (o.status === 'cancelled') return;
    const dateKey = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!byDate[dateKey]) byDate[dateKey] = { revenue: 0, orders: 0 };
    byDate[dateKey].revenue += o.total || 0;
    byDate[dateKey].orders += 1;
  });

  return Object.entries(byDate)
    .slice(-15) // last 15 data points
    .map(([date, vals]) => ({ date, revenue: Math.round(vals.revenue), orders: vals.orders }));
}

// ─── MAIN DASHBOARD COMPONENT ──────────────────────────────
export default function Dashboard() {
  // Real data hooks
  const { data: dbProducts = [], isLoading: productsLoading } = useProducts();
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 200 });
  const notifications = useNotifications();

  const orders = ordersData?.orders || [];
  const isLoading = productsLoading || ordersLoading;

  // Compute stats from real data
  const productStats = useMemo(() => computeProductStats(dbProducts), [dbProducts]);
  const orderStats = useMemo(() => computeOrderStats(orders), [orders]);
  const revenueData = useMemo(() => buildRevenueChartData(orders), [orders]);

  const categoryData = useMemo(() => {
    const total = Object.values(productStats.categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = { 'T-Shirts': '#C0132A', 'Shirts': '#ff4757', 'Hoodies': '#ff6b81', 'Accessories': '#ff8a9e' };
    return Object.entries(productStats.categoryBreakdown).map(([name, value]) => ({
      name, value: Math.round((value / total) * 100),
      color: colors[name] || '#ccc',
    }));
  }, [productStats]);

  // Recent orders (last 5)
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  // Build alerts from real data
  const unreadNotifs = (notifications.data || []).filter(n => !n.is_read);
  const alerts = useMemo(() => {
    const alertList: { icon: React.ElementType; message: string; color: string; detail?: string }[] = [];

    if (productStats.lowStockCount > 0) {
      alertList.push({
        icon: AlertTriangle,
        message: `${productStats.lowStockCount} size variants running low on stock`,
        color: '#f59e0b',
      });
    }
    if (productStats.outOfStockCount > 0) {
      alertList.push({
        icon: Box,
        message: `${productStats.outOfStockCount} size variants out of stock`,
        color: '#ef4444',
      });
    }
    if (orderStats.pendingOrders > 0) {
      alertList.push({
        icon: Clock,
        message: `${orderStats.pendingOrders} order${orderStats.pendingOrders > 1 ? 's' : ''} pending confirmation`,
        color: '#3b82f6',
      });
    }
    if (unreadNotifs.length > 0) {
      alertList.push({
        icon: Bell,
        message: `${unreadNotifs.length} unread notification${unreadNotifs.length > 1 ? 's' : ''}`,
        color: '#8b5cf6',
      });
    }
    // Always show at least one alert
    if (alertList.length === 0) {
      alertList.push({ icon: CheckCircle, message: 'All systems operational', color: '#10b981' });
    }
    return alertList;
  }, [productStats, orderStats, unreadNotifs]);

  // Top products by stock (real data)
  const topProducts = useMemo(() => {
    return dbProducts
      .filter(p => p.status !== 'coming_soon')
      .map(p => ({
        name: p.name,
        stock: p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0,
        price: p.price,
        category: p.category,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 4);
  }, [dbProducts]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, Gaurav 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today</p>
      </div>

      {/* Stat Cards — now from real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={orderStats.totalRevenue.toLocaleString('en-IN')}
          change={orderStats.revenueChange}
          icon={DollarSign}
          prefix="₹"
          loading={isLoading}
        />
        <StatCard
          title="Total Orders"
          value={orderStats.totalOrders.toString()}
          change={orderStats.orderChange}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatCard
          title="Total Stock"
          value={productStats.totalStock.toString()}
          change={0}
          icon={Package}
          loading={isLoading}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${orderStats.avgOrderValue.toLocaleString('en-IN')}`}
          change={0}
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Revenue Overview</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {orders.length > 0 ? `Based on ${orders.length} orders` : 'No orders yet — data will appear here'}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C0132A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C0132A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,17,24,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: '#ff4757' }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C0132A" strokeWidth={2.5}
                    fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#C0132A', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="text-white font-semibold mb-1">Products by Category</h3>
          <p className="text-gray-500 text-xs mb-4">{dbProducts.length} total products</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                   dataKey="value" stroke="none" paddingAngle={3}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,17,24,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-gray-400 text-xs">{cat.name}</span>
                </div>
                <span className="text-white text-xs font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders — from real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Recent Orders</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {orders.length > 0 ? 'Latest customer orders' : 'Orders will appear here once placed'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && !isLoading && (
              <div className="py-8 text-center">
                <ShoppingCart size={32} className="mx-auto text-gray-700 mb-2" />
                <p className="text-gray-500 text-sm">No orders yet</p>
              </div>
            )}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
                  <div>
                    <div className="h-4 w-24 bg-white/5 animate-pulse rounded mb-1" />
                    <div className="h-3 w-32 bg-white/5 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
            {recentOrders.map((order, i) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const customerName = order.customer?.name || order.shipping_address?.full_name || 'Customer';
              const timeAgo = getTimeAgo(order.created_at);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: config.bg }}>
                      <StatusIcon size={16} style={{ color: config.color }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{order.order_number || order.id.slice(0, 12)}</p>
                      <p className="text-gray-500 text-xs">{customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">₹{(order.total || 0).toLocaleString('en-IN')}</p>
                    <p className="text-gray-500 text-xs">{timeAgo}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                       style={{ background: config.bg, color: config.color }}>
                    {order.status}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column: Top Products + Alerts */}
        <div className="space-y-4">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h3 className="text-white font-semibold mb-3">Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-gray-600 text-xs font-bold w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-xs">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`text-xs font-medium ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {product.stock > 0 ? `${product.stock} left` : 'No stock'}
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-4">No products loaded</p>
              )}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h3 className="text-white font-semibold mb-3">⚡ Alerts</h3>
            <div className="space-y-2.5">
              {alerts.map((alert, i) => (
                <div key={i} className="p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors"
                     style={{ background: `${alert.color}08` }}>
                  <div className="flex items-center gap-3">
                    <alert.icon size={16} style={{ color: alert.color }} />
                    <p className="text-gray-300 text-xs flex-1">{alert.message}</p>
                    <ArrowUpRight size={12} className="text-gray-600" />
                  </div>
                  {alert.detail && (
                    <p className="text-gray-600 text-[10px] mt-1 ml-7 truncate">{alert.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: human-readable time ago ───────────────────────
function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
