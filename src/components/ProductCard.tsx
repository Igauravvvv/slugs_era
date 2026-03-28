import { motion } from 'framer-motion';
import { useStore } from '@/store';
import type { Product } from '@/types';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { setSelectedProduct, setView, addToCart } = useStore();

  const handleClick = () => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
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

  let initialX = 0;
  let initialY = 0;
  let isCenter = false;

  if (index === 0 || index === 3) {
    // Left to Right
    initialX = -180;
  } else if (index === 2 || index === 4) {
    // Right to Left
    initialX = 180;
  } else {
    // Center
    isCenter = true;
  }

  return (
    <motion.div
      {...(isCenter ? {} : {
        initial: { opacity: 0, x: initialX, y: initialY, scale: 0.85, filter: 'blur(10px)' },
        whileInView: { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' },
        viewport: { once: false, margin: '-20px', amount: 0.1 },
        transition: {
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay: index * 0.15
        }
      })}
      className="product-card group"
      onClick={handleClick}
    >
      <div className="image-wrapper">
        {product.badge && (
          <span className={`badge ${product.badge === 'New' ? 'badge-dark' : ''}`}>
            {product.badge}
          </span>
        )}
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{
            scale: 1.15,
            rotate: [-2, 2, -1, 1, 0],
            filter: 'brightness(1.1) contrast(1.05) drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
            transition: { duration: 0.8, ease: "easeOut" }
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="quick-add">
          <button
            className="quick-add-btn flex items-center gap-2"
            onClick={handleQuickAdd}
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>
      </div>

      <div className="pt-4 px-0.5">
        <h3 className="font-display text-[21px] font-normal text-[#1A1A1A] mb-1">
          {product.name}
        </h3>
        <p className="font-display text-[13px] italic font-light text-[#888880] mb-2.5">
          {product.slogan}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-[#1A1A1A]">
            ₹{product.price.toLocaleString()}
          </span>
          <div className="flex gap-1.5">
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
  );
}
