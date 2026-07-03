import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addToCart } = useStore();
  const { user, signInWithGoogle } = useAuth();

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!selectedSize) return;

    addToCart(product, selectedSize, selectedColor || product.colors[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
          style={{ borderRadius: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-black hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>

          {/* Image Section */}
          <div className="md:w-1/2 relative bg-[#F9F7F5] flex-shrink-0">
            <div className="aspect-[3/4] md:h-full relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentImageIndex ? 'bg-[#C0132A] w-4' : 'bg-black/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-[#C0132A] text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-[0.15em]">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
            <div className="flex-1">
              {/* Category */}
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#C0132A] mb-2">
                {product.category === 'tshirts' ? 'T-Shirts' : product.category === 'hoodies' ? 'Hoodies' : 'Shirts'}
              </p>

              {/* Title */}
              <h2 className="font-bebas text-3xl md:text-4xl tracking-wider text-[#1A1A1A] mb-1">
                {product.name}
              </h2>

              {/* Slogan */}
              <p className="font-display text-sm italic text-[#1A1A1A]/50 mb-4">"{product.slogan}"</p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-[#1A1A1A]">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-[#1A1A1A]/40 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-[#C0132A] bg-[#C0132A]/5 px-2 py-0.5">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A]/60 mb-2">
                    Color {selectedColor && `— ${selectedColor}`}
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          selectedColor === color ? 'border-[#C0132A] scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ background: color, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A]/60">
                    Size {selectedSize && `— ${selectedSize}`}
                  </p>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] text-[#C0132A] underline underline-offset-2 font-medium"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 px-3 flex items-center justify-center text-xs font-medium uppercase tracking-wider border transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-[#1A1A1A] border-[#E8E4E0] hover:border-[#1A1A1A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[10px] text-[#C0132A] mt-1.5 font-medium">Please select a size</p>
                )}
              </div>

              {/* Description Excerpt */}
              <p className="text-xs text-[#1A1A1A]/60 leading-relaxed mb-4 line-clamp-3">
                {product.description}
              </p>

              {/* Features */}
              {product.features.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
                  {product.features.slice(0, 4).map((feature) => (
                    <span key={feature} className="text-[10px] text-[#1A1A1A]/50 flex items-center gap-1">
                      <Check size={10} className="text-[#C0132A]" /> {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto pt-4 border-t border-[#E8E4E0]">
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : selectedSize
                      ? 'bg-[#C0132A] text-white hover:bg-[#a81024]'
                      : 'bg-[#E8E4E0] text-[#1A1A1A]/40 cursor-not-allowed'
                }`}
                whileTap={selectedSize ? { scale: 0.97 } : {}}
              >
                {addedToCart ? (
                  <><Check size={16} /> Added!</>
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart</>
                )}
              </motion.button>

              <motion.button
                className="w-12 h-12 flex items-center justify-center border border-[#E8E4E0] text-[#1A1A1A]/60 hover:border-[#C0132A] hover:text-[#C0132A] transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Size Guide Modal (placed outside the main QuickView card but inside AnimatePresence) */}
      {showSizeGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { e.stopPropagation(); setShowSizeGuide(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white p-2 md:p-4 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors z-20"
            >
              <X size={16} />
            </button>
            <img src="/images/Size_guide.webp" alt="Size Guide" className="w-full h-auto rounded-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
