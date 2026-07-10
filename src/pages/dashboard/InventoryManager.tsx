import { useState } from 'react';
import { useProducts, useUpdateProduct } from '@/hooks/useProducts';
import { Archive, Search, AlertTriangle, ArrowRight, Save, X } from 'lucide-react';
import type { Product, SizeStock } from '@/types';

export default function InventoryManager() {
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<SizeStock[]>([]);
  const [saving, setSaving] = useState(false);

  // Filter and search
  const filteredProducts = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    const stock = p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
    
    if (filter === 'low_stock') return stock > 0 && stock <= 5;
    if (filter === 'out_of_stock') return stock === 0;
    
    return true;
  });

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.sizeStock || product.sizes.map(s => ({ size: s, stock: 0 })));
  };

  const handleSaveStock = async (product: Product) => {
    try {
      setSaving(true);
      const totalStock = editStock.reduce((sum, s) => sum + s.stock, 0);
      
      const payload: Product & { stock?: number } = {
        ...product,
        sizeStock: editStock,
        stock: totalStock,
        status: totalStock === 0 ? 'sold_out' : (product.status === 'sold_out' ? 'active' : product.status),
        inStock: totalStock > 0
      };

      await updateProduct.mutateAsync(payload);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bebas text-3xl tracking-wider text-white">INVENTORY</h2>
          <p className="text-sm text-[#888888]">Track and update stock levels across all products.</p>
        </div>
      </div>

      <div className="cms-card p-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="cms-tabs w-full sm:w-auto overflow-x-auto">
          <button 
            className={`cms-tab whitespace-nowrap ${filter === 'all' ? 'cms-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Inventory
          </button>
          <button 
            className={`cms-tab whitespace-nowrap ${filter === 'low_stock' ? 'cms-tab--active' : ''}`}
            onClick={() => setFilter('low_stock')}
          >
            Low Stock Alerts
          </button>
          <button 
            className={`cms-tab whitespace-nowrap ${filter === 'out_of_stock' ? 'cms-tab--active' : ''}`}
            onClick={() => setFilter('out_of_stock')}
          >
            Out of Stock
          </button>
        </div>
        
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cms-input pl-9"
          />
        </div>
      </div>

      <div className="cms-card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#888888] text-center">
            <Archive size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-white mb-2">No items found</h3>
            <p className="text-sm max-w-md">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cms-table min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-16">Product</th>
                  <th>Details</th>
                  <th>Category</th>
                  <th>Per-Size Stock</th>
                  <th>Total</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isEditing = editingId === product.id;
                  const displayStock = isEditing ? editStock : (product.sizeStock || product.sizes.map(s => ({ size: s, stock: 0 })));
                  const total = displayStock.reduce((sum, s) => sum + s.stock, 0);
                  
                  return (
                    <tr key={product.id} className="group hover:bg-[#1A1A1A]">
                      <td>
                        <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden flex items-center justify-center shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Archive size={16} className="text-[#555555]" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-white text-sm">{product.name}</div>
                        <div className="text-xs text-[#888888]">SKU: {product.slug}</div>
                      </td>
                      <td>
                        <span className="text-sm text-[#888888] capitalize">{product.category}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {displayStock.map((s, idx) => (
                            <div key={idx} className="flex items-center bg-[#0A0A0A] border border-[#2A2A2A] rounded overflow-hidden">
                              <span className="px-2 py-1 text-xs font-semibold text-[#888888] border-r border-[#2A2A2A] bg-[#111111]">
                                {s.size}
                              </span>
                              {isEditing ? (
                                <input 
                                  type="number"
                                  min="0"
                                  value={s.stock}
                                  onChange={(e) => {
                                    const newStock = [...editStock];
                                    newStock[idx].stock = Number(e.target.value);
                                    setEditStock(newStock);
                                  }}
                                  className="w-16 px-2 py-1 text-xs bg-transparent text-white outline-none"
                                />
                              ) : (
                                <span className={`px-3 py-1 text-xs font-medium ${s.stock === 0 ? 'text-red-500' : 'text-white'}`}>
                                  {s.stock}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`font-semibold ${total === 0 ? 'text-red-500' : total <= 5 ? 'text-orange-500' : 'text-white'}`}>
                          {total}
                        </span>
                      </td>
                      <td className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-[#888888] hover:text-white rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <button 
                              onClick={() => handleSaveStock(product)}
                              disabled={saving}
                              className="p-1.5 bg-[#C0132A] text-white hover:bg-[#D81B34] rounded transition-colors"
                            >
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="text-sm text-[#C0132A] hover:text-white font-medium"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
