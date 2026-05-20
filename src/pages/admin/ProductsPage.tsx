import { useState, useMemo } from 'react';
import { useAdminProducts, useDeleteAdminProduct, formatINR, type AdminProduct } from '@/hooks/useAdminData';
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ─── Stock Badge ─────────────────────────────────────────────
function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#FEECEC', color: '#C0392B' }}>Out of stock</span>;
  if (qty <= threshold) return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#FFF8E1', color: '#F57F17' }}>Low stock ({qty})</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#E6F4EA', color: '#2E7D32' }}>In stock ({qty})</span>;
}

interface Props {
  onEditProduct: (id: string | 'new') => void;
}

export default function ProductsPage({ onEditProduct }: Props) {
  const { data: products = [], isLoading } = useAdminProducts();
  const deleteProduct = useDeleteAdminProduct();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    if (filter !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase() === filter.toLowerCase());
    }
    return list;
  }, [products, search, filter]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  const handleDelete = (product: AdminProduct) => {
    setConfirmDelete(product);
    setMenuOpen(null);
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      deleteProduct.mutate(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Products</h1>
          <span className="px-2 py-0.5 rounded-full bg-[#F6F6F4] text-[12px] font-semibold text-[#6B6B6B]">{products.length}</span>
        </div>
        <button
          onClick={() => onEditProduct('new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] hover:bg-[#A93226] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C0392B] appearance-none pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B6B6B' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">All products</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex-1 relative min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F6F6F4] flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-[#9E9E9E]" />
            </div>
            <p className="text-sm font-medium text-[#6B6B6B]">No products found</p>
            <p className="text-xs text-[#9E9E9E] mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                  <th className="w-10 px-3 py-3"><input type="checkbox" className="rounded border-[#E5E5E5]" /></th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Product</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="text-right px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Price</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Inventory</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    onClick={() => onEditProduct(product.id)}
                  >
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-[#E5E5E5]" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-[#E5E5E5] flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#F6F6F4] border border-[#E5E5E5] flex items-center justify-center text-[#9E9E9E] text-xs font-bold flex-shrink-0">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                          {product.ribbon && (
                            <span className="text-[10px] font-semibold text-[#C0392B] uppercase">{product.ribbon}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#6B6B6B] hidden md:table-cell">Physical</td>
                    <td className="px-3 py-3 text-[#6B6B6B] font-mono text-xs hidden sm:table-cell">{product.sku || '—'}</td>
                    <td className="px-3 py-3 text-right">
                      {product.on_sale && product.compare_at_price ? (
                        <div>
                          <span className="text-[#1A1A1A] font-medium">{formatINR(product.sale_price || product.price)}</span>
                          <span className="text-[#9E9E9E] line-through text-xs ml-1.5">{formatINR(product.compare_at_price)}</span>
                        </div>
                      ) : (
                        <span className="text-[#1A1A1A] font-medium">{formatINR(product.price)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StockBadge qty={product.stock_quantity} threshold={product.low_stock_threshold} />
                    </td>
                    <td className="px-3 py-3 relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === product.id ? null : product.id)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal size={16} className="text-[#6B6B6B]" />
                      </button>
                      {menuOpen === product.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-[#E5E5E5] shadow-lg z-50 py-1">
                            <button onClick={() => { onEditProduct(product.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]">
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => setMenuOpen(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]">
                              <Copy size={14} /> Duplicate
                            </button>
                            <button onClick={() => handleDelete(product)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#C0392B] hover:bg-[#FEECEC]">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Delete "{confirmDelete.name}"?</h3>
            <p className="text-sm text-[#6B6B6B] mb-5">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E5E5] rounded-lg hover:bg-[#F9F9F9]">Cancel</button>
              <button onClick={confirmDeleteAction} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
