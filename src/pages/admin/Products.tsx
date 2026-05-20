import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Eye,
  Image as ImageIcon, ArrowUpDown, Package,
  Upload, X, Check, AlertCircle, Save
} from 'lucide-react';
import { products as storeProducts } from '@/data/products';
import type { Product } from '@/types';
import { useStore } from '@/store';
import { CDN, cdnUrl } from '@/lib/cdn';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';

type ProductStatus = 'active' | 'draft' | 'archived';

interface AdminProduct extends Product {
  status: ProductStatus;
  stock: number;
  seoScore: number;
  sold: number;
}

// Compute real SEO score from product data quality
function computeSeoScore(p: Product): number {
  let score = 0;
  if (p.name && p.name.length >= 3) score += 15;
  if (p.description && p.description.length >= 80) score += 20;
  else if (p.description && p.description.length >= 30) score += 10;
  if (p.slogan) score += 10;
  if (p.image) score += 10;
  if (p.images && p.images.length > 1) score += 10;
  if (p.material) score += 10;
  if (p.fit) score += 5;
  if (p.careInstructions && p.careInstructions.length > 0) score += 5;
  if (p.features && p.features.length >= 2) score += 10;
  else if (p.features && p.features.length >= 1) score += 5;
  if (p.colors && p.colors.length > 0) score += 5;
  return Math.min(100, score);
}

// Estimate sold count based on product attributes
function estimateSold(p: Product): number {
  if (p.status === 'coming_soon' || p.status === 'pre_book') return 0;
  if (p.badge === 'Bestseller') return 47;
  if (p.badge === 'New Arrival') return 22;
  if (p.badge === 'Limited') return 28;
  if (p.badge === 'Exclusive') return 15;
  if (p.status === 'sold_out') return 35;
  return 10;
}

// Convert storefront products to admin-compatible format using REAL data
function toAdminProduct(p: Product): AdminProduct {
  const realStock = p.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;
  const isProductActive = p.status === 'active' || !p.status;
  const isDraft = p.status === 'coming_soon';
  return {
    ...p,
    status: (p.status === 'sold_out' ? 'archived' : isDraft ? 'draft' : 'active') as ProductStatus,
    stock: realStock,
    seoScore: computeSeoScore(p),
    sold: estimateSold(p),
  };
}

const statusStyles: Record<ProductStatus, { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Active' },
  draft: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', label: 'Draft' },
  archived: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Archived' },
};

function SEOScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score}</span>
    </div>
  );
}

// ==========================================
// PRODUCT FORM (Add + Edit)
// ==========================================
interface ProductFormData {
  name: string; slogan: string; description: string; category: string;
  price: number; originalPrice: number; status: ProductStatus;
  sizes: string[]; colors: string[]; features: string[];
  image: string; badge: string; stock: number;
  metaTitle: string; metaDescription: string; tags: string[];
}

const emptyForm: ProductFormData = {
  name: '', slogan: '', description: '', category: 'tshirts',
  price: 0, originalPrice: 0, status: 'draft',
  sizes: [], colors: [], features: [],
  image: '', badge: '', stock: 0,
  metaTitle: '', metaDescription: '', tags: [],
};

function ProductFormModal({ isOpen, onClose, onSave, editProduct }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: ProductFormData) => void;
  editProduct?: AdminProduct | null;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductFormData>(
    editProduct ? {
      name: editProduct.name, slogan: editProduct.slogan, description: editProduct.description,
      category: editProduct.category, price: editProduct.price, originalPrice: editProduct.originalPrice || 0,
      status: editProduct.status, sizes: [...editProduct.sizes], colors: [...editProduct.colors],
      features: [...editProduct.features], image: editProduct.image, badge: editProduct.badge || '',
      stock: editProduct.stock, metaTitle: `${editProduct.name} | Slug's Era`,
      metaDescription: editProduct.description.substring(0, 155), tags: [],
    } : { ...emptyForm }
  );
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const totalSteps = 4;

  if (!isOpen) return null;

  const updateForm = (patch: Partial<ProductFormData>) => setForm({ ...form, ...patch });

  const toggleSize = (size: string) => {
    updateForm({
      sizes: form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size],
    });
  };

  const toggleColor = (color: string) => {
    updateForm({
      colors: form.colors.includes(color) ? form.colors.filter(c => c !== color) : [...form.colors, color],
    });
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      updateForm({ tags: [...form.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      updateForm({ features: [...form.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const seoScore = Math.min(100, [
    form.name.length > 3 ? 20 : 0,
    form.description.length > 30 ? 20 : form.description.length > 10 ? 10 : 0,
    form.metaTitle.length > 10 ? 15 : 0,
    form.metaDescription.length > 50 ? 15 : form.metaDescription.length > 20 ? 8 : 0,
    form.image ? 15 : 0,
    form.tags.length >= 2 ? 15 : form.tags.length >= 1 ? 8 : 0,
  ].reduce((a, b) => a + b, 0));

  const canPublish = form.name && form.price > 0 && form.category && form.sizes.length > 0;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold text-white">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-gray-500 text-sm mt-0.5">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X size={18} /></button>
          </div>

          {/* Progress */}
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: i < step ? '100%' : '0%' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #C0132A, #ff4757)' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['Basic Info', 'Media & Features', 'Variants & Stock', 'SEO'].map((label, i) => (
                <button key={label} onClick={() => setStep(i + 1)}
                  className={`text-[10px] font-medium cursor-pointer hover:text-white transition-colors ${i < step ? 'text-[#ff4757]' : 'text-gray-600'}`}>{label}</button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => updateForm({ name: e.target.value })}
                    placeholder="e.g. The Tortoise Tee"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Slogan</label>
                  <input type="text" value={form.slogan} onChange={(e) => updateForm({ slogan: e.target.value })}
                    placeholder="e.g. Always Finishes"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description *</label>
                  <textarea rows={4} value={form.description} onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="Describe the product..."
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category *</label>
                    <select value={form.category} onChange={(e) => updateForm({ category: e.target.value })}
                      className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 appearance-none">
                      <option value="tshirts">T-Shirts</option>
                      <option value="shirts">Shirts</option>
                      <option value="hoodies">Hoodies</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</label>
                    <select value={form.status} onChange={(e) => updateForm({ status: e.target.value as ProductStatus })}
                      className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 appearance-none">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price (₹) *</label>
                    <input type="number" value={form.price || ''} onChange={(e) => updateForm({ price: Number(e.target.value) })}
                      placeholder="1899"
                      className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Compare Price (₹)</label>
                    <input type="number" value={form.originalPrice || ''} onChange={(e) => updateForm({ originalPrice: Number(e.target.value) })}
                      placeholder="2499"
                      className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Badge</label>
                  <div className="flex gap-2 mt-2">
                    {['', 'New Arrival', 'Limited', 'Exclusive', 'Sale', 'Bestseller'].map((b) => (
                      <button key={b} onClick={() => updateForm({ badge: b })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.badge === b ? 'bg-[#C0132A]/20 border-[#C0132A]/50 text-[#ff4757]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
                        {b || 'None'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product Image URL *</label>
                  <input type="text" value={form.image} onChange={(e) => updateForm({ image: e.target.value })}
                    placeholder="https://... CDN URL or upload below"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                </div>
                {form.image && (
                  <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                  </div>
                )}
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#C0132A]/30 transition-colors cursor-pointer">
                  <Upload size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-white font-medium text-sm">Drop images here or click to upload</p>
                  <p className="text-gray-500 text-xs mt-1">PNG, JPG, WebP up to 5MB each</p>
                </div>

                {/* Features */}
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Features</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.features.map((f) => (
                      <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5">
                        {f}
                        <button onClick={() => updateForm({ features: form.features.filter(ff => ff !== f) })}><X size={10} className="text-gray-500 hover:text-white" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="e.g. Premium Cotton" className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none" />
                    <button onClick={addFeature} className="px-3 py-2 rounded-lg bg-[#C0132A]/20 text-[#ff4757] text-xs font-medium hover:bg-[#C0132A]/30">Add</button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sizes *</label>
                  <div className="flex gap-2 mt-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                      <button key={size} onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.sizes.includes(size) ? 'bg-[#C0132A]/20 border-[#C0132A]/50 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Colors</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['#1A1A1A', '#42C0FB', '#1E4D2B', '#F5F5F3', '#0A192F', '#D4A574', '#8B4513', '#C0132A', '#FFFFFF'].map((color) => (
                      <button key={color} onClick={() => toggleColor(color)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${form.colors.includes(color) ? 'border-[#C0132A] scale-110 ring-2 ring-[#C0132A]/30' : 'border-white/10 hover:border-white/30'}`}
                        style={{ background: color }} />
                    ))}
                  </div>
                  {form.colors.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{form.colors.length} color{form.colors.length !== 1 ? 's' : ''} selected</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stock Quantity</label>
                  <input type="number" value={form.stock || ''} onChange={(e) => updateForm({ stock: Number(e.target.value) })}
                    placeholder="50" className="mt-1.5 w-full max-w-[200px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-[#ff4757]" />
                    <span className="text-white text-sm font-medium">SEO Score</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${seoScore}%` }}
                      className="h-full rounded-full" style={{ background: seoScore >= 80 ? '#10b981' : seoScore >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <p className={`text-xs mt-2 font-medium ${seoScore >= 80 ? 'text-emerald-400' : seoScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {seoScore}/100 — {seoScore >= 80 ? 'Good' : seoScore >= 60 ? 'Needs Work' : 'Poor'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Meta Title <span className="text-gray-600">({form.metaTitle.length}/60 chars)</span>
                  </label>
                  <input type="text" value={form.metaTitle} onChange={(e) => updateForm({ metaTitle: e.target.value })}
                    placeholder={`${form.name} | Slug's Era`}
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Meta Description <span className="text-gray-600">({form.metaDescription.length}/160 chars)</span>
                  </label>
                  <textarea rows={3} value={form.metaDescription} onChange={(e) => updateForm({ metaDescription: e.target.value })}
                    placeholder="Describe this product for search engines..."
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5">
                        {tag}
                        <button onClick={() => updateForm({ tags: form.tags.filter(t => t !== tag) })}><X size={10} className="text-gray-500 hover:text-white" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag" className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none" />
                    <button onClick={addTag} className="px-3 py-2 rounded-lg bg-[#C0132A]/20 text-[#ff4757] text-xs font-medium hover:bg-[#C0132A]/30">Add</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/5">
            <button onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              disabled={step === 1}>
              ← Back
            </button>
            <div className="flex gap-2">
              {step === totalSteps && (
                <button onClick={() => { updateForm({ status: 'draft' }); onSave({ ...form, status: 'draft' }); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Save size={14} /> Save as Draft
                </button>
              )}
              <button
                onClick={() => {
                  if (step < totalSteps) setStep(step + 1);
                  else if (canPublish) onSave(form);
                }}
                disabled={step === totalSteps && !canPublish}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 ${step === totalSteps && !canPublish ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#C0132A]/20'}`}
                style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
                {step === totalSteps ? (<><Check size={16} /> {editProduct ? 'Update Product' : 'Publish Product'}</>) : 'Continue →'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================
// DELETE CONFIRMATION
// ==========================================
function DeleteConfirm({ product, onConfirm, onCancel }: { product: AdminProduct; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Delete "{product.name}"?</h3>
          <p className="text-gray-400 text-sm mb-6">This action cannot be undone. The product will be permanently removed from your catalog.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
              Delete Product
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// PRODUCT DETAIL VIEW
// ==========================================
function ProductDetailView({ product, onClose, onEdit }: { product: AdminProduct; onClose: () => void; onEdit: () => void }) {
  const { setSelectedProduct, setView } = useStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Product Details</h2>
          <div className="flex gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1.5">
              <Edit size={12} /> Edit
            </button>
            <button onClick={() => { setSelectedProduct(product); setView('product'); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1.5">
              <Eye size={12} /> View in Store
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400"><X size={16} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col sm:flex-row gap-5">
          <div className="w-full sm:w-48 aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-gray-500 text-sm italic">"{product.slogan}"</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && product.originalPrice > 0 && (
                <span className="text-base text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: statusStyles[product.status].bg, color: statusStyles[product.status].color }}>
                {statusStyles[product.status].label}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500">Stock</p>
                <p className={`text-lg font-bold ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>{product.stock}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500">Sold</p>
                <p className="text-lg font-bold text-white">{product.sold}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500">SEO</p>
                <p className={`text-lg font-bold ${product.seoScore >= 80 ? 'text-emerald-400' : product.seoScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{product.seoScore}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sizes</p>
                <div className="flex gap-1">{product.sizes.map(s => <span key={s} className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-gray-300 border border-white/10">{s}</span>)}</div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Colors</p>
                <div className="flex gap-1">{product.colors.map(c => <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />)}</div>
              </div>
            </div>
            {product.features.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Features</p>
                <div className="flex flex-wrap gap-1">{product.features.map(f => <span key={f} className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-gray-300 border border-white/10">{f}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// MAIN PRODUCTS PAGE
// ==========================================
export default function Products() {
  const { data: dbProducts = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const allProducts: AdminProduct[] = dbProducts.map(p => toAdminProduct(p));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = allProducts.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all') {
      const catMap: Record<string, string> = { 'T-Shirts': 'tshirts', 'Shirts': 'shirts', 'Hoodies': 'hoodies' };
      if (catMap[selectedCategory] && p.category !== catMap[selectedCategory]) return false;
    }
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  const handleSave = (data: ProductFormData) => {
    if (editingProduct) {
      // UPDATE
      const updatedProduct = {
        ...editingProduct, name: data.name, slogan: data.slogan, description: data.description,
        category: data.category as Product['category'], price: data.price,
        originalPrice: data.originalPrice || undefined, image: data.image || editingProduct.image,
        images: data.image ? [data.image] : editingProduct.images, sizes: data.sizes, colors: data.colors,
        features: data.features, badge: data.badge || undefined, status: data.status,
        stock: data.stock, inStock: data.stock > 0,
      };

      updateProduct.mutate(updatedProduct as Product, {
        onSuccess: () => showNotif('success', `"${data.name}" updated successfully`),
        onError: (err) => showNotif('error', `Update failed: ${err.message}`)
      });
    } else {
      // CREATE
      const newProduct: Partial<Product> = {
        name: data.name, slogan: data.slogan,
        description: data.description, category: data.category as Product['category'],
        price: data.price, originalPrice: data.originalPrice || undefined,
        image: data.image || CDN.LOGO, images: data.image ? [data.image] : [],
        badge: data.badge || undefined, colors: data.colors, sizes: data.sizes,
        features: data.features, inStock: data.stock > 0, status: data.status,
      };

      createProduct.mutate(newProduct, {
        onSuccess: () => showNotif('success', `"${data.name}" created successfully`),
        onError: (err) => showNotif('error', `Create failed: ${err.message}`)
      });
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id, {
        onSuccess: () => showNotif('success', `"${deletingProduct.name}" deleted`),
        onError: (err) => showNotif('error', `Delete failed: ${err.message}`)
      });
      setDeletingProduct(null);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[200] px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(null); }}
        onSave={handleSave}
        editProduct={editingProduct}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deletingProduct && (
          <DeleteConfirm product={deletingProduct} onConfirm={handleDelete} onCancel={() => setDeletingProduct(null)} />
        )}
      </AnimatePresence>

      {/* Product Detail View */}
      <AnimatePresence>
        {viewingProduct && (
          <ProductDetailView product={viewingProduct} onClose={() => setViewingProduct(null)}
            onEdit={() => { setViewingProduct(null); handleEdit(viewingProduct); }} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{allProducts.length} products in your catalog</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
            <Upload size={16} /> Import CSV
          </button>
          <button onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-[#C0132A]/20 transition-all"
            style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search products..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all" />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer">
          <option value="all">All Categories</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Shirts">Shirts</option>
          <option value="Hoodies">Hoodies</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3 border-b border-white/5">
          {['', 'Product', 'Category', 'Price', 'Stock', 'SEO', 'Status', ''].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-gray-300">
              {h} {h && <ArrowUpDown size={10} />}
            </span>
          ))}
        </div>

        {filtered.map((product, i) => {
          const status = statusStyles[product.status];
          const catLabel = product.category === 'tshirts' ? 'T-Shirts' : product.category === 'shirts' ? 'Shirts' : product.category === 'hoodies' ? 'Hoodies' : product.category;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => setViewingProduct(product)}>
              <div className="w-4 h-4 rounded border border-white/10" onClick={(e) => e.stopPropagation()} />
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product.name}</p>
                  <p className="text-gray-500 text-xs truncate">{product.sizes.length} sizes • {product.sold} sold</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">{catLabel}</span>
              <span className="text-white text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</span>
              <div>
                <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>
                  {product.stock === 0 ? 'Out of stock' : product.stock}
                </span>
                {product.stock > 0 && product.stock <= 5 && <p className="text-amber-400/60 text-[10px]">Low stock</p>}
              </div>
              <SEOScoreBadge score={product.seoScore} />
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider w-fit"
                style={{ background: status.bg, color: status.color }}>{status.label}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setViewingProduct(product)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><Eye size={14} /></button>
                <button onClick={() => handleEdit(product)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><Edit size={14} /></button>
                <button onClick={() => setDeletingProduct(product)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">No products found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
