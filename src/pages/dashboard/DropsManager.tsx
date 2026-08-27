import { useCallback, useEffect, useState } from 'react';
import { Calendar, Edit3, Layers, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { deleteDrop, fetchDrops, updateDrop } from '@/lib/queries';
import type { Drop } from '@/types/dashboard';
import { useDashboardToast } from '@/store/dashboardToast';

interface Props { onAddNew: () => void; onEdit: (id: string) => void; }

export default function DropsManager({ onAddNew, onEdit }: Props) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { addToast } = useDashboardToast();
  const load = useCallback(async () => {
    setLoading(true);
    try { setDrops(await fetchDrops()); }
    catch (error) { addToast({ type: 'error', title: 'Could not load drops', message: error instanceof Error ? error.message : 'Please try again.' }); }
    finally { setLoading(false); }
  }, [addToast]);
  useEffect(() => { void load(); }, [load]);

  const toggleActive = async (drop: Drop) => {
    setBusyId(drop.id);
    try { const updated = await updateDrop(drop.id, { is_active: !drop.is_active, status: !drop.is_active ? 'active' : 'archived' }); setDrops((items) => items.map((item) => item.id === drop.id ? updated : item)); addToast({ type: 'success', title: updated.is_active ? 'Drop activated' : 'Drop archived' }); }
    catch (error) { addToast({ type: 'error', title: 'Could not update drop', message: error instanceof Error ? error.message : 'Please try again.' }); }
    finally { setBusyId(null); }
  };
  const remove = async (drop: Drop) => {
    if (!window.confirm(`Delete “${drop.name}”? Products will not be deleted.`)) return;
    setBusyId(drop.id);
    try { await deleteDrop(drop.id); setDrops((items) => items.filter((item) => item.id !== drop.id)); addToast({ type: 'success', title: 'Drop deleted' }); }
    catch (error) { addToast({ type: 'error', title: 'Could not delete drop', message: error instanceof Error ? error.message : 'Please try again.' }); }
    finally { setBusyId(null); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-[var(--cms-text)] font-heading">Seasonal Drops</h2><p className="text-sm text-[var(--cms-text-secondary)] mt-1">Create, schedule, publish, and archive collections</p></div><div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="cms-btn cms-btn--secondary"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button><button onClick={onAddNew} className="cms-btn cms-btn--primary"><Plus size={16} /> New Drop</button></div></div>
    {loading ? <div className="cms-card p-12 text-center text-sm text-[var(--cms-text-secondary)]">Loading drops…</div> : drops.length === 0 ? <div className="cms-card p-12 text-center"><Layers size={48} className="mx-auto text-[var(--cms-text-muted)] mb-4" /><h3 className="text-lg font-semibold text-[var(--cms-text)] mb-2">No seasonal drops yet</h3><p className="text-sm text-[var(--cms-text-secondary)] mb-6">Create your first collection and assign products to it.</p><button onClick={onAddNew} className="cms-btn cms-btn--primary"><Plus size={16} /> Create First Drop</button></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{drops.map((drop) => <article key={drop.id} className="cms-card overflow-hidden"><div className="aspect-[16/8] bg-[var(--cms-surface-2)]">{drop.cover_image_url ? <img src={drop.cover_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Layers className="text-[var(--cms-text-muted)]" /></div>}</div><div className="p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[var(--cms-text)]">{drop.name}</h3><p className="text-xs text-[var(--cms-text-secondary)]">{drop.season}</p></div><span className={`cms-badge ${drop.status === 'active' ? 'cms-badge--success' : drop.status === 'coming_soon' ? 'cms-badge--accent' : 'cms-badge--draft'}`}>{drop.status.replace('_', ' ')}</span></div><div className="flex items-center gap-2 text-xs text-[var(--cms-text-secondary)]"><Calendar size={13} />{drop.drop_date ? new Date(drop.drop_date).toLocaleDateString('en-IN') : 'No launch date'} · {drop.product_ids?.length || 0} products</div><div className="flex items-center justify-between pt-2 border-t border-[var(--cms-border)]"><button className={`cms-toggle ${drop.is_active ? 'cms-toggle--active' : ''}`} disabled={busyId === drop.id} onClick={() => void toggleActive(drop)} aria-label={drop.is_active ? 'Archive drop' : 'Activate drop'} /><div className="flex gap-1"><button onClick={() => onEdit(drop.id)} className="cms-topbar-btn" title="Edit"><Edit3 size={15} /></button><button onClick={() => void remove(drop)} disabled={busyId === drop.id} className="cms-topbar-btn text-red-500" title="Delete"><Trash2 size={15} /></button></div></div></div></article>)}</div>}
  </div>;
}
