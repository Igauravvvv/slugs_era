import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useStore } from '@/store';
import type { Product } from '@/types';
import { generateSlug } from '@/types';
import { ShoppingBag, ChevronLeft, ChevronRight, Eye, LockKeyhole } from 'lucide-react';
import { trackCustomerEvent } from '@/lib/customerAnalytics';
import ProductPrice from '@/components/ProductPrice';
import { isVideoMedia, optimizedProductImageSrcSet, optimizedProductImageUrl, preloadProductImage } from '@/lib/cdn';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
  customVariants?: Variants;
}

export default function ProductCard({ product, index = 0, onQuickView, customVariants }: ProductCardProps) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const didSwipeImage = useRef(false);
  const lastArrowPointerAt = useRef(0);
  const isComingSoon = product.status === 'coming_soon';

  // Use the product's actual images array; fall back to just the primary image
  const images = useMemo(() => product.images && product.images.length > 0
    ? product.images
    : [product.image], [product.image, product.images]);
  const productUrl = `/product/${generateSlug(product.name)}`;

  useEffect(() => {
    if (images.length < 2) return;
    const nextIndex = imageIndex === images.length - 1 ? 0 : imageIndex + 1;
    const previousIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
    preloadProductImage(images[nextIndex], '(min-width: 1024px) 20vw, 50vw');
    if (previousIndex !== nextIndex) preloadProductImage(images[previousIndex], '(min-width: 1024px) 20vw, 50vw');
  }, [imageIndex, images]);

  const showPreviousImage = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    didSwipeImage.current = false;
    showPreviousImage();
  };

  const handleNextImage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    didSwipeImage.current = false;
    showNextImage();
  };

  const goToProduct = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(productUrl);
    void trackCustomerEvent('product_clicked', {
      productId: product.id,
      properties: { product_name: product.name, category: product.category, source: 'product_card' },
    });
  };

  const handleImagePointerStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isComingSoon || images.length < 2 || (event.target as HTMLElement).closest('button')) return;
    pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const handleImagePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId || isComingSoon || images.length < 2) return;
    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    if (Math.abs(distanceX) < 44 || Math.abs(distanceX) <= Math.abs(distanceY)) return;

    didSwipeImage.current = true;
    if (distanceX > 0) showPreviousImage();
    else showNextImage();
  };


  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    });
    void trackCustomerEvent('quick_add', {
      productId: product.id,
      properties: { product_name: product.name, size: product.sizes[0] || '', quantity: 1 },
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

  const defaultVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }
    }
  };

  return (
    <motion.article
      variants={customVariants || defaultVariants}
      initial={customVariants ? "hidden" : "hidden"}
      whileInView={customVariants ? "visible" : "visible"}
      viewport={{ once: true, margin: '-20px' }}
      className={`product-card group relative ${isComingSoon ? 'bg-white border border-[#E8E4E0] p-3' : ''}`}
    >
      <div className="w-full h-full">
        <div
          className="image-wrapper group/slider relative overflow-hidden rounded-md cursor-pointer"
          style={{ willChange: 'transform', touchAction: 'pan-y' }}
          onPointerDown={handleImagePointerStart}
          onPointerUp={handleImagePointerEnd}
          onPointerCancel={() => { pointerStart.current = null; }}
        >
        {(product.badge || isComingSoon) && (
          <span className={`badge ${product.badge === 'New' ? 'badge-dark' : ''} z-[25]`}>
            {isComingSoon ? 'Soon' : product.badge}
          </span>
        )}
        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="block w-full h-full"
          onClick={(event) => {
            if (didSwipeImage.current) {
              event.preventDefault();
              event.stopPropagation();
              didSwipeImage.current = false;
              return;
            }
            void trackCustomerEvent('product_clicked', {
              productId: product.id,
              properties: { product_name: product.name, category: product.category, source: 'product_card_image' },
            });
          }}
        >
        <AnimatePresence initial={false} mode="popLayout">
          {isVideoMedia(images[imageIndex]) ? (
            <motion.video
              key={imageIndex}
              src={images[imageIndex]}
              aria-label={`${product.name} product video`}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              className={`pointer-events-none w-full h-full object-cover transition-all duration-700 ${isComingSoon ? 'filter grayscale-[40%] blur-[8px] scale-105' : ''}`}
              draggable={false}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.img
              key={imageIndex}
              src={optimizedProductImageUrl(images[imageIndex], 640)}
              srcSet={optimizedProductImageSrcSet(images[imageIndex])}
              sizes="(min-width: 1024px) 20vw, 50vw"
              alt={product.name}
              loading="lazy"
              decoding="async"
              width="640"
              height="640"
              className={`pointer-events-none w-full h-full object-cover transition-all duration-700 ${isComingSoon ? 'filter grayscale-[40%] blur-[8px] scale-105' : ''}`}
              draggable={false}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.8, ease: 'easeOut' } }}
            />
          )}
        </AnimatePresence>
        </Link>

        {/* Mirror Glass Overlay for Coming Soon */}
        {isComingSoon && (
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/30 to-[#1A1A1A]/10 backdrop-blur-[2px] pointer-events-none flex flex-col items-center justify-center">
            <span className="w-12 h-12 rounded-full border border-white/15 bg-[#1A1A1A]/80 text-white flex items-center justify-center shadow-[0_0_30px_rgba(192,19,42,0.2)]">
              <LockKeyhole size={19} strokeWidth={1.5} />
            </span>
            <span className="mt-4 text-[11px] font-semibold tracking-[0.24em] uppercase text-white">Coming Soon</span>
            <span className="mt-3 w-8 h-px bg-[#C0132A]" />
          </div>
        )}

        {/* Clickable overlay removed - onClick moved to parent image-wrapper */}

        {/* Navigation Arrows - only show if multiple images */}
        {!isComingSoon && images.length > 1 && (
          <>
            <button 
              type="button"
              aria-label="Previous product image"
              onPointerDown={(event) => {
                lastArrowPointerAt.current = Date.now();
                handlePrevImage(event);
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (Date.now() - lastArrowPointerAt.current > 400) showPreviousImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex w-8 h-8 items-center justify-center bg-white/90 rounded-full z-30 hover:bg-white text-black drop-shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              type="button"
              aria-label="Next product image"
              onPointerDown={(event) => {
                lastArrowPointerAt.current = Date.now();
                handleNextImage(event);
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (Date.now() - lastArrowPointerAt.current > 400) showNextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex w-8 h-8 items-center justify-center bg-white/90 rounded-full z-30 hover:bg-white text-black drop-shadow-md"
            >
              <ChevronRight size={18} />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden lg:flex gap-1.5 z-30">
              {images.map((_, i) => (
                <span 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
            <span className="lg:hidden absolute right-2 bottom-2 z-20 rounded-full bg-black/60 px-2 py-1 text-[9px] font-medium tracking-[0.08em] text-white pointer-events-none">
              {imageIndex + 1}/{images.length} · SWIPE
            </span>
          </>
        )}

        {!isComingSoon && <div className="quick-add z-[25] hidden lg:flex gap-2">
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
        </div>}
      </div>

      <div className={`pt-3 lg:pt-4 px-1 lg:px-0.5 text-center lg:text-left cursor-pointer ${isComingSoon ? 'px-1.5 pb-1' : ''}`} onClick={goToProduct}>
        <h3 className="font-display text-[15px] lg:text-[21px] font-bold lg:font-normal mb-0.5 lg:mb-1 line-clamp-1 text-[#1A1A1A]">
          <Link
            to={productUrl}
            onClick={(e) => {
              e.stopPropagation();
              void trackCustomerEvent('product_clicked', {
                productId: product.id,
                properties: { product_name: product.name, category: product.category, source: 'product_card_title' },
              });
            }}
            className="hover:text-[#C0132A] transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        {isComingSoon ? (
          <div className="flex items-center justify-between pt-2 border-t border-[#E8E4E0] text-[10px] font-medium tracking-[0.14em] uppercase text-[#888880]">
            <span>Coming Soon</span>
            <span className="text-[#C0132A]">TBA</span>
          </div>
        ) : (
          <>
          <p className="font-display text-[12px] lg:text-[13px] italic font-light text-[#888880] mb-1.5 lg:mb-2.5 line-clamp-1 leading-tight">
            {product.slogan}
          </p>
          <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-1 lg:gap-0">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.originalPrice}
              className="gap-2"
              priceClassName="text-[14px] lg:text-[15px] font-bold lg:font-medium text-[#1A1A1A]"
              compareClassName="text-[12px] lg:text-[13px] text-[#888880] line-through"
            />
          <div className="flex gap-1.5 hidden lg:flex">
            {product.colors.slice(0, 3).map((color, i) => (
              <button
                type="button"
                aria-label={`Colour option ${i + 1}: ${color}`}
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-[#E8E4E0] cursor-pointer transition-transform duration-200 hover:scale-130"
                style={{ backgroundColor: color }}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={`Quick add ${product.name}`}
          className="lg:hidden mt-2.5 min-h-10 w-full border border-[#C0132A] bg-white px-3 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#C0132A] transition-colors active:bg-[#C0132A] active:text-white flex items-center justify-center gap-2"
          onClick={handleQuickAdd}
        >
          <ShoppingBag size={14} aria-hidden="true" />
          Quick Add
        </button>
        </>
        )}
      </div>
      </div>
    </motion.article>
  );
}
