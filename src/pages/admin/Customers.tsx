import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Star, Mail, Phone, ShoppingBag, TrendingUp,
  ArrowLeft, Calendar, Eye, Crown, User, Users as UsersIcon,
  Zap, Clock
} from 'lucide-react';

type Segment = 'all' | 'vip' | 'repeat' | 'active' | 'new' | 'inactive';

interface MockCustomer {
  id: string; name: string; email: string; phone: string; avatar: string;
  segment: Segment; totalSpent: number; orderCount: number; avgOrder: number;
  lastOrder: string; firstOrder: string; createdAt: string;
  orders: { id: string; date: string; total: number; status: string; items: string[] }[];
}

const segmentConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  vip: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Crown, label: 'VIP' },
  repeat: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: TrendingUp, label: 'Repeat' },
  active: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Zap, label: 'Active' },
  new: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Star, label: 'New' },
  inactive: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Clock, label: 'Inactive' },
};

const mockCustomers: MockCustomer[] = [
  {
    id: '1', name: 'Arjun Patel', email: 'arjun@gmail.com', phone: '+91 98765 43210', avatar: 'A',
    segment: 'vip', totalSpent: 24500, orderCount: 8, avgOrder: 3062, lastOrder: 'Apr 15, 2026', firstOrder: 'Jan 12, 2026', createdAt: 'Jan 12, 2026',
    orders: [
      { id: 'SE-0415-019', date: 'Apr 15', total: 5697, status: 'pending', items: ['The Tortoise', 'Slow Down'] },
      { id: 'SE-0408-001', date: 'Apr 8', total: 2299, status: 'delivered', items: ['NYT & WAVES'] },
      { id: 'SE-0325-004', date: 'Mar 25', total: 3798, status: 'delivered', items: ['Let The Moment Play'] },
    ],
  },
  {
    id: '2', name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 87654 32109', avatar: 'P',
    segment: 'repeat', totalSpent: 15400, orderCount: 5, avgOrder: 3080, lastOrder: 'Apr 15, 2026', firstOrder: 'Feb 3, 2026', createdAt: 'Feb 3, 2026',
    orders: [
      { id: 'SE-0415-018', date: 'Apr 15', total: 3798, status: 'shipped', items: ['Let The Moment Play'] },
      { id: 'SE-0401-006', date: 'Apr 1', total: 3499, status: 'delivered', items: ['Classic Embroidered Logo'] },
    ],
  },
  {
    id: '3', name: 'Rahul Verma', email: 'rahulv@outlook.com', phone: '+91 76543 21098', avatar: 'R',
    segment: 'active', totalSpent: 7596, orderCount: 3, avgOrder: 2532, lastOrder: 'Apr 15, 2026', firstOrder: 'Mar 10, 2026', createdAt: 'Mar 10, 2026',
    orders: [
      { id: 'SE-0415-017', date: 'Apr 15', total: 1899, status: 'delivered', items: ['The Slow Club'] },
    ],
  },
  {
    id: '4', name: 'Sneha Gupta', email: 'sneha.g@gmail.com', phone: '+91 65432 10987', avatar: 'S',
    segment: 'new', totalSpent: 6598, orderCount: 1, avgOrder: 6598, lastOrder: 'Apr 15, 2026', firstOrder: 'Apr 15, 2026', createdAt: 'Apr 14, 2026',
    orders: [
      { id: 'SE-0415-016', date: 'Apr 15', total: 6598, status: 'processing', items: ['Classic Embroidered Logo', 'Graphic Print Club'] },
    ],
  },
  {
    id: '5', name: 'Vikram Singh', email: 'vikram@yahoo.com', phone: '+91 54321 09876', avatar: 'V',
    segment: 'active', totalSpent: 4598, orderCount: 2, avgOrder: 2299, lastOrder: 'Apr 14, 2026', firstOrder: 'Mar 28, 2026', createdAt: 'Mar 28, 2026',
    orders: [
      { id: 'SE-0414-015', date: 'Apr 14', total: 2299, status: 'delivered', items: ['SUNLIGHT & WAVES'] },
    ],
  },
  {
    id: '6', name: 'Meera Joshi', email: 'meera.j@gmail.com', phone: '+91 43210 98765', avatar: 'M',
    segment: 'inactive', totalSpent: 1899, orderCount: 1, avgOrder: 1899, lastOrder: 'Feb 10, 2026', firstOrder: 'Feb 10, 2026', createdAt: 'Feb 8, 2026',
    orders: [
      { id: 'SE-0210-002', date: 'Feb 10', total: 1899, status: 'delivered', items: ['Slugs Era Intro'] },
    ],
  },
];

function CustomerDetail({ customer, onBack }: { customer: MockCustomer; onBack: () => void }) {
  const seg = segmentConfig[customer.segment] || segmentConfig.new;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="rounded-2xl p-6" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto"
                 style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
              {customer.avatar}
            </div>
            <h3 className="text-white font-bold mt-3">{customer.name}</h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase inline-flex items-center gap-1 mt-2"
                  style={{ background: seg.bg, color: seg.color }}>
              <seg.icon size={10} /> {seg.label}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400"><Mail size={14} /> {customer.email}</div>
            <div className="flex items-center gap-2 text-gray-400"><Phone size={14} /> {customer.phone}</div>
            <div className="flex items-center gap-2 text-gray-400"><Calendar size={14} /> Member since {customer.createdAt}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <button className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
              <Mail size={12} /> Email
            </button>
            <button className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
              <Eye size={12} /> View
            </button>
          </div>
        </div>

        {/* Stats + Orders */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Spent', value: `₹${customer.totalSpent.toLocaleString('en-IN')}`, icon: ShoppingBag },
              { label: 'Orders', value: customer.orderCount.toString(), icon: ShoppingBag },
              { label: 'Avg Order', value: `₹${customer.avgOrder.toLocaleString('en-IN')}`, icon: TrendingUp },
              { label: 'Last Order', value: customer.lastOrder, icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <stat.icon size={14} className="text-gray-600 mb-2" />
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Order History */}
          <div className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 className="text-white font-semibold mb-4">Order History</h3>
            <div className="space-y-3">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <p className="text-white text-sm font-medium">{order.id}</p>
                    <p className="text-gray-500 text-xs">{order.date} • {order.items.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-semibold uppercase ${
                      order.status === 'delivered' ? 'text-emerald-400' : order.status === 'pending' ? 'text-amber-400' : 'text-blue-400'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<Segment>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<MockCustomer | null>(null);

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  const filtered = mockCustomers.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (segmentFilter !== 'all' && c.segment !== segmentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers</h2>
          <p className="text-gray-500 text-sm mt-1">{mockCustomers.length} registered customers</p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'all', label: 'All', icon: UsersIcon },
          { key: 'vip', label: 'VIP', icon: Crown },
          { key: 'repeat', label: 'Repeat', icon: TrendingUp },
          { key: 'active', label: 'Active', icon: Zap },
          { key: 'new', label: 'New', icon: Star },
          { key: 'inactive', label: 'Inactive', icon: Clock },
        ] as { key: Segment; label: string; icon: React.ElementType }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSegmentFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              segmentFilter === tab.key
                ? 'text-white'
                : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
            }`}
            style={segmentFilter === tab.key ? { background: 'linear-gradient(135deg, rgba(192,19,42,0.2), rgba(255,71,87,0.1))', border: '1px solid rgba(192,19,42,0.3)' } : {}}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all"
        />
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer, i) => {
          const seg = segmentConfig[customer.segment] || segmentConfig.new;
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedCustomer(customer)}
              className="rounded-2xl p-5 cursor-pointer hover:bg-white/[0.02] transition-all group"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                       style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
                    {customer.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{customer.name}</p>
                    <p className="text-gray-500 text-xs">{customer.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1"
                      style={{ background: seg.bg, color: seg.color }}>
                  <seg.icon size={8} /> {seg.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                <div>
                  <p className="text-white text-sm font-bold">₹{(customer.totalSpent / 1000).toFixed(1)}k</p>
                  <p className="text-gray-600 text-[10px]">Spent</p>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{customer.orderCount}</p>
                  <p className="text-gray-600 text-[10px]">Orders</p>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{customer.lastOrder.split(',')[0]}</p>
                  <p className="text-gray-600 text-[10px]">Last Order</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
