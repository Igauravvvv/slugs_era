import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import DashboardToasts from '@/components/dashboard/DashboardToasts';
import { PageSkeleton } from '@/components/dashboard/SkeletonLoader';
import LoginPage from './LoginPage';
import type { DashboardView } from '@/components/dashboard/Sidebar';
import '@/styles/dashboard.css';

// Lazy-loaded dashboard pages
const DashboardOverview = lazy(() => import('./DashboardOverview'));
const ProductList = lazy(() => import('./ProductList'));
const ProductForm = lazy(() => import('./ProductForm'));
const DropsManager = lazy(() => import('./DropsManager'));
const DropForm = lazy(() => import('./DropForm'));
const CategoriesManager = lazy(() => import('./CategoriesManager'));
const SiteEditor = lazy(() => import('./SiteEditor'));
const MediaLibrary = lazy(() => import('./MediaLibrary'));

// Pages imported from admin (merged into unified dashboard)
const OrdersPage = lazy(() => import('../admin/OrdersPage'));
const CustomersPage = lazy(() => import('../admin/CustomersPage'));
const AnalyticsPage = lazy(() => import('../admin/AnalyticsPage'));
const SettingsPage = lazy(() => import('../admin/SettingsPage'));

function DashboardPageLoader() {
  return (
    <div className="p-4 lg:p-6">
      <PageSkeleton />
    </div>
  );
}

/** Maps URL pathname to the DashboardView used by the sidebar highlight. */
function getActiveView(pathname: string): DashboardView {
  if (pathname.startsWith('/dashboard/products/new')) return 'products-new';
  if (pathname.match(/\/dashboard\/products\/[^/]+\/edit/)) return 'products-edit';
  if (pathname.startsWith('/dashboard/products')) return 'products';
  if (pathname.startsWith('/dashboard/drops/new')) return 'drops-new';
  if (pathname.match(/\/dashboard\/drops\/[^/]+\/edit/)) return 'drops-new';
  if (pathname.startsWith('/dashboard/drops')) return 'drops';
  if (pathname.startsWith('/dashboard/categories')) return 'categories';
  if (pathname.startsWith('/dashboard/orders')) return 'orders';
  if (pathname.startsWith('/dashboard/customers')) return 'customers';
  if (pathname.startsWith('/dashboard/analytics')) return 'analytics';
  if (pathname.startsWith('/dashboard/site-editor')) return 'site-editor';
  if (pathname.startsWith('/dashboard/media')) return 'media';
  if (pathname.startsWith('/dashboard/settings')) return 'settings';
  return 'overview';
}

/** Maps a DashboardView to its URL path. */
function viewToPath(view: DashboardView): string {
  switch (view) {
    case 'overview': return '/dashboard';
    case 'products': return '/dashboard/products';
    case 'products-new': return '/dashboard/products/new';
    case 'products-edit': return '/dashboard/products'; // fallback — actual edit uses /products/:id/edit
    case 'drops': return '/dashboard/drops';
    case 'drops-new': return '/dashboard/drops/new';
    case 'categories': return '/dashboard/categories';
    case 'orders': return '/dashboard/orders';
    case 'customers': return '/dashboard/customers';
    case 'analytics': return '/dashboard/analytics';
    case 'site-editor': return '/dashboard/site-editor';
    case 'media': return '/dashboard/media';
    case 'settings': return '/dashboard/settings';
    default: return '/dashboard';
  }
}

export default function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const activeView = getActiveView(location.pathname);

  // If auth is loading, show a minimal spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#C8A96E] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  const handleNavigate = (view: DashboardView) => {
    setSearchQuery('');
    navigate(viewToPath(view));
  };

  const handleEditProduct = (id: string) => {
    navigate(`/dashboard/products/${id}/edit`);
  };

  const handleEditDrop = (id: string) => {
    navigate(`/dashboard/drops/${id}/edit`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="cms-dashboard flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
        onGoToStore={() => navigate('/')}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          activeView={activeView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userEmail={user.email || ''}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onSearch={setSearchQuery}
        />

        {/* Page content — Nested Routes */}
        <main className="cms-main flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-4 lg:p-6"
            >
              <Suspense fallback={<DashboardPageLoader />}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardOverview onNavigate={handleNavigate} />} />
                  <Route path="/dashboard/products" element={
                    <ProductList
                      onAddNew={() => navigate('/dashboard/products/new')}
                      onEdit={handleEditProduct}
                      searchQuery={searchQuery}
                    />
                  } />
                  <Route path="/dashboard/products/new" element={
                    <ProductForm
                      onBack={() => navigate('/dashboard/products')}
                      onSaved={() => navigate('/dashboard/products')}
                    />
                  } />
                  <Route path="/dashboard/products/:id/edit" element={
                    <DashboardProductEditRoute
                      onBack={() => navigate('/dashboard/products')}
                      onSaved={() => navigate('/dashboard/products')}
                    />
                  } />
                  <Route path="/dashboard/drops" element={
                    <DropsManager
                      onAddNew={() => navigate('/dashboard/drops/new')}
                      onEdit={handleEditDrop}
                    />
                  } />
                  <Route path="/dashboard/drops/new" element={
                    <DropForm
                      onBack={() => navigate('/dashboard/drops')}
                      onSaved={() => navigate('/dashboard/drops')}
                    />
                  } />
                  <Route path="/dashboard/drops/:id/edit" element={
                    <DashboardDropEditRoute
                      onBack={() => navigate('/dashboard/drops')}
                      onSaved={() => navigate('/dashboard/drops')}
                    />
                  } />
                  <Route path="/dashboard/categories" element={<CategoriesManager />} />
                  <Route path="/dashboard/orders" element={<OrdersPage />} />
                  <Route path="/dashboard/customers" element={<CustomersPage />} />
                  <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
                  <Route path="/dashboard/site-editor" element={<SiteEditor />} />
                  <Route path="/dashboard/media" element={<MediaLibrary />} />
                  <Route path="/dashboard/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast notifications */}
      <DashboardToasts />
    </div>
  );
}

/** Route wrapper to extract :id param for product editing. */
function DashboardProductEditRoute({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const { id } = useParams<{ id: string }>();
  return (
    <ProductForm
      productId={id || undefined}
      onBack={onBack}
      onSaved={onSaved}
    />
  );
}

/** Route wrapper to extract :id param for drop editing. */
function DashboardDropEditRoute({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const { id } = useParams<{ id: string }>();
  return (
    <DropForm
      dropId={id || undefined}
      onBack={onBack}
      onSaved={onSaved}
    />
  );
}
