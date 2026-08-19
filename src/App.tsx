import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { trackPageView } from '@/lib/analytics';
import { trackCustomerEvent } from '@/lib/customerAnalytics';

// Sections — kept eager (above-the-fold on home page)
import Header from '@/sections/Header';
import Hero from '@/sections/Hero';

import ProductsSection from '@/sections/Products';
import Shirts from '@/sections/Shirts';
import Values from '@/sections/Values';
import About from '@/sections/About';
import CTA from '@/sections/CTA';
import Newsletter from '@/sections/Newsletter';
import Footer from '@/sections/Footer';

// Components — kept eager (always visible)
import CustomCursor from '@/components/CustomCursor';
import Loader from '@/components/Loader';
import TornEdge from '@/components/TornEdge';

import ToastContainer from '@/components/Toast';
import SEOHead from '@/components/SEOHead';
import { useProducts } from '@/hooks/useProducts';


// ─── Lazy-loaded Pages (code-split) ───────────────────────────
const Collections = lazy(() => import('@/pages/Collections'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Address = lazy(() => import('@/pages/Address'));
const Payment = lazy(() => import('@/pages/Payment'));
const Success = lazy(() => import('@/pages/Success'));
const Profile = lazy(() => import('@/pages/Profile'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Contact = lazy(() => import('@/pages/Contact'));
const Lookbook = lazy(() => import('@/pages/Lookbook'));
const ShippingPolicy = lazy(() => import('@/pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('@/pages/ReturnPolicy'));
const BlogList = lazy(() => import('@/pages/BlogList'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin — lazy loaded (huge bundle: recharts, 10 sub-pages)
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));

// New CMS Dashboard
const DashboardLayout = lazy(() => import('@/pages/dashboard/DashboardLayout'));

// Minimal loading fallback for lazy routes
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signingIn, authError, signInWithGoogle, clearAuthError } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C0132A]/10 to-[#C0132A]/5 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#C0132A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="font-bebas text-4xl md:text-5xl tracking-wider text-primary mb-2">MEMBER ACCESS</h2>
          <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Sign in to access your cart, manage orders, and enjoy a personalized experience.
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 max-w-sm w-full text-xs"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="flex-1">{authError}</span>
              <button onClick={clearAuthError} className="ml-2 hover:text-red-900 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign In Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={signInWithGoogle}
          disabled={signingIn}
          className="group relative flex items-center gap-3 bg-white text-[#1A1A1A] pl-4 pr-6 py-3.5 border border-[#E8E4E0] hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300 uppercase tracking-[0.15em] text-xs font-bold disabled:opacity-60 disabled:cursor-wait"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {signingIn ? (
            <div className="w-5 h-5 border-2 border-[#C0132A] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {signingIn ? 'Connecting...' : 'Continue with Google'}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C0132A] group-hover:w-full transition-all duration-500" />
        </motion.button>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mt-2"
        >
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secure
          </span>
          <span className="w-px h-3 bg-[#E8E4E0]" />
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Private
          </span>
          <span className="w-px h-3 bg-[#E8E4E0]" />
          <span>One‑tap login</span>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

// Layout for storefront pages (with header and footer)
function StorefrontLayout({ children, minimal = false, showFooter = true, noPadding = false }: { children: React.ReactNode; minimal?: boolean; showFooter?: boolean; noPadding?: boolean }) {
  return (
    <>
      <Header minimal={minimal} />
      <main className={noPadding ? "" : "pt-[76px]"}>
        {children}
      </main>
      {showFooter && (
        <div className="relative">
          <TornEdge fill="#000000" position="top" shadow={true} />
          <Footer />
        </div>
      )}
    </>
  );
}

function HomeView() {
  return (
    <div className="flex flex-col">
      <SEOHead
        title=""
        description="MOVEMENT. not merch. Slugsera is an Indian slow-fashion streetwear brand for oversized T-shirts, printed shirts and hoodies. Shop online in Delhi, Noida, Gurugram and across India."
        keywords={['streetwear Delhi', 'streetwear Noida', 'streetwear Gurugram', 'oversized t-shirts Delhi NCR', 'Indian slow fashion brand']}
        url="/"
      />
      <Hero />
      <div className="relative">
        <TornEdge fill="#ffffff" position="top" shadow={true} />
        <ProductsSection />
      </div>

      <div className="relative">
        <TornEdge fill="#F9F7F5" position="top" shadow={true} />
        <Values />
      </div>
      <div className="relative">
        <TornEdge fill="#1A1A1A" position="top" shadow={true} />
        <Shirts />
      </div>
      <div className="relative">
        <TornEdge fill="#ffffff" position="top" shadow={true} />
        <About />
      </div>
      <div className="relative">
        <TornEdge fill="#C0132A" position="top" shadow={true} />
        <CTA />
      </div>
      <div className="relative">
        <TornEdge fill="#ffffff" position="top" shadow={true} />
        <Newsletter />
      </div>
    </div>
  );
}

// Admin route guard — only whitelisted emails can access admin panels
const ADMIN_EMAILS = ['slugsera@gmail.com', 'igauravvvv@gmail.com'];

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, signInWithGoogle, signingIn } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 bg-[#F6F6F4]" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
        <div className="w-16 h-16 rounded-full bg-[#C0132A]/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#C0132A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="font-bebas text-3xl tracking-wider text-[#1A1A1A]">ADMIN ACCESS REQUIRED</h2>
        <p className="text-sm text-[#888880] text-center max-w-sm mb-4">You must be signed in with an authorized admin account to access this area.</p>
        
        <button
          onClick={signInWithGoogle}
          disabled={signingIn}
          className="group relative flex items-center gap-3 bg-white text-[#1A1A1A] pl-4 pr-6 py-3.5 border border-[#E8E4E0] hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300 uppercase tracking-[0.15em] text-xs font-bold disabled:opacity-60"
        >
          {signingIn ? 'Connecting...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 bg-[#F6F6F4]" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#C0132A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-bebas text-3xl tracking-wider text-[#1A1A1A]">ACCESS DENIED</h2>
        <p className="text-sm text-[#888880] text-center max-w-sm mb-4">
          Your account <strong>{user.email}</strong> does not have admin privileges.
        </p>
        
        <button
          onClick={signOut}
          className="bg-[#C0132A] text-white px-6 py-3 uppercase tracking-[0.15em] text-xs font-bold hover:bg-[#9C0E21] transition-colors"
        >
          Sign Out / Switch Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  const { data: dbProducts } = useProducts();
  const setProducts = useStore(s => s.setProducts);

  useEffect(() => {
    if (dbProducts && dbProducts.length > 0) {
      setProducts(dbProducts);
    }
  }, [dbProducts, setProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname, document.title);
    void trackCustomerEvent('page_view', { properties: { path: location.pathname } });
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdmin = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.startsWith('/dashboard');

  // /admin/* redirects to unified /dashboard/*
  if (isAdmin) {
    const redirectPath = location.pathname.replace(/^\/admin/, '/dashboard') || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Unified dashboard — all admin + CMS features in one place
  if (isDashboard) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminRoute>
          <DashboardLayout />
        </AdminRoute>
      </Suspense>
    );
  }

  return (
    <>
      <Loader isLoading={isLoading} />
      <CustomCursor />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <Suspense fallback={<PageLoader />}>
            <Routes location={location}>
              {/* Home */}
              <Route path="/" element={
                <StorefrontLayout minimal={false} noPadding={true}>
                  <HomeView />
                </StorefrontLayout>
              } />

              {/* Collections */}
              <Route path="/collections" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Shop All Collections" description="Browse premium oversized T-shirts, printed shirts and hoodies from Slug's Era. Streetwear for Delhi NCR and delivery across India." keywords={['streetwear Delhi NCR', 'oversized t-shirts India', 'printed shirts India', 'hoodies India']} url="/collections" />
                  <Collections />
                </StorefrontLayout>
              } />
              <Route path="/collections/:category" element={
                <StorefrontLayout minimal showFooter>
                  <Collections />
                </StorefrontLayout>
              } />

              {/* Product Detail */}
              <Route path="/product/:slug" element={
                <StorefrontLayout minimal showFooter>
                  <ProductDetail />
                </StorefrontLayout>
              } />

              {/* Cart */}
              <Route path="/cart" element={
                <StorefrontLayout minimal showFooter={false}>
                  <ProtectedRoute>
                    <SEOHead title="Shopping Bag" noindex url="/cart" />
                    <Cart />
                  </ProtectedRoute>
                </StorefrontLayout>
              } />

              {/* Checkout */}
              <Route path="/checkout/address" element={
                <StorefrontLayout minimal showFooter={false}>
                  <ProtectedRoute>
                    <SEOHead title="Shipping Address" noindex url="/checkout/address" />
                    <Address />
                  </ProtectedRoute>
                </StorefrontLayout>
              } />
              <Route path="/checkout/payment" element={
                <StorefrontLayout minimal showFooter={false}>
                  <ProtectedRoute>
                    <SEOHead title="Payment" noindex url="/checkout/payment" />
                    <Payment />
                  </ProtectedRoute>
                </StorefrontLayout>
              } />
              <Route path="/order-success" element={
                <StorefrontLayout minimal showFooter={false}>
                  <ProtectedRoute>
                    <SEOHead title="Order Confirmed" noindex url="/order-success" />
                    <Success />
                  </ProtectedRoute>
                </StorefrontLayout>
              } />

              {/* Profile */}
              <Route path="/profile" element={
                <StorefrontLayout minimal showFooter={false}>
                  <ProtectedRoute>
                    <SEOHead title="My Account" noindex url="/profile" />
                    <Profile />
                  </ProtectedRoute>
                </StorefrontLayout>
              } />

              {/* Info Pages */}
              <Route path="/about" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Our Story" description="Meet Slug's Era, an Indian slow-fashion streetwear movement built around premium quality, thoughtful design and intentional living." keywords={['Slugsera story', 'Indian slow fashion brand', 'streetwear brand Delhi NCR']} url="/about" />
                  <AboutPage />
                </StorefrontLayout>
              } />
              <Route path="/faq" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Frequently Asked Questions" description="Find answers about Slug's Era sizing, shipping, returns and orders for our oversized streetwear clothing." keywords={['Slugsera size guide', 'streetwear shipping India', 't-shirt exchange policy']} url="/faq" />
                  <FAQ />
                </StorefrontLayout>
              } />
              <Route path="/contact" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Contact Us" description="Contact Slug's Era for help with orders, sizing or our premium streetwear collection. We support customers in Delhi NCR and across India." keywords={['contact Slugsera', 'streetwear customer support Delhi NCR', 'Slugsera WhatsApp']} url="/contact" />
                  <Contact />
                </StorefrontLayout>
              } />
              <Route path="/lookbook" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Streetwear Lookbook" description="Explore Slug's Era streetwear looks and outfit ideas featuring oversized tees, printed shirts and heavyweight hoodies." keywords={['streetwear lookbook India', 'oversized t-shirt outfits', 'Delhi NCR streetwear style']} url="/lookbook" />
                  <Lookbook />
                </StorefrontLayout>
              } />
              <Route path="/shipping-policy" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Shipping Policy" description="Read Slug's Era shipping information, delivery timelines and order tracking details for customers across India." keywords={['Slugsera shipping policy', 'streetwear delivery India', 'Delhi NCR clothing delivery']} url="/shipping-policy" />
                  <ShippingPolicy />
                </StorefrontLayout>
              } />
              <Route path="/return-policy" element={
                <StorefrontLayout minimal showFooter>
                  <SEOHead title="Return & Exchange Policy" description="Read the Slug's Era return and exchange policy for eligible streetwear orders, sizing issues and product concerns." keywords={['Slugsera return policy', 't-shirt exchange India', 'streetwear returns']} url="/return-policy" />
                  <ReturnPolicy />
                </StorefrontLayout>
              } />

              {/* Blog */}
              <Route path="/blog" element={
                <StorefrontLayout minimal showFooter>
                  <BlogList />
                </StorefrontLayout>
              } />
              <Route path="/blog/:slug" element={
                <StorefrontLayout minimal showFooter>
                  <BlogPost />
                </StorefrontLayout>
              } />

              {/* 404 */}
              <Route path="*" element={
                <StorefrontLayout minimal showFooter>
                  <NotFound />
                </StorefrontLayout>
              } />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

export default App;

