import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store';
import {
  User, Package, Heart, MapPin, LogOut, ChevronRight,
  ShoppingBag, Clock, CheckCircle, Truck, XCircle, ArrowLeft,
  Settings, Star, Medal, Edit
} from 'lucide-react';
import { CDN } from '@/lib/cdn';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/types';
import ProductPrice from '@/components/ProductPrice';

type ProfileTab = 'orders' | 'addresses' | 'wishlist' | 'settings';

// Mock order data
const mockOrders = [
  {
    id: 'SE-20260415-019',
    date: 'Apr 15, 2026',
    total: 5697,
    status: 'processing',
    items: [
      { name: 'The Tortoise', size: 'L', color: 'Blue', qty: 1, price: 1899, image: CDN.TORTOISE },
      { name: 'Slow Down', size: 'XL', color: 'Green', qty: 1, price: 1899, image: CDN.SLOTH },
      { name: 'NYT & WAVES', size: 'M', color: 'Navy', qty: 1, price: 2299, image: CDN.NYT_WAVES },
    ],
  },
  {
    id: 'SE-20260408-001',
    date: 'Apr 8, 2026',
    total: 2299,
    status: 'delivered',
    items: [
      { name: 'SUNLIGHT & WAVES', size: 'L', color: 'Blue', qty: 1, price: 2299, image: CDN.SUNLIGHT_WAVES },
    ],
  },
  {
    id: 'SE-20260325-004',
    date: 'Mar 25, 2026',
    total: 3798,
    status: 'delivered',
    items: [
      { name: 'Let The Moment Play', size: 'M', color: 'Black', qty: 2, price: 1899, image: CDN.VINYL_MOMENT },
    ],
  },
];

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending: { color: '#f59e0b', bg: '#fef3c7', icon: Clock, label: 'Pending' },
  processing: { color: '#3b82f6', bg: '#dbeafe', icon: Package, label: 'Processing' },
  shipped: { color: '#8b5cf6', bg: '#ede9fe', icon: Truck, label: 'Shipped' },
  delivered: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: '#ef4444', bg: '#fee2e2', icon: XCircle, label: 'Cancelled' },
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const { addresses, wishlist, products } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileName, setProfileName] = useState(user?.email?.split('@')[0] || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch real orders from Supabase
  useEffect(() => {
    async function fetchOrders() {
      if (!user?.email) { setOrdersLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`email.eq.${user.email},customer_email.eq.${user.email},user_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        // Gracefully handle table-not-found or RLS errors
        if (error) {
          console.warn('Orders table not available:', error.message);
          setOrders([]);
          return;
        }
        setOrders(data || []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();

    // Subscribe to realtime order updates
    const subscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.email === user.email || payload.new.customer_email === user.email || payload.new.user_id === user.id) {
            setOrders((currentOrders) =>
              currentOrders.map((order) =>
                order.id === payload.new.id ? payload.new : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishedProducts.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs uppercase tracking-wider font-medium transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Store
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                 style={{ background: 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
              {user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wider text-[#1A1A1A]">
                {user?.email?.split('@')[0]?.toUpperCase() || 'MEMBER'}
              </h1>
              <p className="text-sm text-[#1A1A1A]/50">{user?.email || 'member@slugsera.com'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#C0132A]/5 text-[#C0132A]">
                  <Medal size={10} /> Slow Club Member
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#1A1A1A]/60 border border-[#E8E4E0] hover:border-[#C0132A] hover:text-[#C0132A] transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
            { label: 'Total Spent', value: `₹${orders.reduce((s: number, o: any) => s + (o.total || o.amount || 0), 0).toLocaleString('en-IN')}`, icon: Star },
            { label: 'Wishlist', value: wishedProducts.length, icon: Heart },
            { label: 'Addresses', value: addresses.length, icon: MapPin },
          ].map((stat) => (
            <div key={stat.label} className="border border-[#E8E4E0] p-4">
              <stat.icon size={16} className="text-[#C0132A] mb-2" />
              <p className="font-bebas text-2xl tracking-wider text-[#1A1A1A]">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#E8E4E0] mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-medium uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#C0132A] border-[#C0132A]'
                  : 'text-[#1A1A1A]/40 border-transparent hover:text-[#1A1A1A]/70'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                  activeTab === tab.id ? 'bg-[#C0132A] text-white' : 'bg-[#E8E4E0] text-[#1A1A1A]/50'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs text-[#1A1A1A]/40">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState icon={Package} title="No orders yet" description="Start shopping to see your orders here" action={() => navigate('/collections')} actionLabel="Browse Collection" />
                ) : (
                  orders.map((order: any, i: number) => {
                    const status = order.status || 'processing';
                    const config = statusConfig[status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border border-[#E8E4E0] overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-[#F9F7F5]/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: config.bg }}>
                              <StatusIcon size={16} style={{ color: config.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1A1A1A]">{order.order_id || order.id}</p>
                              <p className="text-xs text-[#1A1A1A]/40">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#1A1A1A]">₹{(order.total || order.amount || 0).toLocaleString('en-IN')}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.color }}>
                                {config.label}
                              </span>
                            </div>
                            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                              <ChevronRight size={16} className="text-[#1A1A1A]/30" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Expandable Order Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#E8E4E0] bg-[#F9F7F5]/30 overflow-hidden"
                            >
                              <div className="p-4 space-y-4">
                                {order.tracking_number && (
                                  <div className="flex items-center justify-between p-3 bg-white border border-[#E8E4E0] rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <Truck size={14} className="text-[#C0132A]" />
                                      <span className="text-xs font-medium text-[#1A1A1A]">Tracking: {order.tracking_number}</span>
                                    </div>
                                    {order.courier && (
                                      <span className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider">via {order.courier}</span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">Items</h4>
                                  {(order.items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-[#1A1A1A]/80">{item.name || item.product_name} <span className="text-[#1A1A1A]/40 text-xs">x{item.quantity || item.qty || 1}</span></span>
                                      <span className="font-medium text-[#1A1A1A]">₹{(item.price || item.unit_price || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyState icon={MapPin} title="No saved addresses" description="Add your first address at checkout" action={() => navigate('/checkout/address')} actionLabel="Add Address" />
                  </div>
                ) : (
                  addresses.map((addr, i) => (
                    <motion.div
                      key={addr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-[#E8E4E0] p-5 relative group"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-[#C0132A] bg-[#C0132A]/5 px-2 py-0.5">
                          Default
                        </span>
                      )}
                      <p className="text-sm font-medium text-[#1A1A1A] mb-1">{addr.fullName}</p>
                      <p className="text-xs text-[#1A1A1A]/50 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.city}, {addr.state} {addr.pincode}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/40 mt-2">{addr.phone}</p>
                      <button className="mt-3 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/40 hover:text-[#C0132A] transition-colors opacity-0 group-hover:opacity-100">
                        <Edit size={10} /> Edit
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              wishedProducts.length === 0 ? (
                <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love by tapping the heart icon" action={() => navigate('/collections')} actionLabel="Browse Collection" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishedProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { navigate(`/product/${generateSlug(product.name)}`); window.scrollTo(0, 0); }}
                      className="cursor-pointer group border border-[#E8E4E0] overflow-hidden"
                    >
                      <div className="aspect-square bg-[#F9F7F5] overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover p-[6%] group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                        <ProductPrice
                          price={product.price}
                          compareAtPrice={product.originalPrice}
                          className="gap-1.5"
                          priceClassName="text-xs text-[#1A1A1A]/70"
                          compareClassName="text-[11px] text-[#888880] line-through"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="max-w-lg space-y-6">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/50">Full Name</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="mt-1 w-full px-4 py-3 border border-[#E8E4E0] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C0132A] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/50">Email</label>
                  <input type="email" defaultValue={user?.email || ''} disabled className="mt-1 w-full px-4 py-3 border border-[#E8E4E0] text-sm text-[#1A1A1A]/40 bg-[#F9F7F5] cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/50">Phone Number</label>
                  <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full px-4 py-3 border border-[#E8E4E0] text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/20 focus:outline-none focus:border-[#C0132A] transition-colors" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await supabase.from('profiles').upsert({
                          email: user?.email,
                          full_name: profileName,
                          phone: profilePhone,
                        }, { onConflict: 'email' });
                      } catch { /* table may not exist yet */ }
                      setSaving(false);
                    }}
                    disabled={saving}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#C0132A] text-white hover:bg-[#a81024] transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      signOut();
                      navigate('/');
                    }
                  }}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action, actionLabel }: {
  icon: React.ElementType; title: string; description: string; action?: () => void; actionLabel?: string;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-[#F9F7F5] flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-[#1A1A1A]/30" />
      </div>
      <h3 className="font-bebas text-xl tracking-wider text-[#1A1A1A] mb-1">{title}</h3>
      <p className="text-xs text-[#1A1A1A]/40 max-w-xs mx-auto">{description}</p>
      {action && actionLabel && (
        <button onClick={action}
          className="mt-6 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#C0132A] text-white hover:bg-[#a81024] transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
