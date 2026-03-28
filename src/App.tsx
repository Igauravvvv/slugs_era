import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
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

function App() {
  const { currentView, setView } = useStore();
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

          {currentView === 'home' && <Footer />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function HomeView() {
  return (
    <>
      <Hero />
      <Products />
      <Shirts />
      <Marquee />
      <Values />
      <About />

      <CTA />
      <Newsletter />
    </>
  );
}

export default App;
