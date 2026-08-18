import { useState, useMemo } from 'react';
import { useAdminAnalytics, useAdminOrders, useAdminCustomers, useCustomerActivity, useStorefrontProfiles, formatINR } from '@/hooks/useAdminData';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

const PERIOD_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const DONUT_COLORS = ['#C0392B', '#2E7D32', '#1A73E8', '#F57F17', '#6B6B6B'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const analytics = useAdminAnalytics(period);
  const orders = useAdminOrders();
  const customers = useAdminCustomers();
  const activity = useCustomerActivity(period);
  const profiles = useStorefrontProfiles();
  const isLoading = analytics.isLoading;

  const data = analytics.data || [];
  const allOrders = orders.data || [];
  const allCustomers = customers.data || [];
  const events = activity.data || [];
  const allProfiles = profiles.data || [];

  // ─── Aggregated metrics ───────────────────────────────────
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0);
  const totalVisitors = data.reduce((s, d) => s + d.unique_visitors, 0);

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - period);
  const periodOrders = allOrders.filter(o => new Date(o.created_at) >= periodStart && o.status !== 'Cancelled');
  const totalRevenue = periodOrders.reduce((s, o) => s + o.total, 0);

  // Previous period comparison
  const prevStart = new Date(periodStart);
  prevStart.setDate(prevStart.getDate() - period);
  const prevData = (analytics.data || []).slice(0, Math.floor(data.length / 2));
  const prevSessions = prevData.reduce((s, d) => s + d.sessions, 0) || 1;
  const sessionChange = ((totalSessions - prevSessions) / prevSessions * 100);

  // Signed-in customers are shown only to admins through the protected users
  // table. Raw email is never stored in the behavioural event stream.
  const signedInUserIds = new Set(events.filter((event) => event.event_name === 'signed_in' && event.user_id).map((event) => event.user_id!));
  const signedInCustomers = allProfiles.filter((profile) => signedInUserIds.has(profile.id));

  const productInterest = useMemo(() => {
    const interest = new Map<string, { product: string; views: number; clicks: number; sizeSelections: number; carts: number }>();
    events.forEach((event) => {
      if (!event.product_id) return;
      const existing = interest.get(event.product_id) || {
        product: String(event.properties.product_name || 'Product'), views: 0, clicks: 0, sizeSelections: 0, carts: 0,
      };
      if (event.event_name === 'product_viewed') existing.views += 1;
      if (event.event_name === 'product_clicked') existing.clicks += 1;
      if (event.event_name === 'size_selected') existing.sizeSelections += 1;
      if (event.event_name === 'add_to_cart' || event.event_name === 'quick_add') existing.carts += 1;
      interest.set(event.product_id, existing);
    });
    return Array.from(interest.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.carts + b.sizeSelections + b.clicks + b.views) - (a.carts + a.sizeSelections + a.clicks + a.views))
      .slice(0, 8);
  }, [events]);

  // ─── Sessions over time chart ─────────────────────────────
  const sessionsChart = useMemo(() => {
    return data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      sessions: d.sessions,
      visitors: d.unique_visitors,
    }));
  }, [data]);

  // ─── Traffic sources ──────────────────────────────────────
  const sources = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      const src = d.source || 'Direct';
      map[src] = (map[src] || 0) + d.sessions;
    });
    return Object.entries(map)
      .map(([source, count]) => ({ source, count, pct: totalSessions ? Math.round(count / totalSessions * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [data, totalSessions]);

  // ─── Revenue chart ────────────────────────────────────────
  const revenueChart = useMemo(() => {
    const dayMap: Record<string, number> = {};
    periodOrders.forEach(o => {
      const day = o.created_at.split('T')[0];
      dayMap[day] = (dayMap[day] || 0) + o.total;
    });
    return Object.entries(dayMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue,
      }));
  }, [periodOrders]);

  // ─── Orders by status (donut) ─────────────────────────────
  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    periodOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodOrders]);

  // ─── Top customers ────────────────────────────────────────
  const topCustomers = [...allCustomers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Analytics</h1>
        <div className="flex gap-1 bg-[#F6F6F4] rounded-lg p-0.5">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.days}
              onClick={() => setPeriod(opt.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === opt.days ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
              <Skeleton className="w-20 h-3 mb-3" />
              <Skeleton className="w-28 h-7" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Site Sessions" value={totalSessions.toLocaleString()} change={sessionChange} />
            <StatCard label="Unique Visitors" value={totalVisitors.toLocaleString()} change={sessionChange * 0.8} />
            <StatCard label="Revenue" value={formatINR(totalRevenue)} change={12.5} />
            <StatCard label="Signed-in Customers" value={signedInCustomers.length.toLocaleString()} change={0} />
          </>
        )}
      </div>

      {/* Actual product interest — views, clicks, sizes selected, carts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Product interest</h3>
            <p className="text-xs text-[#9E9E9E] mt-1">Real storefront interactions in the selected period</p>
          </div>
          {productInterest.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#9E9E9E] text-center">Activity will appear after visitors browse products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#FAFAFA] text-left">
                  {['Product', 'Views', 'Clicks', 'Sizes', 'Carts'].map((label) => <th key={label} className="px-4 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">{label}</th>)}
                </tr></thead>
                <tbody>{productInterest.map((item) => (
                  <tr key={item.id} className="border-t border-[#E5E5E5]">
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{item.product}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{item.views}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{item.clicks}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{item.sizeSelections}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{item.carts}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Signed-in customer accounts</h3>
            <p className="text-xs text-[#9E9E9E] mt-1">Email is available only to dashboard admins</p>
          </div>
          {signedInCustomers.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#9E9E9E] text-center">No signed-in activity in this period.</p>
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {signedInCustomers.slice(0, 8).map((customer) => (
                <li key={customer.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="text-sm font-medium text-[#1A1A1A] truncate">{customer.name || 'Customer'}</p><p className="text-xs text-[#6B6B6B] truncate">{customer.email}</p></div>
                  <span className="text-xs text-[#2E7D32] font-medium">Active</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Sessions over time</h3>
          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sessionsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9E9E9E' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9E9E9E' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="sessions" stroke="#C0392B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Top Traffic Sources</h3>
          <div className="space-y-3">
            {sources.slice(0, 5).map((s, i) => (
              <div key={s.source}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#1A1A1A] font-medium">{s.source}</span>
                  <span className="text-[#9E9E9E]">{s.count} ({s.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#F6F6F4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Revenue overview</h3>
          {revenueChart.length === 0 ? (
            <p className="text-sm text-[#9E9E9E] py-8 text-center">No revenue data in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9E9E9E' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9E9E9E' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#C0392B" fill="#C0392B" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status donut */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Orders by status</h3>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-[#9E9E9E] py-8 text-center">No orders</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {ordersByStatus.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {ordersByStatus.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                    <div className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                {['Name', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.map(c => (
                <tr key={c.id} className="border-t border-[#E5E5E5] hover:bg-[#F9F9F9]">
                  <td className="px-5 py-3 font-medium text-[#1A1A1A]">{c.name}</td>
                  <td className="px-5 py-3 text-[#6B6B6B]">{c.total_orders}</td>
                  <td className="px-5 py-3 font-medium text-[#1A1A1A]">{formatINR(c.total_spent)}</td>
                  <td className="px-5 py-3 text-[#9E9E9E]">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: number }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-semibold text-[#1A1A1A]">{value}</p>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-[#2E7D32]' : 'text-[#C0392B]'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
