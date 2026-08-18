import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { generateSlug } from '@/types';
import ProductPrice from '@/components/ProductPrice';

const lookbookSections = [
  {
    title: 'Street Ready',
    subtitle: 'Oversized tees that move with the city',
    category: 'tshirts',
    maxProducts: 3,
    mood: 'Dark streets, bright prints. The kind of fit that turns heads without trying.',
  },
  {
    title: 'Coastal Drop',
    subtitle: 'Shirts made for the golden hour',
    category: 'shirts',
    maxProducts: 2,
    mood: 'Waves, warmth, and fabric that flows. Button-ups built for slow evenings.',
  },
  {
    title: 'Layer Season',
    subtitle: 'Heavyweight hoodies for the bold',
    category: 'hoodies',
    maxProducts: 3,
    mood: 'Cut-and-sew patchwork, embroidered logos, 400 GSM warmth. Winter is a vibe.',
  },
];

export default function Lookbook() {
  const navigate = useNavigate();
  const { products } = useStore();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-5"
        >
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#C0132A]">Season 01</span>
          <h1 className="font-display text-[clamp(40px,7vw,80px)] font-light leading-[1.05] text-white mt-3">
            The <em className="italic text-[#C0132A]">Lookbook</em>
          </h1>
          <p className="text-white/40 text-[14px] lg:text-[15px] font-light leading-[1.7] mt-4 max-w-lg mx-auto">
            Premium slow fashion, styled as it's meant to be worn. Every piece tells a story.
          </p>
        </motion.div>
      </section>

      {/* Lookbook Sections */}
      {lookbookSections.map((section, sIdx) => {
        const sectionProducts = products
          .filter(p => p.category === section.category)
          .slice(0, section.maxProducts);

        return (
          <section
            key={section.title}
            className={`py-16 lg:py-28 px-5 lg:px-20 ${sIdx % 2 === 0 ? 'bg-white' : 'bg-[#F9F7F5]'}`}
          >
            <div className="max-w-[1400px] mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-10 lg:mb-14"
              >
                <span className="eye-text mb-3">Collection {String(sIdx + 1).padStart(2, '0')}</span>
                <h2 className="section-title mt-3 mb-2">{section.title}</h2>
                <p className="text-[#888880] text-[14px] font-light">{section.subtitle}</p>
              </motion.div>

              {/* Products Grid */}
              <div className={`grid gap-4 lg:gap-6 ${
                sectionProducts.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'
              }`}>
                {sectionProducts.map((product, pIdx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: pIdx * 0.1 }}
                    onClick={() => navigate(`/product/${generateSlug(product.name)}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden bg-[#F9F7F5] aspect-[3/4]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover p-[8%] transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {product.badge && (
                        <span className="badge">{product.badge}</span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <p className="text-white text-[11px] font-medium tracking-[0.12em] uppercase flex items-center gap-2">
                          View Product <ArrowRight size={12} />
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-display text-[18px] lg:text-[20px] font-light text-[#1A1A1A]">{product.name}</h3>
                      <p className="text-[12px] text-[#888880] font-light mt-0.5">{product.slogan}</p>
                      <ProductPrice
                        price={product.price}
                        compareAtPrice={product.originalPrice}
                        className="mt-1 gap-2"
                        priceClassName="text-[14px] font-medium text-[#1A1A1A]"
                        compareClassName="text-[12px] text-[#888880] line-through"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mood Text */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="font-display text-[16px] lg:text-[19px] italic font-light text-[#888880] mt-8 lg:mt-12 border-l-2 border-[#C0132A] pl-5 max-w-xl"
              >
                "{section.mood}"
              </motion.p>
            </div>
          </section>
        );
      })}

      {/* Bottom CTA */}
      <section className="py-16 lg:py-24 px-5 lg:px-20 bg-[#1A1A1A] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-light text-white leading-tight mb-4">
            Wear the <em className="italic text-[#C0132A]">story</em>
          </h2>
          <p className="text-white/40 text-[14px] font-light leading-[1.7] mb-8">
            Every piece in our lookbook is available to shop. Limited runs — once they're gone, they're gone.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="btn-primary"
          >
            Shop All <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
