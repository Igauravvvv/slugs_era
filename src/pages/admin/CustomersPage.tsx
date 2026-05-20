import { useState, useMemo } from 'react';
import { useAdminCustomers, useAdminOrders, formatINR, formatDate, type AdminCustomer, type AdminOrder } from '@/hooks/useAdminData';
import { Search, Users, X } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useAdminCustomers();
  const { data: orders = [] } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [sortBy, setSortBy] = useState<'total_spent' | 'total_orders' | 'last_order_at'>('total_spent');

  const filtered = useMemo(() => {
    let list = customers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'total_spent') return b.total_spent - a.total_spent;
      if (sortBy === 'total_orders') return b.total_orders - a.total_orders;
      return new Date(b.last_order_at || 0).getTime() - new Date(a.last_order_at || 0).getTime();
    });
  }, [customers, search, sortBy]);

  const customerOrders = useMemo(() => {
    if (!selected) return [];
    return orders.filter(o => o.customer_email === selected.email || o.customer_name === selected.name);
  }, [selected, orders]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Customers & Leads</h1>
        <span className="px-2 py-0.5 rounded-full bg-[#F6F6F4] text-[12px] font-semibold text-[#6B6B6B]">{customers.length}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B]" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] focus:outline-none">
          <option value="total_spent">Sort by: Spent</option>
          <option value="total_orders">Sort by: Orders</option>
          <option value="last_order_at">Sort by: Last Order</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-[#E5E5E5] mb-2" />
            <p className="text-sm text-[#9E9E9E]">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                  {['Name', 'Email', 'Phone', 'City', 'Orders', 'Spent', 'Last Order'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{c.name}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{c.city || '—'}</td>
                    <td className="px-4 py-3 text-[#1A1A1A] font-medium">{c.total_orders}</td>
                    <td className="px-4 py-3 text-[#1A1A1A] font-medium">{formatINR(c.total_spent)}</td>
                    <td className="px-4 py-3 text-[#9E9E9E]">{c.last_order_at ? formatDate(c.last_order_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Slide-over */}
      {selected && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-md bg-white border-l border-[#E5E5E5] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-[#6B6B6B]" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-[#F6F6F4] rounded-lg p-4 text-sm space-y-1">
                <p className="text-[#6B6B6B]">{selected.email}</p>
                <p className="text-[#6B6B6B]">{selected.phone}</p>
                <p className="text-[#6B6B6B]">{selected.city}, {selected.state}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F6F6F4] rounded-lg p-4 text-center">
                  <p className="text-2xl font-semibold text-[#1A1A1A]">{selected.total_orders}</p>
                  <p className="text-xs text-[#9E9E9E] mt-1">Total Orders</p>
                </div>
                <div className="bg-[#F6F6F4] rounded-lg p-4 text-center">
                  <p className="text-2xl font-semibold text-[#1A1A1A]">{formatINR(selected.total_spent)}</p>
                  <p className="text-xs text-[#9E9E9E] mt-1">Lifetime Value</p>
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-3">Order History</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-[#9E9E9E]">No orders found</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#E5E5E5] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{o.order_number}</p>
                          <p className="text-xs text-[#9E9E9E]">{formatDate(o.created_at)}</p>
                        </div>
                        <p className="text-sm font-medium">{formatINR(o.total)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
