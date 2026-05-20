import { useState, useEffect } from 'react';
import { useAdminSettings, useUpdateAdminSettings, type AdminSiteSettings } from '@/hooks/useAdminData';
import { Store, User, Bell, AlertTriangle, Save } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [form, setForm] = useState({
    store_name: 'Slugsera',
    currency: 'INR',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
    founder_name: '',
    founder_email: '',
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    returns: false,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || 'Slugsera',
        currency: settings.currency || 'INR',
        currency_symbol: settings.currency_symbol || '₹',
        timezone: settings.timezone || 'Asia/Kolkata',
        founder_name: settings.founder_name || '',
        founder_email: settings.founder_email || '',
      });
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync(form);
      showToast('Settings saved successfully');
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-[#1A1A1A] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl">{toast}</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226] disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          {/* Store Info */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <Store size={16} className="text-[#9E9E9E]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Store Information</h3>
            </div>
            <div className="space-y-4">
              <Field label="Store Name" value={form.store_name} onChange={v => update({ store_name: v })} />
              <div className="grid grid-cols-3 gap-4">
                <Field label="Currency" value={form.currency} onChange={v => update({ currency: v })} />
                <Field label="Symbol" value={form.currency_symbol} onChange={v => update({ currency_symbol: v })} />
                <div>
                  <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-1.5">Timezone</label>
                  <select
                    value={form.timezone}
                    onChange={e => update({ timezone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#C0392B]"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <User size={16} className="text-[#9E9E9E]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Founder Name" value={form.founder_name} onChange={v => update({ founder_name: v })} placeholder="Your name" />
              <Field label="Email" value={form.founder_email} onChange={v => update({ founder_email: v })} placeholder="you@email.com" type="email" />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <Bell size={16} className="text-[#9E9E9E]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Notifications</h3>
            </div>
            <div className="space-y-4">
              <ToggleRow label="New order email" desc="Get notified when a customer places an order" checked={notifications.newOrder} onChange={v => setNotifications(p => ({ ...p, newOrder: v }))} />
              <ToggleRow label="Low stock alert" desc="Notify when products fall below threshold" checked={notifications.lowStock} onChange={v => setNotifications(p => ({ ...p, lowStock: v }))} />
              <ToggleRow label="Return requests" desc="Notify on new return or refund requests" checked={notifications.returns} onChange={v => setNotifications(p => ({ ...p, returns: v }))} />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-[#C0392B]/20 p-5" style={{ borderLeft: '3px solid #C0392B' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-[#C0392B]" />
              <h3 className="text-sm font-semibold text-[#C0392B]">Danger Zone</h3>
            </div>
            <p className="text-sm text-[#6B6B6B] mb-4">Permanently delete all dashboard data. This action cannot be undone.</p>
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-sm font-medium text-[#C0392B] border border-[#C0392B] rounded-lg hover:bg-[#FEECEC]"
            >
              Reset Dashboard Data
            </button>
          </div>
        </>
      )}

      {/* Confirm Reset Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmReset(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Reset all data?</h3>
            <p className="text-sm text-[#6B6B6B] mb-5">This will permanently delete all products, orders, and customer data. You cannot undo this.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E5E5] rounded-lg">Cancel</button>
              <button onClick={() => { setConfirmReset(false); showToast('Data reset disabled in demo'); }} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226]">
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B]" />
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#9E9E9E]">{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#C0392B]' : 'bg-[#E5E5E5]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
