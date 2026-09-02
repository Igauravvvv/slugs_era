import { useState, useMemo } from 'react';
import { useAdminOrders, useUpdateAdminOrder, formatINR, formatDate, formatDateTime, type AdminOrder } from '@/hooks/useAdminData';
import { Search, Download, X, ChevronRight, Package, Check } from 'lucide-react';

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
  Pending:    { bg: '#FFF8E1', text: '#F57F17' },
  Processing: { bg: '#FFF8E1', text: '#F57F17' },
  Dispatched: { bg: '#E8F0FE', text: '#1A73E8' },
  Delivered:  { bg: '#E6F4EA', text: '#2E7D32' },
  Cancelled:  { bg: '#FEECEC', text: '#C0392B' },
  Paid:       { bg: '#E6F4EA', text: '#2E7D32' },
  Refunded:   { bg: '#FEECEC', text: '#C0392B' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
    >{status}</span>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

const ORDER_STATUSES = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
const FILTER_TABS = ['All', ...ORDER_STATUSES];

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const updateOrder = useUpdateAdminOrder();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [draftStatus, setDraftStatus] = useState('Pending');
  const [draftTracking, setDraftTracking] = useState('');
  const [draftCourier, setDraftCourier] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (activeTab !== 'All') list = list.filter(o => o.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        (o.order_number || '').toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, activeTab, search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setDraftStatus(order.status);
    setDraftTracking(order.tracking_number || '');
    setDraftCourier(order.courier || '');
    setDraftNotes(order.notes || '');
  };

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder.mutateAsync({
        id: selectedOrder.id,
        status: draftStatus,
        tracking_number: draftTracking.trim() || null,
        courier: draftCourier.trim() || null,
        notes: draftNotes.trim() || null,
      });
      setSelectedOrder({
        ...selectedOrder,
        status: draftStatus,
        tracking_number: draftTracking.trim() || null,
        courier: draftCourier.trim() || null,
        notes: draftNotes.trim() || null,
      });
      showToast(`Order ${selectedOrder.order_number} updated for the customer`);
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const exportCSV = () => {
    const headers = ['Order #', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'Date'];
    const rows = orders.map(o => [
      o.order_number, o.customer_name, o.customer_email || '', o.customer_phone || '',
      o.total, o.status, o.payment_status, formatDate(o.created_at),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'slugsera-orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-[#1A1A1A] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl">{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Orders</h1>
          <span className="px-2 py-0.5 rounded-full bg-[#F6F6F4] text-[12px] font-semibold text-[#6B6B6B]">{orders.length}</span>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B6B6B] border border-[#E5E5E5] rounded-lg hover:bg-[#F9F9F9]">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-[#E5E5E5] overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-[#C0392B] border-[#C0392B]'
                : 'text-[#6B6B6B] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs text-[#9E9E9E]">
                ({orders.filter(o => o.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
        <input
          type="text"
          placeholder="Search by order # or customer name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={32} className="mx-auto text-[#E5E5E5] mb-2" />
            <p className="text-sm text-[#9E9E9E]">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Order</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider hidden md:table-cell">Product(s)</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-right px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider">Status</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const items = (order.items as any[]) || [];
                  const productNames = items.map(i => i.name).slice(0, 2).join(', ');
                  const moreCount = items.length - 2;
                  return (
                    <tr key={order.id} className="border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors cursor-pointer" onClick={() => openOrder(order)}>
                      <td className="px-5 py-3 font-medium text-[#1A1A1A]">{order.order_number}</td>
                      <td className="px-3 py-3 text-[#6B6B6B]">{order.customer_name}</td>
                      <td className="px-3 py-3 text-[#6B6B6B] truncate max-w-[200px] hidden md:table-cell">
                        {productNames}{moreCount > 0 && <span className="text-[#9E9E9E]"> +{moreCount} more</span>}
                      </td>
                      <td className="px-3 py-3 text-[#9E9E9E] hidden sm:table-cell">{formatDate(order.created_at)}</td>
                      <td className="px-3 py-3 text-right font-medium text-[#1A1A1A]">{formatINR(order.total)}</td>
                      <td className="px-3 py-3 hidden sm:table-cell"><StatusBadge status={order.payment_status} /></td>
                      <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <ChevronRight size={14} className="text-[#9E9E9E]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Order Detail Slide-over ─── */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/40" onClick={() => setSelectedOrder(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-lg bg-white border-l border-[#E5E5E5] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">{selectedOrder.order_number}</h2>
                <p className="text-xs text-[#9E9E9E] mt-0.5">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-[#6B6B6B]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Order Status</label>
                <select
                  value={draftStatus}
                  onChange={e => setDraftStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] rounded-lg bg-white font-medium focus:outline-none focus:border-[#C0392B]"
                >
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-3">Timeline</label>
                <div className="flex items-center gap-2">
                  {['Pending', 'Processing', 'Dispatched', 'Delivered'].map((step, i) => {
                    const stepOrder = ['Pending', 'Processing', 'Dispatched', 'Delivered'];
                    const currentIdx = stepOrder.indexOf(draftStatus);
                    const isComplete = i <= currentIdx && draftStatus !== 'Cancelled';
                    const isCancelled = draftStatus === 'Cancelled';
                    return (
                      <div key={step} className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCancelled ? 'bg-[#FEECEC]' : isComplete ? 'bg-[#2E7D32]' : 'bg-[#E5E5E5]'
                        }`}>
                          {isComplete && !isCancelled ? (
                            <Check size={12} className="text-white" />
                          ) : (
                            <span className="text-[8px] text-white font-bold">{i + 1}</span>
                          )}
                        </div>
                        {i < 3 && <div className={`flex-1 h-0.5 ${isComplete && i < currentIdx ? 'bg-[#2E7D32]' : 'bg-[#E5E5E5]'}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {['Pending', 'Processing', 'Dispatched', 'Delivered'].map(s => (
                    <span key={s} className="text-[9px] text-[#9E9E9E]">{s}</span>
                  ))}
                </div>
              </div>

              {/* Tracking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={draftTracking}
                    onChange={e => setDraftTracking(e.target.value)}
                    placeholder="AWB / Tracking ID"
                    className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#C0392B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Courier</label>
                  <input
                    type="text"
                    value={draftCourier}
                    onChange={e => setDraftCourier(e.target.value)}
                    placeholder="Delhivery, Bluedart, etc."
                    className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white focus:outline-none focus:border-[#C0392B]"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Customer</label>
                <div className="bg-[#F6F6F4] rounded-lg p-4 text-sm space-y-1">
                  <p className="font-medium text-[#1A1A1A]">{selectedOrder.customer_name}</p>
                  {selectedOrder.customer_email && <p className="text-[#6B6B6B]">{selectedOrder.customer_email}</p>}
                  {selectedOrder.customer_phone && <p className="text-[#6B6B6B]">{selectedOrder.customer_phone}</p>}
                  {selectedOrder.shipping_address && (
                    <p className="text-[#6B6B6B] mt-2 pt-2 border-t border-[#E5E5E5]">
                      {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Items</label>
                <div className="space-y-2">
                  {((selectedOrder.items as any[]) || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#E5E5E5] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
                        <p className="text-xs text-[#9E9E9E]">Size: {item.size || '—'} · Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{formatINR(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#F6F6F4] rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-[#6B6B6B]">Subtotal</span><span>{formatINR(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[#6B6B6B]">Shipping</span><span>{selectedOrder.shipping_fee ? formatINR(selectedOrder.shipping_fee) : 'Free'}</span></div>
                <div className="flex justify-between font-semibold text-[#1A1A1A] pt-2 border-t border-[#E5E5E5]">
                  <span>Total</span><span>{formatINR(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#6B6B6B]">Payment</span>
                  <span className="flex items-center gap-2">{selectedOrder.payment_method} <StatusBadge status={selectedOrder.payment_status} /></span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  value={draftNotes}
                  onChange={e => setDraftNotes(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#9E9E9E] focus:outline-none focus:border-[#C0392B] resize-none"
                />
              </div>

              <div className="sticky bottom-0 -mx-6 border-t border-[#E5E5E5] bg-white/95 px-6 py-4 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => void handleSaveOrderUpdates()}
                  disabled={updateOrder.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C0392B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A93226] disabled:cursor-wait disabled:opacity-60"
                >
                  <Check size={15} /> {updateOrder.isPending ? 'Saving updates…' : 'Save order updates'}
                </button>
                <p className="mt-2 text-center text-[10px] text-[#9E9E9E]">Saved status and tracking details appear on the customer’s profile.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
