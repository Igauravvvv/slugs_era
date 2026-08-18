import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Tag, Box, FileText, Image as ImageIcon, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { fetchProductById, createProduct, updateProduct } from '@/lib/queries';
import { useDashboardToast } from '@/store/dashboardToast';
import ImageUploader from '@/components/dashboard/ImageUploader';
import RichTextEditor from '@/components/dashboard/RichTextEditor';
import type { Product, ProductFormData } from '@/types/dashboard';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  category: z.enum(['tops', 'bottoms', 'outerwear', 'accessories']).nullable(),
  season: z.string().nullable(),
  drop_name: z.string().nullable(),
  description: z.string().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  compare_price: z.number().nullable(),
  stock_quantity: z.number().int().min(0),
  tags: z.array(z.string()).nullable(),
  sizes: z.array(z.string()).nullable(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
  images: z.array(z.object({ url: z.string(), alt: z.string(), isPrimary: z.boolean() })).default([]),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.number().default(0),
});

type FormValues = z.infer<typeof productSchema>;

const tabs = [
  { id: 'basic', label: 'Basic Info', icon: Tag },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'inventory', label: 'Pricing & Inventory', icon: Box },
  { id: 'description', label: 'Description', icon: FileText },
];

interface ProductFormProps {
  productId?: string;
  onBack: () => void;
  onSaved: () => void;
}

export default function ProductForm({ productId, onBack, onSaved }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  
  const { addToast } = useDashboardToast();

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: 'tops',
      season: 'SS25',
      drop_name: '',
      description: '',
      price: 0,
      compare_price: null,
      stock_quantity: 0,
      tags: [],
      sizes: [],
      colors: [],
      images: [],
      is_published: false,
      is_featured: false,
      sort_order: 0,
    }
  });

  const values = watch();

  // Load product if editing
  useEffect(() => {
    if (productId) {
      fetchProductById(productId)
        .then((data) => {
          if (data) {
            reset({
              ...data,
              tags: data.tags || [],
              sizes: data.sizes || [],
              colors: data.colors || [],
              images: data.images || [],
            });
            setLastSaved(new Date(data.updated_at));
          }
          setLoading(false);
        })
        .catch((err) => {
          addToast({ type: 'error', title: 'Error loading product', message: err.message });
          setLoading(false);
        });
    }
  }, [productId, reset]);

  // Auto-generate slug from name if empty
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'name' && value.name && !getValues('slug')) {
        setValue('slug', value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  // Auto-save draft
  useEffect(() => {
    if (!isDirty || !values.name || saving || autoSaving) return;
    
    const timer = setTimeout(async () => {
      setAutoSaving(true);
      try {
        if (productId) {
          await updateProduct(productId, getValues() as ProductFormData);
        }
        setLastSaved(new Date());
        reset(getValues(), { keepDirty: false });
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setAutoSaving(false);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [values, isDirty, productId, saving, autoSaving, getValues, reset]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, data as ProductFormData);
        addToast({ type: 'success', title: 'Product updated successfully' });
      } else {
        await createProduct(data as ProductFormData);
        addToast({ type: 'success', title: 'Product created successfully' });
      }
      reset(data, { keepDirty: false });
      setLastSaved(new Date());
      onSaved();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to save', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => {
    const currentErrors = errors;
    if (currentErrors.name || currentErrors.slug || currentErrors.category) setActiveTab('basic');
    else if (currentErrors.price || currentErrors.stock_quantity) setActiveTab('inventory');
    else if (currentErrors.images) setActiveTab('media');
    else if (currentErrors.description) setActiveTab('description');

    addToast({
      type: 'error',
      title: 'Product was not saved',
      message: 'Please correct the highlighted required fields and save again.',
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !values.tags?.includes(tagInput.trim())) {
      setValue('tags', [...(values.tags || []), tagInput.trim()], { shouldDirty: true });
      setTagInput('');
    }
  };

  const toggleSize = (size: string) => {
    const current = values.sizes || [];
    if (current.includes(size)) {
      setValue('sizes', current.filter(s => s !== size), { shouldDirty: true });
    } else {
      setValue('sizes', [...current, size], { shouldDirty: true });
    }
  };

  const addColor = () => {
    if (colorName.trim()) {
      setValue('colors', [...(values.colors || []), { name: colorName.trim(), hex: colorHex }], { shouldDirty: true });
      setColorName('');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-[#888]">Loading product data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0A] sticky top-0 z-20 py-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="cms-topbar-btn">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">
              {productId ? 'Edit Product' : 'New Product'}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-[#888] mt-1">
              {lastSaved ? (
                <span>Last saved {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Unsaved draft</span>
              )}
              {autoSaving && <Loader2 size={10} className="animate-spin" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Controller
            name="is_published"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer mr-2">
                <span className="text-xs text-[#F5F5F5]">{field.value ? 'Published' : 'Draft'}</span>
                <button
                  type="button"
                  className={`cms-toggle ${field.value ? 'cms-toggle--active' : ''}`}
                  onClick={() => field.onChange(!field.value)}
                />
              </label>
            )}
          />
          <button 
            type="submit" 
            disabled={saving}
            className="cms-btn cms-btn--primary"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cms-tabs overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`cms-tab flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'cms-tab--active' : ''}`}
          >
            <tab.icon size={14} />
            {tab.label}
            {/* Show error dot if tab has validation errors */}
            {((tab.id === 'basic' && (errors.name || errors.slug)) || 
              (tab.id === 'inventory' && (errors.price || errors.stock_quantity))) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F44336] ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="cms-card p-6 space-y-4">
                <div>
                  <label className="cms-label">Product Name</label>
                  <input {...register('name')} className="cms-input" placeholder="Heavyweight Oversized Tee" />
                  {errors.name && <span className="cms-error-msg">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="cms-label">Slug</label>
                  <input {...register('slug')} className="cms-input" placeholder="heavyweight-oversized-tee" />
                  {errors.slug && <span className="cms-error-msg">{errors.slug.message}</span>}
                </div>
              </div>

              <div className="cms-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="cms-label mb-0">Feature this product?</label>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <button type="button" className={`cms-toggle ${field.value ? 'cms-toggle--active' : ''}`} onClick={() => field.onChange(!field.value)} />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="cms-card p-6 space-y-4">
                <div>
                  <label className="cms-label">Category</label>
                  <select {...register('category')} className="cms-select">
                    <option value="">Select Category</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="cms-label">Season</label>
                  <select {...register('season')} className="cms-select">
                    <option value="">Select Season</option>
                    <option value="SS25">SS25</option>
                    <option value="FW24">FW24</option>
                    <option value="FW25">FW25</option>
                    <option value="Resort">Resort</option>
                    <option value="Limited">Limited Edition</option>
                  </select>
                </div>
                <div>
                  <label className="cms-label">Drop Name (Optional)</label>
                  <input {...register('drop_name')} className="cms-input" placeholder="e.g. Obsidian Drop" />
                </div>
              </div>

              <div className="cms-card p-6 space-y-4">
                <label className="cms-label">Tags</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="cms-input" 
                    placeholder="Add tag" 
                  />
                  <button type="button" onClick={addTag} className="cms-btn cms-btn--secondary px-3"><Plus size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {values.tags?.map((tag, idx) => (
                    <span key={idx} className="cms-chip">
                      {tag}
                      <button type="button" onClick={() => setValue('tags', values.tags!.filter(t => t !== tag), { shouldDirty: true })}>
                        <X size={12} className="text-[#888] hover:text-[#F5F5F5]" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'media' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cms-card p-6">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader 
                  images={field.value} 
                  onChange={field.onChange} 
                  bucket="product-images"
                  maxFiles={8}
                />
              )}
            />
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="cms-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Pricing & Stock</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="cms-label">Price (₹)</label>
                  <input type="number" {...register('price', { valueAsNumber: true })} className="cms-input" />
                  {errors.price && <span className="cms-error-msg">{errors.price.message}</span>}
                </div>
                <div>
                  <label className="cms-label">Compare at Price</label>
                  <input type="number" {...register('compare_price', { setValueAs: v => v === '' ? null : Number(v) })} className="cms-input" placeholder="Optional" />
                </div>
              </div>
              <div className="pt-2">
                <label className="cms-label">Stock Quantity</label>
                <input type="number" {...register('stock_quantity', { valueAsNumber: true })} className="cms-input w-full sm:w-1/2" />
                {errors.stock_quantity && <span className="cms-error-msg">{errors.stock_quantity.message}</span>}
              </div>
            </div>

            <div className="cms-card p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${
                        values.sizes?.includes(size)
                          ? 'border-[#C0132A] bg-[#C0132A]/10 text-[#C0132A]'
                          : 'border-[#2A2A2A] text-[#888] hover:border-[#3A3A3A] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Colors</h3>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded border-0 p-0 cursor-pointer bg-transparent" 
                  />
                  <input 
                    type="text" 
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    className="cms-input flex-1" 
                    placeholder="Color Name (e.g. Obsidian)" 
                  />
                  <button type="button" onClick={addColor} className="cms-btn cms-btn--secondary px-3"><Plus size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {values.colors?.map((color, idx) => (
                    <div key={idx} className="cms-chip pl-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      <button type="button" onClick={() => setValue('colors', values.colors!.filter((_, i) => i !== idx), { shouldDirty: true })}>
                        <X size={12} className="text-[#888] hover:text-[#F5F5F5] ml-1" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'description' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cms-card p-6">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor content={field.value || ''} onChange={field.onChange} />
              )}
            />
          </motion.div>
        )}
      </div>
    </form>
  );
}
