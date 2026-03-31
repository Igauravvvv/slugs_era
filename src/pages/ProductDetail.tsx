import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Heart, Share2, Truck, RotateCcw, Shield } from 'lucide-react';
import { useStore } from '@/store';
import { products } from '@/data/products';

export default function ProductDetail() {
  const { selectedProduct, setView, addToCart, addToteBag, hasToteBag } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showToteOffer, setShowToteOffer] = useState(false);

  // If no product selected, go back to home
  useEffect(() => {
    if (!selectedProduct) {
      setView('home');
    } else {
      setSelectedSize(selectedProduct.sizes[0]);
      setSelectedColor(selectedProduct.colors[0]);
    }
  }, [selectedProduct, setView]);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    addToCart({
      product: selectedProduct,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    });
    setIsAdded(true);
    
    // Show tote bag offer for clothing items
    if (selectedProduct.category !== 'accessories' && !hasToteBag) {
      setShowToteOffer(true);
    }

    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddToteBag = () => {
    const toteBag = products.find(p => p.id === 'acc-001');
    if (toteBag) {
      addToCart({
        product: toteBag,
        quantity: 1,
        size: 'ONE SIZE',
        color: toteBag.colors[0],
      });
      addToteBag();
      setShowToteOffer(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const goBack = () => {
    setView('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Main Image */}
            <div className="relative bg-[#F9F7F5] aspect-square mb-4 overflow-hidden">
              <motion.img
                key={currentImageIndex}
                src={selectedProduct.images[currentImageIndex]}
                alt={selectedProduct.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ArrowRight size={18} />
                  </button>
                </>
              )}

              {/* Badge */}
              {selectedProduct.badge && (
                <span className="absolute top-4 left-4 bg-[#C0132A] text-white text-[9px] font-medium tracking-[0.1em] uppercase px-2.5 py-1">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {selectedProduct.images.length > 1 && (
              <div className="flex gap-3">
                {selectedProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 bg-[#F9F7F5] overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-[#1A1A1A]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${selectedProduct.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Category */}
            <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-3">
              {selectedProduct.category === 'tshirts' ? 'T-Shirt' : selectedProduct.category === 'shirts' ? 'Shirt' : 'Accessory'}
            </div>

            {/* Name */}
            <h1 className="font-display text-[clamp(32px,4vw,48px)] font-light text-[#1A1A1A] mb-2">
              {selectedProduct.name}
            </h1>

            {/* Slogan */}
            <p className="font-display text-base italic text-[#888880] mb-4">
              {selectedProduct.slogan}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-medium text-[#1A1A1A]">
                ₹{selectedProduct.price.toLocaleString()}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-lg text-[#888880] line-through">
                  ₹{selectedProduct.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[15px] font-light leading-[1.8] text-[#888880] mb-8">
              {selectedProduct.description}
            </p>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] mb-3 block">
                Color
              </label>
              <div className="flex gap-3">
                {selectedProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                      selectedColor === color
                        ? 'ring-2 ring-[#1A1A1A] ring-offset-2'
                        : 'border-[#E8E4E0] hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1A1A] mb-3 block">
                Size
              </label>
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedProduct.features.map((feature) => (
                <span
                  key={feature}
                  className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880] border border-[#E8E4E0] px-3 py-1.5"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full lg:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-[11px] font-medium tracking-[0.17em] uppercase transition-all duration-300 ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1A1A1A] text-white hover:bg-black'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={16} />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Bag
                </>
              )}
            </button>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors">
                <Heart size={16} />
                Save for Later
              </button>
              <button className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors">
                <Share2 size={16} />
                Share
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#E8E4E0]">
              <div className="flex flex-col items-center text-center">
                <Truck size={20} className="text-[#C0132A] mb-2" strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw size={20} className="text-[#C0132A] mb-2" strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
                  Easy Returns
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield size={20} className="text-[#C0132A] mb-2" strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#888880]">
                  Secure Payment
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tote Bag Offer Modal */}
        {showToteOffer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-white shadow-2xl border border-[#E8E4E0] p-6 max-w-sm z-50"
          >
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&h=100&fit=crop"
                alt="Tote Bag"
                className="w-16 h-16 object-cover"
              />
              <div className="flex-1">
                <h4 className="font-display text-lg font-medium text-[#1A1A1A] mb-1">
                  Free Tote Bag!
                </h4>
                <p className="text-sm text-[#888880] mb-3">
                  Add our Everyday Tote (worth ₹499) to your order for FREE!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToteBag}
                    className="bg-[#C0132A] text-white text-[10px] font-medium tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#8B0000] transition-colors"
                  >
                    Add Free
                  </button>
                  <button
                    onClick={() => setShowToteOffer(false)}
                    className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#888880] px-4 py-2 hover:text-[#1A1A1A] transition-colors"
                  >
                    No Thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
