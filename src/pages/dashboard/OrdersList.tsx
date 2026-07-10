import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Package, Search, Eye, Filter, ArrowUpRight } from 'lucide-react';

export default function OrdersList() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: { orders = [], total = 0 } = {}, isLoading } = useOrders({
    status: statusFilter,
    search: searchQuery,
    limit: 50
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bebas text-3xl tracking-wider text-white">ORDERS</h2>
          <p className="text-sm text-[#888888]">Manage customer orders, shipping, and fulfillment.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="cms-card p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
          <input 
            type="text" 
            placeholder="Search by order number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cms-input pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-[#888888]" />
          <select 
            className="cms-select w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="cms-card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#888888] text-center">
            <Package size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-white mb-2">No orders found</h3>
            <p className="text-sm max-w-md">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cms-table min-w-[800px]">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Fulfillment</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-[#1A1A1A]">
                    <td>
                      <div className="font-semibold text-white text-sm">{order.order_number || 'N/A'}</div>
                      <div className="text-xs text-[#888888]">{order.items?.length || 0} items</div>
                    </td>
                    <td>
                      <div className="text-sm text-[#F5F5F5]">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-[#888888]">
                        {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-[#F5F5F5] text-sm">{order.customer_name}</div>
                      <div className="text-xs text-[#888888] truncate max-w-[150px]">{order.customer_email || order.email}</div>
                    </td>
                    <td>
                      <span className={`cms-badge ${
                        order.payment_status === 'Paid' ? 'cms-badge--success' : 
                        order.payment_status === 'Failed' ? 'cms-badge--error' : 
                        'cms-badge--warning'
                      }`}>
                        {order.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm font-semibold text-white">₹{order.total?.toLocaleString()}</div>
                    </td>
                    <td>
                      <span className={`cms-badge ${
                        order.status === 'Delivered' ? 'cms-badge--success' : 
                        order.status === 'Cancelled' ? 'cms-badge--error' : 
                        'cms-badge--warning'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="p-2 text-[#888888] hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
