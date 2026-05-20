import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Eye, ShoppingCart, CreditCard,
  ArrowUpRight, ArrowDownRight, Smartphone, Monitor, Tablet,
  Globe, Instagram, Search as SearchIcon, Share2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList
} from 'recharts';

const periods = ['Today', '7 Days', '30 Days', '90 Days'];

const revenueDaily = [
  { date: 'Apr 1', revenue: 8500, orders: 3 }, { date: 'Apr 2', revenue: 12400, orders: 5 },
  { date: 'Apr 3', revenue: 6800, orders: 2 }, { date: 'Apr 4', revenue: 15200, orders: 7 },
  { date: 'Apr 5', revenue: 18900, orders: 8 }, { date: 'Apr 6', revenue: 11200, orders: 4 },
  { date: 'Apr 7', revenue: 21500, orders: 10 }, { date: 'Apr 8', revenue: 14300, orders: 6 },
  { date: 'Apr 9', revenue: 19800, orders: 9 }, { date: 'Apr 10', revenue: 25600, orders: 12 },
  { date: 'Apr 11', revenue: 17200, orders: 7 }, { date: 'Apr 12', revenue: 28900, orders: 13 },
  { date: 'Apr 13', revenue: 22100, orders: 10 }, { date: 'Apr 14', revenue: 31400, orders: 15 },
  { date: 'Apr 15', revenue: 42100, orders: 19 },
];

const productPerformance = [
  { name: 'Tortoise', views: 480, addToCart: 89, purchases: 47, revenue: 89253 },
  { name: 'Moment Play', views: 420, addToCart: 72, purchases: 38, revenue: 72162 },
  { name: 'NYT Waves', views: 350, addToCart: 58, purchases: 31, revenue: 71269 },
  { name: 'Slow Down', views: 310, addToCart: 52, purchases: 28, revenue: 53172 },
  { name: 'Slow Club', views: 280, addToCart: 45, purchases: 24, revenue: 45576 },
  { name: 'Embroidered', views: 220, addToCart: 35, purchases: 19, revenue: 66481 },
];

const funnelData = [
  { name: 'Visitors', value: 2618, fill: '#C0132A' },
  { name: 'Product Views', value: 1847, fill: '#dc2626' },
  { name: 'Add to Cart', value: 312, fill: '#ef4444' },
  { name: 'Checkout', value: 142, fill: '#f87171' },
  { name: 'Purchase', value: 89, fill: '#fca5a5' },
];

const trafficSources = [
  { source: 'Direct', visitors: 1178, percentage: 45, icon: Globe, color: '#C0132A' },
  { source: 'Organic Search', visitors: 733, percentage: 28, icon: SearchIcon, color: '#ff4757' },
  { source: 'Instagram', visitors: 471, percentage: 18, icon: Instagram, color: '#ff6b81' },
  { source: 'Referral', visitors: 236, percentage: 9, icon: Share2, color: '#ff8a9e' },
];

const deviceData = [
  { name: 'Mobile', value: 72, color: '#C0132A', icon: Smartphone },
  { name: 'Desktop', value: 24, color: '#ff4757', icon: Monitor },
  { name: 'Tablet', value: 4, color: '#ff6b81', icon: Tablet },
];

function MetricCard({ title, value, change, prefix = '', suffix = '' }: {
  title: string; value: string; change: number; prefix?: string; suffix?: string;
}) {
  const positive = change >= 0;
  return (
    <div className="rounded-xl p-4" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-white mt-1">{prefix}{value}{suffix}</p>
      <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(change)}%
      </div>
    </div>
  );
}

export default function Analytics() {
  const [activePeriod, setActivePeriod] = useState('30 Days');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Track your store performance</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          {periods.map((p) => (
            <button key={p} onClick={() => setActivePeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activePeriod === p ? 'bg-[#C0132A] text-white' : 'text-gray-400 hover:text-white'
              }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard title="Total Revenue" value="2,45,890" change={12.5} prefix="₹" />
        <MetricCard title="Orders" value="89" change={8.2} />
        <MetricCard title="Avg Order Value" value="2,762" change={3.8} prefix="₹" />
        <MetricCard title="Conversion" value="3.4" change={-0.3} suffix="%" />
        <MetricCard title="Cart Abandon" value="37.3" change={-2.1} suffix="%" />
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h3 className="text-white font-semibold mb-4">Revenue & Orders Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueDaily}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C0132A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#C0132A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{
              background: 'rgba(17,17,24,0.95)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }} formatter={(v: number, name: string) => [name === 'revenue' ? `₹${v.toLocaleString('en-IN')}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
            <Area type="monotone" dataKey="revenue" stroke="#C0132A" strokeWidth={2.5} fill="url(#revGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#C0132A', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Funnel + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="text-white font-semibold mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((step, i) => {
              const width = (step.value / funnelData[0].value) * 100;
              const dropoff = i > 0 ? (((funnelData[i-1].value - step.value) / funnelData[i-1].value) * 100).toFixed(1) : null;
              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">{step.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold">{step.value.toLocaleString()}</span>
                      {dropoff && <span className="text-red-400 text-[10px]">-{dropoff}%</span>}
                    </div>
                  </div>
                  <div className="w-full h-6 bg-white/5 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-lg"
                      style={{ background: `linear-gradient(90deg, ${step.fill}, ${step.fill}88)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="text-white font-semibold mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${source.color}15` }}>
                  <source.icon size={14} style={{ color: source.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{source.source}</span>
                    <span className="text-gray-400 text-xs">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: source.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Device Breakdown */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Device Distribution</h4>
            <div className="flex gap-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center gap-2">
                  <device.icon size={14} style={{ color: device.color }} />
                  <div>
                    <p className="text-white text-sm font-bold">{device.value}%</p>
                    <p className="text-gray-600 text-[10px]">{device.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h3 className="text-white font-semibold mb-4">Product Performance</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 min-w-[600px]">
            <span className="text-[10px] font-semibold text-gray-500 uppercase">Product</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase text-center">Views</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase text-center">Add to Cart</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase text-center">Purchases</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase text-right">Revenue</span>
          </div>
          {productPerformance.map((prod, i) => (
            <motion.div
              key={prod.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 py-3 border-t border-white/[0.03] items-center min-w-[600px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs font-bold w-4">{i + 1}</span>
                <span className="text-white text-sm font-medium">{prod.name}</span>
              </div>
              <span className="text-gray-400 text-sm text-center">{prod.views}</span>
              <span className="text-gray-400 text-sm text-center">{prod.addToCart}</span>
              <span className="text-white text-sm font-medium text-center">{prod.purchases}</span>
              <span className="text-white text-sm font-bold text-right">₹{prod.revenue.toLocaleString('en-IN')}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
