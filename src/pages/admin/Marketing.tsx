import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Clock, Send, Mail, ShoppingCart, Gift, Bell,
  Calendar, Eye, Play, Pause, Plus, X, Users,
  TrendingUp, ArrowRight, Percent
} from 'lucide-react';

interface FlashSale {
  id: string; name: string; discount: number; products: string[];
  startsAt: string; endsAt: string; isActive: boolean; soldDuring: number;
}

interface AbandonedCart {
  id: string; customer: string; email: string; items: string[];
  cartValue: number; abandonedAt: string; emailSent: boolean; recovered: boolean;
}

const mockFlashSales: FlashSale[] = [
  {
    id: '1', name: 'Summer Kickoff Flash', discount: 30, products: ['The Tortoise', 'Slow Down', 'Let The Moment Play'],
    startsAt: 'Apr 18, 6:00 PM', endsAt: 'Apr 18, 11:59 PM', isActive: false, soldDuring: 0,
  },
  {
    id: '2', name: 'Hoodie Season End', discount: 25, products: ['Classic Embroidered Logo', 'Vintage Patchwork', 'Graphic Print Club'],
    startsAt: 'Apr 10, 12:00 PM', endsAt: 'Apr 10, 11:59 PM', isActive: false, soldDuring: 14,
  },
];

const mockAbandoned: AbandonedCart[] = [
  { id: '1', customer: 'Ravi Kumar', email: 'ravi.k@gmail.com', items: ['The Tortoise (L)', 'Slow Down (XL)'], cartValue: 3798, abandonedAt: '2 hrs ago', emailSent: false, recovered: false },
  { id: '2', customer: 'Nisha Patel', email: 'nisha.p@gmail.com', items: ['NYT & WAVES (M)'], cartValue: 2299, abandonedAt: '5 hrs ago', emailSent: true, recovered: false },
  { id: '3', customer: 'Amit Shah', email: 'amit.s@outlook.com', items: ['Classic Embroidered Logo (L)', 'The Slow Club (XL)'], cartValue: 5398, abandonedAt: '1 day ago', emailSent: true, recovered: true },
  { id: '4', customer: 'Deepa Jain', email: 'deepa.j@gmail.com', items: ['SUNLIGHT & WAVES (S)'], cartValue: 2299, abandonedAt: '1 day ago', emailSent: true, recovered: false },
];

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<'flash' | 'abandoned' | 'push'>('flash');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Marketing & Growth</h2>
        <p className="text-gray-500 text-sm mt-1">Flash sales, abandoned cart recovery, and push notifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {([
          { key: 'flash', label: 'Flash Sales', icon: Zap },
          { key: 'abandoned', label: 'Abandoned Carts', icon: ShoppingCart },
          { key: 'push', label: 'Push Notifications', icon: Bell },
        ] as { key: typeof activeTab; label: string; icon: React.ElementType }[]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key ? 'text-white' : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
            }`}
            style={activeTab === tab.key ? { background: 'linear-gradient(135deg, rgba(192,19,42,0.2), rgba(255,71,87,0.1))', border: '1px solid rgba(192,19,42,0.3)' } : {}}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Flash Sales */}
      {activeTab === 'flash' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Zap size={14} className="text-amber-400 mb-2" />
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-gray-500 text-xs">Total Flash Sales</p>
            </div>
            <div className="rounded-xl p-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <TrendingUp size={14} className="text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">14</p>
              <p className="text-gray-500 text-xs">Items Sold During Sales</p>
            </div>
            <div className="rounded-xl p-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Percent size={14} className="text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">27.5%</p>
              <p className="text-gray-500 text-xs">Avg Discount Given</p>
            </div>
          </div>

          <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
            <Plus size={16} /> Create Flash Sale
          </button>

          {/* Flash Sale Cards */}
          {mockFlashSales.map((sale, i) => (
            <motion.div key={sale.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: `1px solid ${sale.isActive ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    sale.isActive ? 'bg-amber-500/10' : 'bg-white/5'
                  }`}>
                    <Zap size={18} className={sale.isActive ? 'text-amber-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{sale.name}</p>
                    <p className="text-gray-500 text-xs">{sale.discount}% off • {sale.products.length} products</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                  sale.isActive ? 'bg-amber-500/10 text-amber-400' : sale.soldDuring > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'
                }`}>
                  {sale.isActive ? '🔴 Live' : sale.soldDuring > 0 ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><p className="text-gray-500 text-xs">Start</p><p className="text-white text-sm">{sale.startsAt}</p></div>
                <div><p className="text-gray-500 text-xs">End</p><p className="text-white text-sm">{sale.endsAt}</p></div>
                <div><p className="text-gray-500 text-xs">Products</p><p className="text-white text-sm">{sale.products.join(', ')}</p></div>
                <div><p className="text-gray-500 text-xs">Sold During</p><p className="text-white text-sm font-bold">{sale.soldDuring}</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Abandoned Carts */}
      {activeTab === 'abandoned' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Abandoned', value: '4', icon: ShoppingCart, color: '#ef4444' },
              { label: 'Recovery Emails', value: '3', icon: Mail, color: '#3b82f6' },
              { label: 'Recovered', value: '1', icon: TrendingUp, color: '#10b981' },
              { label: 'Recovery Rate', value: '25%', icon: Percent, color: '#8b5cf6' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <stat.icon size={14} style={{ color: stat.color }} className="mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Abandoned Cart List */}
          <div className="space-y-3">
            {mockAbandoned.map((cart, i) => (
              <motion.div key={cart.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-4 flex items-center justify-between" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                  border: `1px solid ${cart.recovered ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                       style={{ background: cart.recovered ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
                    {cart.customer[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{cart.customer}</p>
                    <p className="text-gray-500 text-xs">{cart.items.join(', ')} • {cart.abandonedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-bold">₹{cart.cartValue.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-2">
                    {cart.recovered ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">✓ Recovered</span>
                    ) : cart.emailSent ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400">Email Sent</span>
                    ) : (
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                        style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
                        <Send size={12} /> Send Recovery Email
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Push Notifications */}
      {activeTab === 'push' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl p-8 text-center" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Bell size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Push Notifications</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
              Send targeted push notifications to customers about new drops, flash sales, and order updates.
            </p>
            <button className="px-6 py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
              <span className="flex items-center gap-2"><Bell size={16} /> Set Up Push Notifications</span>
            </button>
            <p className="text-gray-600 text-xs mt-3">Requires Web Push API integration</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
