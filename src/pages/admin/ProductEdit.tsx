import { useState, useEffect, useRef } from 'react';
import {
  useAdminProduct, useCreateAdminProduct, useUpdateAdminProduct,
  useAdminProductImages, useUploadProductImage, useDeleteProductImage,
  useAdminProductVariants, useCreateVariant, useDeleteVariant,
  formatINR, type AdminProduct,
} from '@/hooks/useAdminData';
import { Upload, X, Plus, Trash2, GripVertical, Image as ImageIcon, Save } from 'lucide-react';

interface Props {
  productId: string | null; // null = new product
  onBack: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  price: string;
  compare_at_price: string;
  on_sale: boolean;
  discount_value: string;
  discount_type: 'percent' | 'flat';
  cost_of_goods: string;
  stock_quantity: string;
  low_stock_threshold: string;
  ribbon: string;
  is_visible: boolean;
  show_in_pos: boolean;
  product_info: string;
  return_policy: string;
  shipping_info: string;
}

const emptyForm: FormData = {
  name: '', description: '', category: 'Tee', sku: '',
  price: '', compare_at_price: '', on_sale: false,
  discount_value: '', discount_type: 'percent',
  cost_of_goods: '', stock_quantity: '0', low_stock_threshold: '5',
  ribbon: '', is_visible: true, show_in_pos: true,
  product_info: '', return_policy: '', shipping_info: '',
};

export default function ProductEdit({ productId, onBack }: Props) {
  const isNew = !productId;
  const product = useAdminProduct(productId || undefined);
  const images = useAdminProductImages(productId || undefined);
  const variants = useAdminProductVariants(productId || undefined);
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const createVariant = useCreateVariant();
  const deleteVariant = useDeleteVariant();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ product_info: false, return_policy: false, shipping_info: false });
  const [variantModal, setVariantModal] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: '', color: 'Black', stock: '0' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing product data
  useEffect(() => {
    if (product.data) {
      const p = product.data;
      setForm({
        name: p.name || '',
        description: p.description || '',
        category: p.category || 'Tee',
        sku: p.sku || '',
        price: String(p.price || ''),
        compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
        on_sale: p.on_sale || false,
        discount_value: p.discount_value ? String(p.discount_value) : '',
        discount_type: (p.discount_type as 'percent' | 'flat') || 'percent',
        cost_of_goods: p.cost_of_goods ? String(p.cost_of_goods) : '',
        stock_quantity: String(p.stock_quantity || 0),
        low_stock_threshold: String(p.low_stock_threshold || 5),
        ribbon: p.ribbon || '',
        is_visible: p.is_visible ?? true,
        show_in_pos: p.show_in_pos ?? true,
        product_info: p.product_info || '',
        return_policy: p.return_policy || '',
        shipping_info: p.shipping_info || '',
      });
    }
  }, [product.data]);

  const update = (patch: Partial<FormData>) => setForm(prev => ({ ...prev, ...patch }));

  // Computed pricing
  const price = parseFloat(form.price) || 0;
  const discountVal = parseFloat(form.discount_value) || 0;
  const salePrice = form.on_sale
    ? form.discount_type === 'percent'
      ? price - (price * discountVal / 100)
      : price - discountVal
    : price;
  const costOfGoods = parseFloat(form.cost_of_goods) || 0;
  const profit = salePrice - costOfGoods;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const generateSKU = () => {
    const prefix = 'SLG';
    const suffix = form.name.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 4) || 'XXXX';
    update({ sku: `${prefix}-${suffix}` });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload: Partial<AdminProduct> = {
        name: form.name,
        description: form.description || null,
        category: form.category || null,
        sku: form.sku || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        on_sale: form.on_sale,
        discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
        discount_type: form.on_sale ? form.discount_type : null,
        sale_price: form.on_sale ? salePrice : null,
        cost_of_goods: parseFloat(form.cost_of_goods) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        ribbon: form.ribbon || null,
        is_visible: form.is_visible,
        show_in_pos: form.show_in_pos,
        product_info: form.product_info || null,
        return_policy: form.return_policy || null,
        shipping_info: form.shipping_info || null,
      };

      if (isNew) {
        await createProduct.mutateAsync(payload);
        showToast('Product created successfully');
        setTimeout(() => onBack(), 500);
      } else {
        await updateProduct.mutateAsync({ id: productId!, ...payload });
        showToast('Product saved successfully');
      }
    } catch (err: any) {
      showToast('Error: ' + (err.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!productId) return showToast('Save the product first to upload images');
    for (const file of Array.from(files)) {
      try {
        await uploadImage.mutateAsync({ productId, file });
        showToast('Image uploaded');
      } catch (err: any) {
        showToast('Upload failed: ' + err.message);
      }
    }
  };

  const handleAddVariant = async () => {
    if (!productId) return showToast('Save the product first');
    if (!newVariant.size) return;
    try {
      await createVariant.mutateAsync({
        product_id: productId,
        variant_name: `${newVariant.size} / ${newVariant.color}`,
        size: newVariant.size,
        color: newVariant.color,
        sku_suffix: `-${newVariant.size}-${newVariant.color.slice(0, 3).toUpperCase()}`,
        stock_quantity: parseInt(newVariant.stock) || 0,
      });
      setVariantModal(false);
      setNewVariant({ size: '', color: 'Black', stock: '0' });
      showToast('Variant added');
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const productImages = images.data || [];
  const productVariants = variants.data || [];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-[#1A1A1A] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
          {isNew ? 'New Product' : form.name || 'Edit Product'}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E5E5] rounded-lg hover:bg-[#F9F9F9]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.price}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226] disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* ─── Left Column ─── */}
        <div className="space-y-5">
          {/* Images */}
          <Card title="Images and videos">
            <div className="flex flex-wrap gap-3">
              {productImages.map(img => (
                <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#E5E5E5] group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => deleteImage.mutate({ id: img.id, productId: productId! })}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center text-[#9E9E9E] hover:border-[#C0392B] hover:text-[#C0392B] transition-colors"
              >
                <Upload size={18} />
                <span className="text-[10px] mt-1">Add</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleImageUpload(e.target.files)} />
            </div>
          </Card>

          {/* Product Info */}
          <Card title="Product info">
            <Label>Name</Label>
            <Input value={form.name} onChange={v => update({ name: v })} placeholder="e.g. Owns The Game II" />

            <Label>Ribbon</Label>
            <Input value={form.ribbon} onChange={v => update({ ribbon: v })} placeholder="e.g. New, Sale, Bestseller" />

            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Describe your product..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B] resize-none"
            />

            {/* Accordion sections */}
            <div className="mt-4 space-y-2">
              {([
                { key: 'product_info', label: 'PRODUCT INFO', placeholder: 'Fabric: 100% Cotton...' },
                { key: 'return_policy', label: 'RETURN & REFUND POLICY', placeholder: '7-day exchange policy...' },
                { key: 'shipping_info', label: 'SHIPPING INFO', placeholder: 'Free shipping across India...' },
              ] as const).map(sec => (
                <div key={sec.key} className="border border-[#E5E5E5] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(sec.key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider hover:bg-[#F9F9F9]"
                  >
                    {sec.label}
                    <span className="text-[#9E9E9E]">{openSections[sec.key] ? '−' : '+'}</span>
                  </button>
                  {openSections[sec.key] && (
                    <div className="px-4 pb-3">
                      <textarea
                        value={form[sec.key]}
                        onChange={e => update({ [sec.key]: e.target.value })}
                        placeholder={sec.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B] resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹)</Label>
                <Input value={form.price} onChange={v => update({ price: v })} placeholder="1499" type="number" />
              </div>
              <div>
                <Label>Compare at price (₹)</Label>
                <Input value={form.compare_at_price} onChange={v => update({ compare_at_price: v })} placeholder="1999" type="number" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 mb-3">
              <label className="text-sm text-[#1A1A1A] font-medium">On sale</label>
              <Toggle checked={form.on_sale} onChange={v => update({ on_sale: v })} />
            </div>

            {form.on_sale && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#F6F6F4] rounded-lg">
                <div>
                  <Label>Discount</Label>
                  <Input value={form.discount_value} onChange={v => update({ discount_value: v })} placeholder="25" type="number" />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    value={form.discount_type}
                    onChange={e => update({ discount_type: e.target.value as 'percent' | 'flat' })}
                    className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white"
                  >
                    <option value="percent">%</option>
                    <option value="flat">₹</option>
                  </select>
                </div>
                <div>
                  <Label>Sale price</Label>
                  <div className="px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-lg text-[#6B6B6B]">
                    {formatINR(salePrice)}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Cost of goods (₹)</Label>
                <Input value={form.cost_of_goods} onChange={v => update({ cost_of_goods: v })} placeholder="450" type="number" />
              </div>
              <div>
                <Label>Profit</Label>
                <div className="px-3 py-2 text-sm bg-[#F6F6F4] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] font-medium">
                  {formatINR(profit)}
                </div>
              </div>
              <div>
                <Label>Margin</Label>
                <div className="px-3 py-2 text-sm bg-[#F6F6F4] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] font-medium">
                  {margin.toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card title="Inventory">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>SKU</Label>
                <div className="flex gap-2">
                  <Input value={form.sku} onChange={v => update({ sku: v })} placeholder="SLG-XXXX" />
                  <button onClick={generateSKU} className="px-2 py-1 text-[10px] font-medium text-[#C0392B] border border-[#C0392B] rounded whitespace-nowrap hover:bg-[#FEECEC]">Auto</button>
                </div>
              </div>
              <div>
                <Label>Stock quantity</Label>
                <Input value={form.stock_quantity} onChange={v => update({ stock_quantity: v })} type="number" />
              </div>
              <div>
                <Label>Low stock at</Label>
                <Input value={form.low_stock_threshold} onChange={v => update({ low_stock_threshold: v })} type="number" />
              </div>
            </div>
          </Card>

          {/* Variants */}
          <Card title="Variants">
            {productVariants.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider border-b border-[#E5E5E5]">
                      <th className="text-left py-2 pr-3">Variant</th>
                      <th className="text-left py-2 px-3">Size</th>
                      <th className="text-left py-2 px-3">Color</th>
                      <th className="text-right py-2 px-3">Stock</th>
                      <th className="w-8 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productVariants.map(v => (
                      <tr key={v.id} className="border-t border-[#E5E5E5]">
                        <td className="py-2.5 pr-3 font-medium text-[#1A1A1A]">{v.variant_name}</td>
                        <td className="py-2.5 px-3 text-[#6B6B6B]">{v.size}</td>
                        <td className="py-2.5 px-3 text-[#6B6B6B]">{v.color}</td>
                        <td className="py-2.5 px-3 text-right text-[#1A1A1A]">{v.stock_quantity}</td>
                        <td className="py-2.5">
                          <button
                            onClick={() => deleteVariant.mutate({ id: v.id, productId: productId! })}
                            className="p-1 rounded hover:bg-[#FEECEC] text-[#9E9E9E] hover:text-[#C0392B] transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setVariantModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#C0392B] hover:bg-[#FEECEC] rounded-lg transition-colors"
            >
              <Plus size={14} /> Add variant
            </button>
          </Card>
        </div>

        {/* ─── Right Column (Sidebar) ─── */}
        <div className="space-y-5">
          {/* Visibility */}
          <Card title="Visibility">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_visible} onChange={e => update({ is_visible: e.target.checked })} className="rounded border-[#E5E5E5]" />
                <span className="text-sm text-[#1A1A1A]">Show in online store</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.show_in_pos} onChange={e => update({ show_in_pos: e.target.checked })} className="rounded border-[#E5E5E5]" />
                <span className="text-sm text-[#1A1A1A]">Show in Point of Sale</span>
              </label>
            </div>
          </Card>

          {/* Category */}
          <Card title="Category">
            <select
              value={form.category}
              onChange={e => update({ category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C0392B]"
            >
              <option value="Tee">Tee</option>
              <option value="Hoodie">Hoodie</option>
              <option value="Bottom">Bottom</option>
              <option value="Accessory">Accessory</option>
            </select>
          </Card>

          {/* SEO */}
          <Card title="Marketing & SEO">
            <Label>SEO Title</Label>
            <Input value={form.name} onChange={v => update({ name: v })} placeholder="Product title for search" />
            <Label>SEO Description</Label>
            <textarea
              value={form.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Brief description for search engines..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B] resize-none"
            />
          </Card>
        </div>
      </div>

      {/* Variant Modal */}
      {variantModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setVariantModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Add Variant</h3>
            <div className="space-y-3">
              <div>
                <Label>Size</Label>
                <select value={newVariant.size} onChange={e => setNewVariant({ ...newVariant, size: e.target.value })} className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg">
                  <option value="">Select size</option>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Color</Label>
                <Input value={newVariant.color} onChange={v => setNewVariant({ ...newVariant, color: v })} placeholder="Black" />
              </div>
              <div>
                <Label>Stock</Label>
                <Input value={newVariant.stock} onChange={v => setNewVariant({ ...newVariant, stock: v })} type="number" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setVariantModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E5E5] rounded-lg">Cancel</button>
              <button onClick={handleAddVariant} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226]">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable sub-components ─────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-1.5 mt-3 first:mt-0">{children}</label>;
}

function Input({ value, onChange, placeholder = '', type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B]"
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#C0392B]' : 'bg-[#E5E5E5]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}
