import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Heart, Share2, Truck, RotateCcw, Shield, Clock, Bell, AlertTriangle, Info, ChevronDown, ChevronUp, Copy, X } from 'lucide-react';
import { useStore } from '@/store';
import { getSizeStock } from '@/types';
import { generateSlug } from '@/types';
import type { SizeStock } from '@/types';
import SEOHead from '@/components/SEOHead';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import { trackCustomerEvent } from '@/lib/customerAnalytics';
import { supabase } from '@/lib/supabase';
import ProductPrice from '@/components/ProductPrice';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, products, toggleWishlist, isInWishlist } = useStore();
  
  // Find product by slug — try multiple strategies:
  // 1. Match by DB slug field (if mapped)
  // 2. Fallback: match by generated slug from product name
  const selectedProduct = products.find(p => (p as any).slug === slug)
    || products.find(p => generateSlug(p.name) === slug)
    || null;
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCareInfo, setShowCareInfo] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [notifyMe, setNotifyMe] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openPolicy, setOpenPolicy] = useState<'shipping' | 'returns' | 'payment' | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      // Track view
      trackViewItem({ id: selectedProduct.id, name: selectedProduct.name, category: selectedProduct.category, price: selectedProduct.price });
      void trackCustomerEvent('product_viewed', {
        productId: selectedProduct.id,
        properties: { product_name: selectedProduct.name, category: selectedProduct.category },
      });
      // Select first available size
      const firstAvailable = selectedProduct.sizeStock?.find(s => s.stock > 0 || s.preOrder);
      setSelectedSize(firstAvailable?.size || selectedProduct.sizes[0]);
      setSelectedColor(selectedProduct.colors[0]);
      setQuantity(1);
    }
  }, [selectedProduct]);

  // Show 404 instead of silently redirecting home
  if (!selectedProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F9F7F5] flex items-center justify-center mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-4">Product Not Found</h1>
        <p className="text-[15px] text-[#888880] font-light max-w-md mb-8">
          Sorry, we couldn't find a product matching "<strong>{slug}</strong>". It may have been removed or the link may be incorrect.
        </p>
        <Link
          to="/collections"
          className="btn-primary"
        >
          Browse Collections <ArrowRight size={14} />
        </Link>
      </div>
    );
  }


  const currentSizeStock = getSizeStock(selectedProduct, selectedSize);
  const isOutOfStock = currentSizeStock ? currentSizeStock.stock === 0 && !currentSizeStock.preOrder : false;
  const isPreOrder = currentSizeStock?.preOrder && currentSizeStock.stock === 0;
  const isLowStock = currentSizeStock && currentSizeStock.stock > 0 && currentSizeStock.stock <= 3;
  const isComingSoon = selectedProduct.status === 'coming_soon';
  const isFullPreBook = selectedProduct.status === 'pre_book';
  const isSoldOut = selectedProduct.status === 'sold_out';
  const productSlug = selectedProduct.slug || generateSlug(selectedProduct.name);
  const productCategoryLabel = selectedProduct.category === 'tshirts'
    ? 'Oversized T-Shirt'
    : selectedProduct.category === 'shirts'
      ? 'Printed Streetwear Shirt'
      : selectedProduct.category === 'hoodies'
        ? 'Premium Streetwear Hoodie'
        : 'Streetwear Accessory';
  const productDescription = [selectedProduct.description, selectedProduct.material, selectedProduct.fit]
    .filter(Boolean)
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const productAvailability = isComingSoon || isFullPreBook
    ? 'PreOrder'
    : isSoldOut || !selectedProduct.inStock
      ? 'OutOfStock'
      : 'InStock';

  const getSizeLabel = (size: string): { label: string; className: string; disabled: boolean; outOfStock: boolean } => {
    const ss = getSizeStock(selectedProduct, size);
    if (!ss) return { label: '', className: '', disabled: false, outOfStock: false };
    if (ss.stock === 0 && ss.preOrder) return { label: 'Pre-Order', className: 'text-[#C0132A]', disabled: false, outOfStock: false };
    if (ss.stock === 0) return { label: 'Out of Stock', className: 'text-red-500', disabled: false, outOfStock: true };
    if (ss.stock <= 3) return { label: `Only ${ss.stock} left`, className: 'text-amber-600', disabled: false, outOfStock: false };
    return { label: `${ss.stock} in stock`, className: 'text-emerald-600', disabled: false, outOfStock: false };
  };

  // Handle size selection with smart quantity reset
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const ss = getSizeStock(selectedProduct, size);
    if (ss && ss.stock > 0) {
      // Cap quantity to available stock, or reset to 1
      setQuantity(prev => Math.min(prev, ss.stock) || 1);
    } else {
      setQuantity(1);
    }
    void trackCustomerEvent('size_selected', {
      productId: selectedProduct.id,
      properties: { product_name: selectedProduct.name, size },
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isComingSoon || isSoldOut) return;
    addToCart({
      product: selectedProduct,
      quantity,
      size: selectedSize,
      color: selectedColor,
      isPreOrder: isPreOrder || false,
    });
    trackAddToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      price: selectedProduct.price,
      quantity,
      size: selectedSize,
    });
    void trackCustomerEvent('add_to_cart', {
      productId: selectedProduct.id,
      properties: { product_name: selectedProduct.name, size: selectedSize, quantity },
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${selectedProduct.name} by Slug's Era!`;
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      copy: url,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShareMenu(false); }, 1500);
    } else {
      window.open(links[platform], '_blank');
      setShowShareMenu(false);
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => prev === selectedProduct.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex((prev) => prev === 0 ? selectedProduct.images.length - 1 : prev - 1);
  const goBack = () => { navigate(-1); };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${selectedProduct.name} | ${productCategoryLabel}`}
        description={productDescription || `${selectedProduct.name} by Slug's Era. Premium ${productCategoryLabel.toLowerCase()} available online in Delhi NCR and across India.`}
        keywords={[
          selectedProduct.name,
          productCategoryLabel,
          `${selectedProduct.category} India`,
          `${selectedProduct.category} Delhi`,
          `${selectedProduct.category} Noida`,
          `${selectedProduct.category} Gurugram`,
          'Slugsera clothing',
        ]}
        url={`/product/${productSlug}`}
        image={selectedProduct.images[0] || selectedProduct.image}
        type="product"
        product={{
          name: selectedProduct.name,
          price: selectedProduct.price,
          availability: productAvailability,
          category: selectedProduct.category,
          image: selectedProduct.images[0] || selectedProduct.image,
          images: selectedProduct.images,
          colors: selectedProduct.colors,
          sizes: selectedProduct.sizes,
          material: selectedProduct.material,
          fit: selectedProduct.fit,
          description: productDescription,
          sku: selectedProduct.id,
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pb-24">
        {/* Breadcrumb */}
        <button onClick={goBack}
          className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative bg-[#F9F7F5] aspect-square mb-4 overflow-hidden">
              <motion.img key={currentImageIndex} src={selectedProduct.images[currentImageIndex]}
                alt={`${selectedProduct.name} — product view ${currentImageIndex + 1} of ${selectedProduct.images.length}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }} className="w-full h-full object-cover" />

              {selectedProduct.images.length > 1 && (
                <>
                  <button aria-label="Previous image" onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <button aria-label="Next image" onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </>
              )}

              {/* Badge */}
              {selectedProduct.badge && (
                <span className={`absolute top-4 left-4 text-white text-[9px] font-medium tracking-[0.1em] uppercase px-2.5 py-1 ${
                  selectedProduct.badge === 'Coming Soon' ? 'bg-[#3b82f6]' :
                  selectedProduct.badge === 'Sold Out' ? 'bg-[#666]' :
                  'bg-[#C0132A]'
                }`}>{selectedProduct.badge}</span>
              )}

              {/* Sold out overlay */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-[#1A1A1A] px-6 py-3 text-sm font-bold tracking-wider uppercase">Sold Out</span>
                </div>
              )}

              {/* Coming soon overlay */}
              {isComingSoon && (
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                  <span className="bg-white text-[#1A1A1A] px-6 py-3 text-sm font-bold tracking-wider uppercase mb-2">Coming Soon</span>
                  {selectedProduct.launchDate && (
                    <span className="bg-[#C0132A] text-white px-4 py-1.5 text-[10px] font-medium tracking-wider uppercase">
                      Drops {selectedProduct.launchDate}
                    </span>
                  )}
                </div>
              )}
            </div>

            {selectedProduct.images.length > 1 && (
              <div className="flex gap-3">
                {selectedProduct.images.map((img, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 bg-[#F9F7F5] overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-[#1A1A1A]' : 'border-transparent'}`}>
                    <img src={img} alt={`${selectedProduct.name} — product thumbnail ${index + 1} of ${selectedProduct.images.length}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right - Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>

            {/* Category */}
            <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-3">
              {selectedProduct.category === 'tshirts' ? 'T-Shirt' : selectedProduct.category === 'shirts' ? 'Shirt' : selectedProduct.category === 'hoodies' ? 'Hoodie' : 'Accessory'}
              {isFullPreBook && <span className="ml-2 px-2 py-0.5 bg-[#C0132A]/10 text-[#C0132A]">PRE-BOOK</span>}
              {isComingSoon && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600">COMING SOON</span>}
            </div>

            <h1 id="product-title" className="font-display text-[clamp(32px,4vw,48px)] font-light text-[#1A1A1A] mb-2">
              {selectedProduct.name}
            </h1>
            <p className="font-display text-base italic text-[#888880] mb-4">{selectedProduct.slogan}</p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-2">
              {isFullPreBook && selectedProduct.preOrderPrice ? (
                <>
                  <ProductPrice
                    price={selectedProduct.preOrderPrice}
                    compareAtPrice={selectedProduct.price}
                    priceClassName="text-2xl font-medium text-[#C0132A]"
                  />
                  <span className="text-xs font-medium bg-[#C0132A]/10 text-[#C0132A] px-2 py-0.5">
                    Pre-Book Price
                  </span>
                </>
              ) : (
                <ProductPrice
                  price={selectedProduct.price}
                  compareAtPrice={selectedProduct.originalPrice}
                  priceClassName="text-2xl font-medium text-[#1A1A1A]"
                />
              )}
            </div>

            {/* Launch date for pre-book */}
            {isFullPreBook && selectedProduct.launchDate && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <Clock size={14} />
                <span>Ships on <b>{selectedProduct.launchDate}</b> • Limited to {selectedProduct.maxPreOrders} pre-orders</span>
              </div>
            )}

            {/* Stock status banner */}
            {isSoldOut && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-100 border border-gray-200 text-gray-600 text-xs">
                <AlertTriangle size={14} /> This product is currently sold out
              </div>
            )}

            {/* Description */}
            <p className="text-[15px] font-light leading-[1.8] text-[#888880] mb-6">{selectedProduct.description}</p>

            {/* Material & Fit */}
            {(selectedProduct.material || selectedProduct.fit) && (
              <div className="flex gap-6 mb-6">
                {selectedProduct.material && (
                  <div>
                    <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] block mb-1">Material</span>
                    <span className="text-xs text-[#888880]">{selectedProduct.material}</span>
                  </div>
                )}
                {selectedProduct.fit && (
                  <div>
                    <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] block mb-1">Fit</span>
                    <span className="text-xs text-[#888880]">{selectedProduct.fit}</span>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            <div className="mb-6">
              <label className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] mb-3 block">
                Color
              </label>
              <div className="flex gap-3">
                {selectedProduct.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border transition-all duration-200 ${selectedColor === color ? 'ring-2 ring-[#1A1A1A] ring-offset-2' : 'border-[#E8E4E0] hover:scale-110'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            {/* Size Selection with stock indicators */}
            {!isComingSoon && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A]">Size</label>
                  <button 
                    onClick={() => setShowSizeGuide(true)} 
                    className="text-[11px] text-[#C0132A] hover:underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.sizes.map((size) => {
                    const info = getSizeLabel(size);
                    const isSelected = selectedSize === size;
                    return (
                      <div key={size} className="relative">
                        <button
                          onClick={() => handleSizeSelect(size)}
                          className={`w-14 h-14 border flex flex-col items-center justify-center transition-all duration-200 relative ${
                            info.outOfStock && isSelected
                              ? 'border-red-400 bg-red-50 text-red-500'
                              : info.outOfStock
                                ? 'border-[#E8E4E0] bg-[#F9F7F5] opacity-60 hover:opacity-80 hover:border-red-300'
                                : isSelected
                                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                  : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                          }`}
                        >
                          <span className={`text-sm font-medium ${info.outOfStock ? 'text-inherit' : ''}`}>{size}</span>
                          {/* Diagonal line for out of stock */}
                          {info.outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className={`w-[140%] h-[1px] rotate-45 absolute ${isSelected ? 'bg-red-400' : 'bg-[#ccc]'}`} />
                            </div>
                          )}
                        </button>
                        {/* Stock indicator below size */}
                        {info.label && (
                          <span className={`block text-[8px] font-medium text-center mt-1 ${info.className}`}>
                            {info.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected size stock warning */}
                <AnimatePresence mode="wait">
                  {isOutOfStock && (
                    <motion.div key="oos" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-between mt-3 px-3 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>Size <b>{selectedSize}</b> is currently out of stock</span>
                      </div>
                      <button
                        onClick={() => setNotifyMe(true)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Bell size={10} /> Notify Me
                      </button>
                    </motion.div>
                  )}

                  {isLowStock && (
                    <motion.div key="low" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                      <AlertTriangle size={14} />
                      <span>Hurry! Only <b>{currentSizeStock?.stock}</b> left in size <b>{selectedSize}</b></span>
                    </motion.div>
                  )}

                  {isPreOrder && (
                    <motion.div key="pre" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 mt-3 px-3 py-2 bg-[#C0132A]/5 border border-[#C0132A]/20 text-[#C0132A] text-xs">
                      <Clock size={14} />
                      <span>Size <b>{selectedSize}</b> is available for pre-order. Ships in 7-10 business days.</span>
                    </motion.div>
                  )}

                  {!isOutOfStock && !isLowStock && !isPreOrder && currentSizeStock && currentSizeStock.stock > 3 && (
                    <motion.div key="ok" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                      <Check size={14} />
                      <span>Size <b>{selectedSize}</b> is in stock — <b>{currentSizeStock.stock}</b> available</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProduct.features.map((feature) => (
                <span key={feature} className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880] border border-[#E8E4E0] px-3 py-1.5">{feature}</span>
              ))}
            </div>

            {/* Quantity + Add to Cart */}
            {!isComingSoon && !isSoldOut && (
              <div className="flex gap-3 mb-4">
                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-[#E8E4E0]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-12 flex items-center justify-center text-lg text-[#888880] hover:text-[#1A1A1A] transition-colors">−</button>
                    <span className="w-10 h-12 flex items-center justify-center text-sm font-medium text-[#1A1A1A] border-x border-[#E8E4E0]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(isPreOrder ? 5 : (currentSizeStock?.stock || 10), quantity + 1))}
                      disabled={quantity >= (isPreOrder ? 5 : (currentSizeStock?.stock || 10))}
                      className={`w-10 h-12 flex items-center justify-center text-lg transition-colors ${
                        quantity >= (isPreOrder ? 5 : (currentSizeStock?.stock || 10))
                          ? 'text-[#E8E4E0] cursor-not-allowed'
                          : 'text-[#888880] hover:text-[#1A1A1A]'
                      }`}>+</button>
                  </div>
                )}

                {/* Add to Cart / Pre-Order / Out of Stock Button */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAdded || isOutOfStock}
                  whileTap={!isAdded && !isOutOfStock ? { scale: 0.97 } : {}}
                  className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-3 px-10 py-4 text-[11px] font-medium tracking-[0.17em] uppercase transition-all duration-300 ${
                    isAdded ? 'bg-green-600 text-white' :
                    isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' :
                    isPreOrder ? 'bg-[#C0132A] text-white hover:bg-[#a81024]' :
                    'bg-[#1A1A1A] text-white hover:bg-black'
                  }`}
                >
                  {isAdded ? (<><Check size={16} /> Added to Bag</>) :
                   isOutOfStock ? (<><Bell size={16} /> Select Another Size</>) :
                   isPreOrder || isFullPreBook ? (<><Clock size={16} /> Pre-Order Now</>) :
                   (<><ShoppingBag size={16} /> Add to Bag</>)}
                </motion.button>
              </div>
            )}

            {/* Coming Soon - Notify Me */}
            {isComingSoon && (
              <div className="mb-6">
                {!notifyMe ? (
                  <button onClick={() => setNotifyMe(true)}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-[11px] font-medium tracking-[0.17em] uppercase bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors">
                    <Bell size={16} /> Notify Me When Available
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2">
                    <div className="flex gap-2">
                      <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Enter your email" className="flex-1 px-4 py-3 border border-[#E8E4E0] text-sm focus:outline-none focus:border-[#C0132A]" />
                      <button onClick={async () => {
                        if (!notifyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) return;
                        try {
                          await supabase.from('notify_requests').insert({
                            email: notifyEmail.toLowerCase(),
                            product_id: selectedProduct.id,
                            product_name: selectedProduct.name,
                            size: selectedSize || null,
                          });
                        } catch (e) {
                          console.warn('Notify save failed (table may not exist):', e);
                        }
                        setNotifySubmitted(true);
                        setNotifyEmail('');
                        setTimeout(() => { setNotifyMe(false); setNotifySubmitted(false); }, 4000);
                      }}
                        className="px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-medium tracking-wider uppercase hover:bg-black transition-colors">
                        {notifySubmitted ? '✓ Saved!' : 'Notify Me'}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#888880]">We'll email you when this drops{selectedProduct.launchDate ? ` on ${selectedProduct.launchDate}` : ''}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Sold out - Notify Me */}
            {isSoldOut && (
              <button onClick={() => setNotifyMe(true)}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-[11px] font-medium tracking-[0.17em] uppercase border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors mb-6">
                <Bell size={16} /> Notify When Restocked
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4 relative">
              <button onClick={() => toggleWishlist(selectedProduct.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${isInWishlist(selectedProduct.id) ? 'text-[#C0132A]' : 'text-[#888880] hover:text-[#1A1A1A]'}`}>
                <Heart size={16} fill={isInWishlist(selectedProduct.id) ? '#C0132A' : 'none'} /> {isInWishlist(selectedProduct.id) ? 'Saved' : 'Save for Later'}
              </button>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors">
                  <Share2 size={16} /> Share
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute top-8 left-0 bg-white border border-[#E8E4E0] shadow-lg z-20 py-1 min-w-[160px]">
                      <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left text-xs text-[#1A1A1A] hover:bg-[#F9F7F5] transition-colors">WhatsApp</button>
                      <button onClick={() => handleShare('twitter')} className="w-full px-4 py-2 text-left text-xs text-[#1A1A1A] hover:bg-[#F9F7F5] transition-colors">Twitter / X</button>
                      <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left text-xs text-[#1A1A1A] hover:bg-[#F9F7F5] transition-colors flex items-center gap-2">
                        <Copy size={12} /> {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Care Instructions Accordion */}
            {selectedProduct.careInstructions && selectedProduct.careInstructions.length > 0 && (
              <div className="mt-8 border-t border-[#E8E4E0]">
                <button onClick={() => setShowCareInfo(!showCareInfo)}
                  className="w-full flex items-center justify-between py-4 text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A]">
                  <span className="flex items-center gap-2"><Info size={14} /> Care Instructions</span>
                  {showCareInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {showCareInfo && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4">
                      <ul className="space-y-1.5">
                        {selectedProduct.careInstructions.map((inst, i) => (
                          <li key={i} className="text-xs text-[#888880] flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-[#C0132A]" /> {inst}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Trust badges double as concise, expandable policy summaries. */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-8 border-t border-[#E8E4E0]">
              {[
                { id: 'shipping' as const, label: 'Free Shipping', icon: Truck, detail: 'Complimentary standard shipping across India. Orders are generally delivered in 3–5 business days.', link: '/shipping-policy', linkLabel: 'Read shipping policy' },
                { id: 'returns' as const, label: 'Easy Returns', icon: RotateCcw, detail: 'Eligible unused items can be exchanged within 7 days of delivery, with tags and original packaging intact.', link: '/return-policy', linkLabel: 'Read return policy' },
                { id: 'payment' as const, label: 'Secure Payment', icon: Shield, detail: 'Checkout is processed through secure payment providers. Slugsera does not store your card details.', link: null, linkLabel: null },
              ].map((policy) => {
                const Icon = policy.icon;
                const isOpen = openPolicy === policy.id;
                return (
                  <div key={policy.id} className="text-center">
                    <button
                      type="button"
                      onClick={() => setOpenPolicy(isOpen ? null : policy.id)}
                      aria-expanded={isOpen}
                      className="w-full flex flex-col items-center rounded-lg px-2 py-2 hover:bg-[#F9F7F5] transition-colors"
                    >
                      <Icon size={20} className="text-[#C0132A] mb-2" strokeWidth={1.5} />
                      <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">{policy.label}</span>
                      <ChevronDown size={13} className={`text-[#C0132A] mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden text-left"
                        >
                          <div className="mt-2 rounded-lg bg-[#F9F7F5] px-3 py-3 text-xs leading-relaxed text-[#666]">
                            <p>{policy.detail}</p>
                            {policy.link && <Link to={policy.link} className="inline-block mt-2 text-[#C0132A] font-medium hover:underline">{policy.linkLabel} →</Link>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white p-2 md:p-4 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
            >
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors z-20"
              >
                <X size={16} />
              </button>
              <img src="/images/Size_guide.webp" alt="Size Guide" className="w-full h-auto rounded-lg" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
