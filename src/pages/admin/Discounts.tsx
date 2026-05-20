import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Tag, Percent, DollarSign, Truck, Copy,
  Calendar, Users, Eye, Edit, Trash2, X, Check, Clock,
  Zap, Gift
} from 'lucide-react';

type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

interface MockDiscount {
  id: string; code: string; description: string; type: DiscountType;
  value: number; minOrder: number; maxDiscount?: number;
  usageLimit?: number; usageCount: number; perUserLimit: number;
  startsAt: string; expiresAt: string; isActive: boolean;
  appliesTo: string;
}

const typeConfig: Record<DiscountType, { icon: React.ElementType; color: string; label: string }> = {
  percentage: { icon: Percent, color: '#8b5cf6', label: 'Percentage' },
  fixed_amount: { icon: DollarSign, color: '#10b981', label: 'Fixed Amount' },
  free_shipping: { icon: Truck, color: '#3b82f6', label: 'Free Shipping' },
};

const mockDiscounts: MockDiscount[] = [
  {
    id: '1', code: 'WELCOME20', description: 'New customer welcome discount', type: 'percentage',
    value: 20, minOrder: 1500, maxDiscount: 500, usageLimit: 100, usageCount: 67,
    perUserLimit: 1, startsAt: 'Mar 1, 2026', expiresAt: 'Jun 30, 2026', isActive: true, appliesTo: 'All Products',
  },
  {
    id: '2', code: 'FLAT300', description: 'Flat ₹300 off on orders above ₹3000', type: 'fixed_amount',
    value: 300, minOrder: 3000, usageLimit: 50, usageCount: 23,
    perUserLimit: 2, startsAt: 'Apr 1, 2026', expiresAt: 'Apr 30, 2026', isActive: true, appliesTo: 'All Products',
  },
  {
    id: '3', code: 'FREESHIP', description: 'Free shipping on all orders', type: 'free_shipping',
    value: 0, minOrder: 999, usageCount: 145,
    perUserLimit: 3, startsAt: 'Jan 1, 2026', expiresAt: 'Dec 31, 2026', isActive: true, appliesTo: 'All Products',
  },
  {
    id: '4', code: 'HOODIE15', description: '15% off on hoodies', type: 'percentage',
    value: 15, minOrder: 0, maxDiscount: 750, usageLimit: 30, usageCount: 30,
    perUserLimit: 1, startsAt: 'Mar 15, 2026', expiresAt: 'Apr 15, 2026', isActive: false, appliesTo: 'Hoodies',
  },
  {
    id: '5', code: 'VIP500', description: 'VIP exclusive: ₹500 off', type: 'fixed_amount',
    value: 500, minOrder: 4000, usageLimit: 20, usageCount: 8,
    perUserLimit: 1, startsAt: 'Apr 10, 2026', expiresAt: 'May 10, 2026', isActive: true, appliesTo: 'All Products',
  },
];

function CreateDiscountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Create Discount Code</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X size={18} /></button>
          </div>

          <div className="p-6 space-y-5">
            {/* Type Selection */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Discount Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(typeConfig) as [DiscountType, typeof typeConfig[DiscountType]][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => setDiscountType(key)}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      discountType === key
                        ? 'border-[#C0132A]/50 bg-[#C0132A]/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}>
                    <cfg.icon size={18} className="mx-auto mb-1" style={{ color: cfg.color }} />
                    <span className="text-[10px] font-medium text-gray-300">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Discount Code *</label>
              <input type="text" placeholder="e.g. SUMMER25"
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all uppercase font-mono" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
              <input type="text" placeholder="Brief description..."
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {discountType === 'percentage' ? 'Percentage (%)' : discountType === 'fixed_amount' ? 'Amount (₹)' : 'Value'}
                </label>
                <input type="number" placeholder={discountType === 'percentage' ? '20' : '300'}
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Min Order (₹)</label>
                <input type="number" placeholder="1500"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Usage Limit</label>
                <input type="number" placeholder="100"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Per User Limit</label>
                <input type="number" placeholder="1"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</label>
                <input type="date"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">End Date</label>
                <input type="date"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
              <Check size={16} /> Create Code
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Discounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'expired'>('all');

  const filtered = mockDiscounts.filter((d) => {
    if (searchQuery && !d.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterActive === 'active' && !d.isActive) return false;
    if (filterActive === 'expired' && d.isActive) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <CreateDiscountModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Discount Codes</h2>
          <p className="text-gray-500 text-sm mt-1">{mockDiscounts.length} discount codes</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-[#C0132A]/20 transition-all"
          style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
          <Plus size={16} /> Create Code
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search by code..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          {(['all', 'active', 'expired'] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                filterActive === f ? 'bg-[#C0132A] text-white' : 'text-gray-400 hover:text-white'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Discount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((discount, i) => {
          const cfg = typeConfig[discount.type];
          const usagePercent = discount.usageLimit ? (discount.usageCount / discount.usageLimit) * 100 : 0;
          return (
            <motion.div key={discount.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: `1px solid ${discount.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
                opacity: discount.isActive ? 1 : 0.6,
              }}>
              {!discount.isActive && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-600/20 text-gray-400">
                  Expired
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.color}15` }}>
                  <cfg.icon size={18} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-white font-bold text-sm font-mono tracking-wider">{discount.code}</code>
                    <button className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Copy size={12} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{discount.description}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Value</span>
                  <span className="text-white font-medium">
                    {discount.type === 'percentage' ? `${discount.value}% off` :
                     discount.type === 'fixed_amount' ? `₹${discount.value} off` : 'Free Shipping'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Min Order</span>
                  <span className="text-gray-300">₹{discount.minOrder.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Applies To</span>
                  <span className="text-gray-300">{discount.appliesTo}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Expires</span>
                  <span className="text-gray-300">{discount.expiresAt}</span>
                </div>

                {discount.usageLimit && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Usage</span>
                      <span className="text-gray-300">{discount.usageCount}/{discount.usageLimit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${usagePercent}%`,
                        background: usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f59e0b' : cfg.color,
                      }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                  <Edit size={12} /> Edit
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
