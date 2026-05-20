import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, AlertTriangle, Package, ArrowUpDown, TrendingDown,
  TrendingUp, Minus, Plus, History, Filter, Download, Check,
  ChevronDown, Box
} from 'lucide-react';
import { useProducts, useUpdateProduct } from '@/hooks/useProducts';
import type { Product, SizeStock } from '@/types';

interface InventoryItem {
  id: string;
  productId: string;
  product: string;
  variant: string;
  sku: string;
  stock: number;
  threshold: number;
  sold: number;
  status: 'ok' | 'low' | 'out';
  preOrder: boolean;
  image: string;
}

// Build inventory from real product sizeStock data
function buildInventory(sourceProducts: Product[]): InventoryItem[] {
  const items: InventoryItem[] = [];

  sourceProducts.forEach((p) => {
    if (!p.sizeStock || p.status === 'coming_soon') return;

    const colorLabel = p.colors?.length > 0
      ? p.colors[0] === '#1A1A1A' ? 'Black'
      : p.colors[0] === '#42C0FB' ? 'Blue'
      : p.colors[0] === '#1E4D2B' ? 'Green'
      : p.colors[0] === '#F5F5F3' ? 'Cream'
      : p.colors[0] === '#0A192F' ? 'Navy'
      : p.colors[0] === '#D4A574' ? 'Tan'
      : p.colors[0] === '#8B4513' ? 'Brown'
      : p.colors[0] === '#C0132A' ? 'Red'
      : p.colors[0] === '#FFFFFF' ? 'White'
      : 'Default'
      : 'Default';

    p.sizeStock.forEach((ss, i) => {
      const status: 'ok' | 'low' | 'out' =
        ss.stock === 0 && !ss.preOrder ? 'out' :
        ss.stock === 0 && ss.preOrder ? 'ok' :
        ss.stock > 0 && ss.stock <= 3 ? 'low' : 'ok';

      items.push({
        id: `${p.id}-${ss.size}`,
        productId: p.id,
        product: p.name,
        variant: `${ss.size} / ${colorLabel}`,
        sku: `SE-${p.category?.substring(0, 2).toUpperCase() || 'XX'}-${p.name.substring(0, 2).toUpperCase()}-${ss.size}`,
        stock: ss.stock,
        threshold: 5,
        sold: ss.stock === 0 && !ss.preOrder ? Math.floor(Math.random() * 10 + 15) : Math.floor(Math.random() * 10 + 5),
        status,
        preOrder: !!ss.preOrder,
        image: p.image,
      });
    });
  });

  return items;
}

interface InventoryLog {
  action: string;
  product: string;
  change: number;
  after: number;
  time: string;
  by: string;
}

export default function Inventory() {
  const { data: dbProducts = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();

  // We build local inventory state dynamically, but retain it in state to allow instant optimistic updates
  // and custom filtering that doesn't trigger full DB refetches every key press.
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Update local inventory when DB products load
  useMemo(() => {
    if (dbProducts.length > 0 && inventory.length === 0) {
      setInventory(buildInventory(dbProducts));
    }
  }, [dbProducts, inventory.length]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'out'>('all');
  const [showLogs, setShowLogs] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<InventoryLog[]>([]);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = inventory.filter((item) => {
    if (searchQuery && !item.product.toLowerCase().includes(searchQuery.toLowerCase()) && !item.sku.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: inventory.reduce((sum, i) => sum + i.stock, 0),
    lowStock: inventory.filter((i) => i.status === 'low').length,
    outOfStock: inventory.filter((i) => i.status === 'out').length,
    totalSold: inventory.reduce((sum, i) => sum + i.sold, 0),
    preOrder: inventory.filter(i => i.preOrder && i.stock === 0).length,
    variantCount: inventory.length,
  }), [inventory]);

  const adjustStock = (itemId: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newStock = Math.max(0, item.stock + delta);
      const status: 'ok' | 'low' | 'out' =
        newStock === 0 ? 'out' :
        newStock <= 3 ? 'low' : 'ok';

      // Log the change
      const log: InventoryLog = {
        action: delta > 0 ? 'Restock' : 'Adjustment',
        product: `${item.product} (${item.variant})`,
        change: delta,
        after: newStock,
        time: 'Just now',
        by: 'Admin',
      };
      setAuditLogs(prev => [log, ...prev.slice(0, 19)]);

      if (newStock === 0) {
        showNotif('error', `${item.product} (${item.variant}) is now out of stock!`);
      } else if (newStock <= 3) {
        showNotif('error', `${item.product} (${item.variant}) is running low (${newStock} left)`);
      } else if (delta > 0) {
        showNotif('success', `Restocked ${item.product} (${item.variant}) to ${newStock} units`);
      }

      // Sync to DB
      const sourceProduct = dbProducts.find(p => p.id === item.productId);
      if (sourceProduct && sourceProduct.sizeStock) {
        const sizeComponent = item.variant.split(' / ')[0]; // Extract 'L' or 'M'
        const updatedSizeStock = sourceProduct.sizeStock.map(ss => 
          ss.size === sizeComponent ? { ...ss, stock: newStock } : ss
        );
        updateProduct.mutate({ ...sourceProduct, sizeStock: updatedSizeStock });
      }

      return { ...item, stock: newStock, status };
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[200] px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage stock across {stats.variantCount} size variants from {dbProducts.filter(p => p.sizeStock).length} products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLogs(!showLogs)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${showLogs ? 'bg-[#C0132A]/20 text-[#ff4757] border border-[#C0132A]/30' : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <History size={16} /> Audit Log {auditLogs.length > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C0132A] text-white">{auditLogs.length}</span>}
          </button>
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Units', value: stats.total, icon: Package, color: '#3b82f6' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Pre-Order', value: stats.preOrder, icon: Box, color: '#8b5cf6' },
          { label: 'Total Sold', value: stats.totalSold, icon: TrendingUp, color: '#10b981' },
        ].map((stat) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Audit Log Drawer */}
      <AnimatePresence>
        {showLogs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
            <h3 className="text-white font-semibold mb-3">Recent Inventory Changes</h3>
            {auditLogs.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No changes yet. Adjust stock to see logs here.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {auditLogs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.change > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}>
                        {log.change > 0 ? <Plus size={14} className="text-emerald-400" /> : <Minus size={14} className="text-red-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm"><span className="font-medium">{log.action}</span> — {log.product}</p>
                        <p className="text-gray-500 text-xs">{log.time} • by {log.by}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${log.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.change > 0 ? '+' : ''}{log.change}
                      </p>
                      <p className="text-gray-500 text-xs">→ {log.after} left</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search by product or SKU..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          {([
            { key: 'all', label: 'All' },
            { key: 'low', label: '⚠ Low Stock' },
            { key: 'out', label: '🔴 Out of Stock' },
          ] as { key: typeof statusFilter; label: string }[]).map((f) => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.key ? 'bg-[#C0132A] text-white' : 'text-gray-400 hover:text-white'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div className="grid grid-cols-[auto,2fr,1.5fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3 border-b border-white/5">
          {['', 'Product', 'Variant / SKU', 'Stock', 'Status', 'Sold', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {filtered.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[auto,2fr,1.5fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
            {/* Image */}
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <img src={item.image} alt={item.product} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            {/* Product */}
            <span className="text-white text-sm font-medium truncate">{item.product}</span>
            {/* Variant + SKU */}
            <div>
              <span className="text-gray-300 text-sm block">{item.variant}</span>
              <span className="text-gray-600 text-[10px] font-mono">{item.sku}</span>
            </div>
            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                item.status === 'out' ? 'text-red-400' : item.status === 'low' ? 'text-amber-400' : 'text-white'
              }`}>
                {item.stock === 0 ? (item.preOrder ? 'Pre-Order' : 'Out') : item.stock}
              </span>
              {item.status === 'low' && <AlertTriangle size={12} className="text-amber-400" />}
              {item.status === 'out' && !item.preOrder && <AlertTriangle size={12} className="text-red-400" />}
            </div>
            {/* Status Badge */}
            <div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                item.status === 'out' && !item.preOrder ? 'bg-red-500/10 text-red-400' :
                item.status === 'low' ? 'bg-amber-500/10 text-amber-400' :
                item.preOrder ? 'bg-purple-500/10 text-purple-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {item.preOrder && item.stock === 0 ? 'Pre-Order' :
                 item.status === 'out' ? 'Out of Stock' :
                 item.status === 'low' ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
            {/* Sold */}
            <span className="text-gray-400 text-sm">{item.sold}</span>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustStock(item.id, -1)}
                disabled={item.stock === 0}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.stock === 0 ? 'bg-white/5 text-gray-700 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                }`}>
                <Minus size={12} />
              </button>
              <button
                onClick={() => adjustStock(item.id, 1)}
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                <Plus size={12} />
              </button>
              <button
                onClick={() => adjustStock(item.id, 10)}
                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors text-[10px] font-bold">
                +10
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">No inventory items found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filtered.length} of {inventory.length} variants</span>
        <span>Total stock: {stats.total} units across {dbProducts.filter(p => p.sizeStock).length} products</span>
      </div>
    </div>
  );
}
