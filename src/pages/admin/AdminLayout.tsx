import { lazy, Suspense } from 'react';
import { useState } from 'react';
import {
  Home, Package, Receipt, Users, BarChart3,
  Globe, Settings, Menu, X, ChevronLeft, LogOut,
} from 'lucide-react';
import { useNavigate, useLocation, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Lazy-loaded pages
const Overview = lazy(() => import('./Overview'));
const ProductsPage = lazy(() => import('./ProductsPage'));
const ProductEdit = lazy(() => import('./ProductEdit'));
const OrdersPage = lazy(() => import('./OrdersPage'));
const CustomersPage = lazy(() => import('./CustomersPage'));
const AnalyticsPage = lazy(() => import('./AnalyticsPage'));
const SiteOverviewPage = lazy(() => import('./SiteOverviewPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

type AdminSection = 'overview' | 'products' | 'orders' | 'customers' | 'analytics' | 'site-overview' | 'settings';

const navItems: { id: AdminSection; path: string; label: string; icon: React.ElementType }[] = [
  { id: 'overview', path: '/admin', label: 'Overview', icon: Home },
  { id: 'products', path: '/admin/products', label: 'Products', icon: Package },
  { id: 'orders', path: '/admin/orders', label: 'Orders', icon: Receipt },
  { id: 'customers', path: '/admin/customers', label: 'Customers', icon: Users },
  { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'site-overview', path: '/admin/site-overview', label: 'Site Overview', icon: Globe },
];

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Resolves which nav section is "active" based on the current URL path. */
function getActiveSection(pathname: string): AdminSection {
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/orders')) return 'orders';
  if (pathname.startsWith('/admin/customers')) return 'customers';
  if (pathname.startsWith('/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/site-overview')) return 'site-overview';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'overview';
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = getActiveSection(location.pathname);

  // Wrapper for Overview's onNavigate callback — maps old view names to URL paths
  const handleOverviewNavigate = (view: string) => {
    const mapping: Record<string, string> = {
      'overview': '/admin',
      'products': '/admin/products',
      'product-edit': '/admin/products/new',
      'orders': '/admin/orders',
      'customers': '/admin/customers',
      'analytics': '/admin/analytics',
      'site-overview': '/admin/site-overview',
      'settings': '/admin/settings',
    };
    navigate(mapping[view] || '/admin');
  };

  const goToProductEdit = (id: string | 'new') => {
    navigate(id === 'new' ? '/admin/products/new' : `/admin/products/${id}/edit`);
  };

  const goBackToProducts = () => {
    navigate('/admin/products');
  };

  const isProductEditPage = location.pathname.includes('/products/') && (location.pathname.endsWith('/edit') || location.pathname.endsWith('/new'));

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F6F4]" style={{ fontFamily: "'Trap', Arial, sans-serif" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: 220, background: '#111111' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-[60px] border-b border-white/[0.08]">
          <div className="w-2 h-2 rounded-full bg-[#C0392B]" />
          <span className="text-white font-semibold text-[15px] tracking-wide">Slugsera</span>
          <button className="lg:hidden ml-auto p-1" onClick={() => setMobileOpen(false)}>
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative ${
                  isActive
                    ? 'bg-[#1E1E1E] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-[#C0392B]" />
                )}
                <item.icon size={18} strokeWidth={1.8} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] p-2 space-y-0.5">
          <button
            onClick={() => { navigate('/admin/settings'); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative ${
              activeSection === 'settings'
                ? 'bg-[#1E1E1E] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            {activeSection === 'settings' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-[#C0392B]" />
            )}
            <Settings size={18} strokeWidth={1.8} />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className="font-medium">Back to Store</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-[60px] flex items-center justify-between px-4 lg:px-8 bg-white border-b border-[#E5E5E5] shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
              <Menu size={20} className="text-[#1A1A1A]" />
            </button>
            {isProductEditPage && (
              <button
                onClick={goBackToProducts}
                className="flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Products</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C0392B] flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page Content — Nested Routes */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/admin" element={<Overview onNavigate={handleOverviewNavigate} />} />
                <Route path="/admin/products" element={<ProductsPage onEditProduct={goToProductEdit} />} />
                <Route path="/admin/products/new" element={<ProductEdit productId={null} onBack={goBackToProducts} />} />
                <Route path="/admin/products/:id/edit" element={<AdminProductEditRoute onBack={goBackToProducts} />} />
                <Route path="/admin/orders" element={<OrdersPage />} />
                <Route path="/admin/customers" element={<CustomersPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/site-overview" element={<SiteOverviewPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Tiny route wrapper that pulls the :id param and passes it to ProductEdit. */
function AdminProductEditRoute({ onBack }: { onBack: () => void }) {
  const { id } = useParams<{ id: string }>();
  return <ProductEdit productId={id || null} onBack={onBack} />;
}
