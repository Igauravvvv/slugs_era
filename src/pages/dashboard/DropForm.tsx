import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { createDrop, fetchDropById, fetchProducts, updateDrop } from '@/lib/queries';
import type { DropFormData, Product } from '@/types/dashboard';
import { useDashboardToast } from '@/store/dashboardToast';

interface Props { dropId?: string; onBack: () => void; onSaved: () => void; }
const emptyForm: DropFormData = { name: '', season: '', drop_date: null, cover_image_url: null, description: null, is_active: false, status: 'coming_soon', product_ids: [], sort_order: 0 };

export default function DropForm({ dropId, onBack, onSaved }: Props) {
  const [form, setForm] = useState<DropFormData>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(dropId));
  const [saving, setSaving] = useState(false);
  const { addToast } = useDashboardToast();
  useEffect(() => {
    let active = true;
    Promise.all([fetchProducts(), dropId ? fetchDropById(dropId) : Promise.resolve(null)]).then(([available, drop]) => {
      if (!active) return; setProducts(available);
      if (drop) setForm({ name: drop.name, season: drop.season, drop_date: drop.drop_date, cover_image_url: drop.cover_image_url, description: drop.description, is_active: drop.is_active, status: drop.status, product_ids: drop.product_ids || [], sort_order: drop.sort_order });
      if (dropId && !drop) addToast({ type: 'error', title: 'Drop not found' });
    }).catch((error) => addToast({ type: 'error', title: 'Could not load drop form', message: error instanceof Error ? error.message : 'Please try again.' })).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [dropId, addToast]);
  const set = <K extends keyof DropFormData>(key: K, value: DropFormData[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const toggleProduct = (id: string) => set('product_ids', form.product_ids.includes(id) ? form.product_ids.filter((item) => item !== id) : [...form.product_ids, id]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.season.trim()) { addToast({ type: 'error', title: 'Name and season are required' }); return; }
    setSaving(true);
    try { const payload: DropFormData = { ...form, name: form.name.trim(), season: form.season.trim(), status: form.is_active ? 'active' : form.status === 'active' ? 'coming_soon' : form.status }; if (dropId) await updateDrop(dropId, payload); else await createDrop(payload); addToast({ type: 'success', title: dropId ? 'Drop updated' : 'Drop created' }); onSaved(); }
    catch (error) { addToast({ type: 'error', title: 'Could not save drop', message: error instanceof Error ? error.message : 'Please try again.' }); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="cms-card p-12 text-center text-sm text-[var(--cms-text-secondary)]">Loading drop…</div>;
  return <form onSubmit={submit} className="space-y-6 max-w-4xl">
    <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-4"><button type="button" onClick={onBack} className="cms-topbar-btn"><ArrowLeft size={18} /></button><div><h2 className="text-xl font-bold text-[var(--cms-text)] font-heading">{dropId ? 'Edit Drop' : 'New Drop'}</h2><p className="text-sm text-[var(--cms-text-secondary)] mt-1">Collection details, launch date, cover, and products</p></div></div><button disabled={saving} className="cms-btn cms-btn--primary"><Save size={16} />{saving ? 'Saving…' : 'Save Drop'}</button></div>
    <section className="cms-card p-5 grid gap-5 md:grid-cols-2"><label><span className="cms-label">Name *</span><input className="cms-input" value={form.name} onChange={(e) => set('name', e.target.value)} /></label><label><span className="cms-label">Season *</span><input className="cms-input" value={form.season} onChange={(e) => set('season', e.target.value)} /></label><label><span className="cms-label">Launch date</span><input type="date" className="cms-input" value={form.drop_date?.slice(0, 10) || ''} onChange={(e) => set('drop_date', e.target.value || null)} /></label><label><span className="cms-label">Status</span><select className="cms-select" value={form.status} onChange={(e) => set('status', e.target.value as DropFormData['status'])}><option value="coming_soon">Coming soon</option><option value="active">Active</option><option value="archived">Archived</option></select></label><label className="md:col-span-2"><span className="cms-label">Cover image URL</span><input type="url" className="cms-input" value={form.cover_image_url || ''} onChange={(e) => set('cover_image_url', e.target.value || null)} /></label><label className="md:col-span-2"><span className="cms-label">Description</span><textarea className="cms-textarea" value={form.description || ''} onChange={(e) => set('description', e.target.value || null)} /></label><div className="md:col-span-2 flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--cms-text)]">Published</p><p className="text-xs text-[var(--cms-text-secondary)]">Show this collection as active</p></div><button type="button" className={`cms-toggle ${form.is_active ? 'cms-toggle--active' : ''}`} onClick={() => set('is_active', !form.is_active)} aria-label="Toggle published" /></div></section>
    <section className="cms-card p-5"><div className="mb-4"><h3 className="font-semibold text-[var(--cms-text)]">Assign products</h3><p className="text-xs text-[var(--cms-text-secondary)]">{form.product_ids.length} selected</p></div>{products.length === 0 ? <p className="text-sm text-[var(--cms-text-secondary)]">No products available.</p> : <div className="grid gap-2 sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--cms-border)] cursor-pointer hover:bg-[var(--cms-surface-2)]"><input type="checkbox" checked={form.product_ids.includes(product.id)} onChange={() => toggleProduct(product.id)} /><span className="text-sm text-[var(--cms-text)]">{product.name}</span></label>)}</div>}</section>
  </form>;
}
