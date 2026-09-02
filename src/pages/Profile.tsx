import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store';
import {
  Package, Heart, MapPin, LogOut, ShoppingBag, Clock, CheckCircle,
  Truck, XCircle, ArrowLeft, Settings, Star, Medal, Edit, Sparkles,
  Headphones, ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/types';
import type { Product } from '@/types';
import type { Order } from '@/types/dashboard';
import ProductPrice from '@/components/ProductPrice';

type ProfileTab = 'orders' | 'addresses' | 'wishlist' | 'settings';

type DisplayItem = {
  productId?: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  image?: string;
};

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string; message: string }> = {
  pending: { color: '#b56a00', bg: '#fff5d6', icon: Clock, label: 'Order received', message: "We've got your order. Our small team is checking every detail before it moves forward." },
  confirmed: { color: '#2563eb', bg: '#e8f0ff', icon: CheckCircle, label: 'Confirmed', message: 'Everything is confirmed. Your pieces are being prepared with care.' },
  processing: { color: '#2563eb', bg: '#e8f0ff', icon: Package, label: 'Being prepared', message: 'Your pieces are in our hands now. We are packing them carefully for the journey to you.' },
  packed: { color: '#7c3aed', bg: '#f1eaff', icon: Package, label: 'Packed with care', message: 'Your order is packed, checked, and nearly ready to leave us.' },
  shipped: { color: '#7c3aed', bg: '#f1eaff', icon: Truck, label: 'On its way', message: 'Your order has left us and is making its way to you. We hope you love every piece.' },
  delivered: { color: '#087f5b', bg: '#e1f7ef', icon: CheckCircle, label: 'Delivered', message: 'It made it home. Thank you for choosing slower, more intentional fashion with us.' },
  cancelled: { color: '#c92a2a', bg: '#ffebeb', icon: XCircle, label: 'Cancelled', message: 'This order was cancelled. If something did not feel right, our team is here to help.' },
  returned: { color: '#c92a2a', bg: '#ffebeb', icon: XCircle, label: 'Returned', message: 'Your return is being looked after. We will keep you updated as it moves forward.' },
};

const normalise = (value: unknown) => String(value || '').trim().toLowerCase();

function resolveOrderItems(order: Order, products: Product[]): DisplayItem[] {
  const catalogueById = new Map(products.map((product) => [product.id, product]));
  const catalogueByName = new Map(products.map((product) => [normalise(product.name), product]));
  return (Array.isArray(order.items) ? order.items : []).map((item: any) => {
    const productId = item.productId || item.product_id;
    const name = item.name || item.product_name || 'Slugsera piece';
    const product = catalogueById.get(productId) || catalogueByName.get(normalise(name));
    return {
      productId,
      name,
      size: item.size,
      color: item.color,
      quantity: Number(item.qty ?? item.quantity ?? 1),
      price: Number(item.price ?? item.unit_price ?? 0),
      image: typeof item.image === 'string' && item.image ? item.image : product?.image,
    };
  });
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { addresses, wishlist, products } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab: ProfileTab = requestedTab === 'settings' || requestedTab === 'addresses' || requestedTab === 'wishlist' ? requestedTab : 'orders';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileName, setProfileName] = useState(String(user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''));
  const [profilePhone, setProfilePhone] = useState(String(user?.user_metadata?.phone || ''));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings' || tab === 'addresses' || tab === 'wishlist' || tab === 'orders') setActiveTab(tab);
  }, [searchParams]);

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === 'orders') setSearchParams({}, { replace: true });
    else setSearchParams({ tab }, { replace: true });
  };

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
        setOrders((data || []) as Order[]);
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
                order.id === payload.new.id ? payload.new as Order : order
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
                {(profileName || user?.email?.split('@')[0] || 'MEMBER').toUpperCase()}
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
              onClick={() => selectTab(tab.id)}
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
              <div className="space-y-5">
                {ordersLoading ? (
                  <div className="text-center py-16" role="status">
                    <div className="w-8 h-8 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs text-[#1A1A1A]/50">Gathering your order story…</p>
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState icon={Package} title="Your first piece is waiting" description="When you choose something from Slugsera, we’ll keep its full journey right here for you." action={() => navigate('/collections')} actionLabel="Explore the collection" />
                ) : (
                  orders.map((order, i) => {
                    const status = normalise(order.status) || 'processing';
                    const config = statusConfig[status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    const items = resolveOrderItems(order, products);
                    const isExpanded = expandedOrder === order.id;
                    const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase();
                    return (
                      <motion.article
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="overflow-hidden border border-[#E8E4E0] bg-white transition-colors hover:border-[#C0132A]/35"
                      >
                        <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                          <div className="bg-[#F9F7F5] p-3 sm:p-4">
                            <div className={`grid gap-2 ${items.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {items.slice(0, 4).map((item, itemIndex) => (
                                <div key={`${item.productId || item.name}-${itemIndex}`} className="relative aspect-square overflow-hidden bg-white">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
                                  ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-[#1A1A1A]/35">
                                      <Package size={30} strokeWidth={1.3} />
                                      <span className="text-[9px] font-medium uppercase tracking-[0.14em]">{item.name}</span>
                                    </div>
                                  )}
                                  {items.length > 4 && itemIndex === 3 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-medium text-white">+{items.length - 4} more</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col p-5 sm:p-7">
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#1A1A1A]/45">Order {orderNumber}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: config.bg, color: config.color }}>
                                  <StatusIcon size={13} /> {config.label}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-[#1A1A1A]">₹{Number(order.total || 0).toLocaleString('en-IN')}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#1A1A1A]/40">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="mb-5 border-l-2 border-[#C0132A] pl-4">
                              <div className="mb-1 flex items-center gap-2 text-[#C0132A]">
                                <Sparkles size={14} />
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em]">A note from us</p>
                              </div>
                              <p className="font-serif text-[17px] leading-relaxed text-[#1A1A1A]/75">{config.message}</p>
                            </div>

                            <div className="space-y-3">
                              {items.slice(0, isExpanded ? items.length : 2).map((item, itemIndex) => (
                                <div key={`${item.name}-detail-${itemIndex}`} className="flex items-center justify-between gap-4 border-b border-[#E8E4E0]/70 pb-3 text-xs">
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-[#1A1A1A]">{item.name}</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[#1A1A1A]/45">
                                      {[item.size && `Size ${item.size}`, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}
                                    </p>
                                  </div>
                                  <p className="shrink-0 font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                              ))}
                              {items.length > 2 && (
                                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C0132A]">
                                  {isExpanded ? 'Show less' : `View all ${items.length} pieces`}
                                  <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>

                            <div className="mt-auto pt-5">
                              {order.tracking_number ? (
                                <div className="flex items-center justify-between gap-3 bg-[#F9F7F5] p-3">
                                  <div className="flex items-center gap-3">
                                    <Truck size={16} className="text-[#C0132A]" />
                                    <div>
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/45">Tracking ID</p>
                                      <p className="mt-0.5 text-xs font-medium">{order.tracking_number}</p>
                                    </div>
                                  </div>
                                  {order.courier && <span className="text-[9px] font-bold uppercase tracking-wider text-[#C0132A]">{order.courier}</span>}
                                </div>
                              ) : status !== 'delivered' && status !== 'cancelled' ? (
                                <div className="flex items-center gap-2 bg-[#F9F7F5] p-3 text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                                  <Clock size={13} /> Tracking will appear here as soon as your order leaves us.
                                </div>
                              ) : null}

                              <button onClick={() => navigate('/contact')} className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#1A1A1A]/55 transition-colors hover:text-[#C0132A]">
                                <Headphones size={14} /> Need help with this order? We’re here.
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
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
                <div className="border-l-2 border-[#C0132A] pl-4">
                  <h2 className="font-serif text-2xl text-[#1A1A1A]">Make this space yours.</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#1A1A1A]/50">Keep your details current so we can make every delivery and update feel effortless.</p>
                </div>
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
                      setSaveMessage('');
                      try {
                        const { error: authError } = await supabase.auth.updateUser({
                          data: { full_name: profileName.trim(), phone: profilePhone.trim() },
                        });
                        if (authError) throw authError;

                        if (user?.id) {
                          const { error: profileError } = await supabase.from('users').update({
                            name: profileName.trim(),
                            phone: profilePhone.trim(),
                          }).eq('id', user.id);
                          if (profileError) console.warn('Profile table could not be updated:', profileError.message);
                        }
                        setSaveMessage('Saved — we’ll use these details to take better care of your orders.');
                      } catch (error) {
                        console.warn('Could not save profile:', error);
                        setSaveMessage('We could not save that just now. Please try once more.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#C0132A] text-white hover:bg-[#a81024] transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {saveMessage && <p className="text-xs leading-relaxed text-[#1A1A1A]/60" role="status">{saveMessage}</p>}
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
