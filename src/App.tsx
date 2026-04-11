import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
// import type { View } from '@/types';

// Sections
import Header from '@/sections/Header';
import Hero from '@/sections/Hero';
import Marquee from '@/sections/Marquee';
import Products from '@/sections/Products';
import Shirts from '@/sections/Shirts';
import Values from '@/sections/Values';
import About from '@/sections/About';

import CTA from '@/sections/CTA';
import Newsletter from '@/sections/Newsletter';
import Footer from '@/sections/Footer';

// Pages
import Collections from '@/pages/Collections';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Address from '@/pages/Address';
import Payment from '@/pages/Payment';
import Success from '@/pages/Success';

// Components
import CustomCursor from '@/components/CustomCursor';
import Loader from '@/components/Loader';
import TornEdge from '@/components/TornEdge';

function App() {
  const { currentView, setView } = useStore();
  const { user, loading, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (currentView !== 'home') {
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, setView]);

  const renderView = () => {
    // PROTECTED ROUTES
    const protectedViews = ['cart', 'address', 'payment', 'orders', 'profile'];
    if (protectedViews.includes(currentView) && !user && !loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <h2 className="font-bebas text-4xl tracking-wider text-primary">MEMBER ACCESS REQUIRED</h2>
          <p className="text-secondary text-sm max-w-md text-center">
            You must be signed in to The Slow Club to access your cart and checkout.
          </p>
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 bg-white text-black px-6 py-3 hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
            Sign in with Google
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'collections':
        return <Collections />;
      case 'product':
        return <ProductDetail />;
      case 'cart':
        return <Cart />;
      case 'address':
        return <Address />;
      case 'payment':
        return <Payment />;
      case 'success':
        return <Success />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <CustomCursor />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {currentView === 'home' && <Header />}
          {(currentView === 'collections' || currentView === 'product' || currentView === 'cart' || currentView === 'address' || currentView === 'payment') && <Header minimal />}

          <main ref={mainRef} className={currentView === 'home' ? 'pt-[76px]' : 'pt-[76px]'}>
            {renderView()}
          </main>

          {currentView === 'home' && (
            <div className="relative">
              <TornEdge fill="#000000" position="top" shadow={true} />
              <Footer />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function HomeView() {
  return (
    <div className="flex flex-col">
      <Hero />

      <div className="relative">
        <TornEdge fill="#ffffff" position="top" shadow={true} />
        <Products />
      </div>

      <div className="relative">
        <TornEdge fill="#1A1A1A" position="top" shadow={true} />
        <Shirts />
      </div>

      <div className="relative">
        <TornEdge fill="#C0132A" position="top" shadow={true} />
        <Marquee />
      </div>

      <div className="relative">
        <TornEdge fill="#F9F7F5" position="top" shadow={true} />
        <Values />
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

export default App;
