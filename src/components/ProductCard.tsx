import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useStore } from '@/store';
import type { Product } from '@/types';
import { generateSlug } from '@/types';
import { ShoppingBag, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
  customVariants?: any;
}

export default function ProductCard({ product, index = 0, onQuickView, customVariants }: ProductCardProps) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);

  // Use the product's actual images array; fall back to just the primary image
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToProduct = () => {
    navigate(`/product/${generateSlug(product.name)}`);
  };


  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    });

    // Show feedback
    const btn = e.currentTarget as HTMLButtonElement;
    const originalText = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.style.background = '#1A1A1A';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 1400);
  };

  // 3D Tilt Effect
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useMotionTemplate`${useMotionValue(mouseY.get() * -6)}deg`;
  const rotateY = useMotionTemplate`${useMotionValue(mouseX.get() * 6)}deg`;

  const defaultVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={customVariants || defaultVariants}
      initial={customVariants ? "hidden" : "hidden"}
      whileInView={customVariants ? "visible" : "visible"}
      viewport={{ once: true, margin: '-20px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="product-card group relative"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div 
        className="w-full h-full"
        style={{
          rotateX: useMotionTemplate`${useMotionValue(0)}`, // We need to update this dynamically but hooks in style is tricky. Let's use motion values properly below.
        }}
        animate={{
          rotateX: mouseY.get() * -8,
          rotateY: mouseX.get() * 8,
          boxShadow: mouseX.get() === 0 ? "0px 10px 30px rgba(0,0,0,0)" : "0px 15px 35px rgba(0,0,0,0.06)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="image-wrapper group/slider relative overflow-hidden rounded-md cursor-pointer" style={{ willChange: 'transform' }}>
        {product.badge && (
          <span className={`badge ${product.badge === 'New' ? 'badge-dark' : ''} z-[25]`}>
            {product.badge}
          </span>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={imageIndex}
            src={images[imageIndex]}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 ${
              product.status === 'coming_soon' ? 'filter grayscale-[30%] blur-[6px]' : ''
            }`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.2 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.8, ease: 'easeOut' },
            }}
          />
        </AnimatePresence>

        {/* Mirror Glass Overlay for Coming Soon */}
        {product.status === 'coming_soon' && (
          <div className="absolute inset-0 z-10 bg-white/20 backdrop-blur-[2px] pointer-events-none" />
        )}

        {/* Clickable overlay for navigation - sits below buttons */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={goToProduct}
        />

        {/* Navigation Arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button 
              type="button"
              aria-label="Previous product image"
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-30 hover:bg-white text-black drop-shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              type="button"
              aria-label="Next product image"
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-30 hover:bg-white text-black drop-shadow-md"
            >
              <ChevronRight size={18} />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {images.map((_, i) => (
                <span 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="quick-add z-[25] flex gap-2">
          <button
            className="quick-add-btn flex items-center gap-2"
            onClick={handleQuickAdd}
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
          {onQuickView && (
            <button
              className="w-9 h-9 flex items-center justify-center bg-white text-[#1A1A1A] hover:bg-[#C0132A] hover:text-white transition-all duration-200"
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="pt-3 lg:pt-4 px-1 lg:px-0.5 text-center lg:text-left cursor-pointer" onClick={goToProduct}>
        <h3 className="font-display text-[15px] lg:text-[21px] font-bold lg:font-normal text-[#1A1A1A] mb-0.5 lg:mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="font-display text-[12px] lg:text-[13px] italic font-light text-[#888880] mb-1.5 lg:mb-2.5 line-clamp-1 leading-tight">
          {product.slogan}
        </p>
        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-1 lg:gap-0">
          <span className="text-[14px] lg:text-[15px] font-bold lg:font-medium text-[#1A1A1A]">
            {product.status === 'coming_soon' ? 'Coming Soon' : `₹${product.price.toLocaleString()}`}
          </span>
          <div className="flex gap-1.5 hidden lg:flex">
            {product.colors.slice(0, 3).map((color, i) => (
              <button
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-[#E8E4E0] cursor-pointer transition-transform duration-200 hover:scale-130"
                style={{ backgroundColor: color }}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
