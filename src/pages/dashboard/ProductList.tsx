import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, MoreHorizontal, 
  Edit3, Trash2, ExternalLink, Image as ImageIcon,
  CheckCircle2, XCircle
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProducts, toggleProductPublished, updateProductStock, deleteProduct } from '@/lib/queries';
import { PRODUCTS_QUERY_KEY } from '@/hooks/useProducts';
import { useDashboardToast } from '@/store/dashboardToast';
import { ProductTableSkeleton } from '@/components/dashboard/SkeletonLoader';
import type { Product } from '@/types/dashboard';
import type { DashboardView } from '@/components/dashboard/Sidebar';

interface ProductListProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
  searchQuery?: string;
}

export default function ProductList({ onAddNew, onEdit, searchQuery }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { addToast } = useDashboardToast();
  const queryClient = useQueryClient();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts({
        search: searchQuery,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        published: filterStatus !== 'all' ? filterStatus === 'published' : undefined
      });
      setProducts(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to load products', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, filterCategory, filterStatus]);

  const handleTogglePublish = async (product: Product) => {
    try {
      const newStatus = !product.is_published;
      await toggleProductPublished(product.id, newStatus);
      setProducts(products.map(p => p.id === product.id ? { ...p, is_published: newStatus } : p));
      // Invalidate storefront cache so the change reflects on the main site
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      addToast({ 
        type: 'success', 
        title: newStatus ? 'Product Published' : 'Product Unpublished',
        message: `${product.name} is now ${newStatus ? 'live' : 'hidden'}.`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update failed', message: err.message });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      addToast({ type: 'success', title: 'Product Deleted', message: `Successfully deleted ${name}.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete failed', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Products</h2>
          <p className="text-sm text-[#888] mt-1">{products.length} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAddNew} className="cms-btn cms-btn--primary whitespace-nowrap">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="cms-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={16} className="text-[#888]" />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="cms-select w-full sm:w-40 h-9"
          >
            <option value="all">All Categories</option>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="outerwear">Outerwear</option>
            <option value="accessories">Accessories</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="cms-select w-full sm:w-36 h-9"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <ProductTableSkeleton rows={8} />
      ) : products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cms-card p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4 border border-[#2A2A2A]">
            <Package size={28} className="text-[#555]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No products found</h3>
          <p className="text-sm text-[#888] max-w-md mx-auto mb-6">
            Get started by adding your first product to the catalog.
          </p>
          <button onClick={onAddNew} className="cms-btn cms-btn--primary">
            <Plus size={16} />
            Add Your First Product
          </button>
        </motion.div>
      ) : (
        <div className="cms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cms-table w-full text-left">
              <thead>
                <tr>
                  <th className="w-16">Image</th>
                  <th>Product Name</th>
                  <th>Category / Season</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((product) => {
                    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                    return (
                      <motion.tr 
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group"
                      >
                        <td className="py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                            {primaryImage ? (
                              <img src={primaryImage.url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="text-[#555]" />
                            )}
                          </div>
                        </td>
                        <td>
                          <p className="font-medium text-[#F5F5F5]">{product.name}</p>
                          <p className="text-[10px] text-[#888] mt-0.5">#{product.slug}</p>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {product.category && <span className="cms-chip">{product.category}</span>}
                            {product.season && <span className="cms-chip">{product.season}</span>}
                          </div>
                        </td>
                        <td className="font-medium text-[#C8A96E]">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </td>
                        <td>
                          {product.stock_quantity > 0 ? (
                            <span className="text-sm">{product.stock_quantity}</span>
                          ) : (
                            <span className="text-sm text-[#F44336] flex items-center gap-1">
                              <XCircle size={12} /> Out of stock
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            onClick={() => handleTogglePublish(product)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <div className={`cms-toggle ${product.is_published ? 'cms-toggle--active' : ''}`} />
                            <span className="text-xs text-[#888]">
                              {product.is_published ? 'Live' : 'Draft'}
                            </span>
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onEdit(product.id)}
                              className="p-1.5 rounded-md text-[#888] hover:text-[#C8A96E] hover:bg-white/5 transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1.5 rounded-md text-[#888] hover:text-[#F44336] hover:bg-[#F44336]/10 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
