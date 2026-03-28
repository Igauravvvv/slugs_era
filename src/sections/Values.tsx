import { motion } from 'framer-motion';
import { Star, Clock, Heart, Leaf } from 'lucide-react';

const values = [
  {
    icon: Star,
    title: 'Uncompromised Quality',
    description: '240 GSM organic cotton. Gets softer with every wear, built to outlast every trend.',
  },
  {
    icon: Clock,
    title: 'Slow by Design',
    description: 'Two drops a year. No waste, no urgency, no FOMO. Garments made for your real life.',
  },
  {
    icon: Heart,
    title: 'Radical Comfort',
    description: 'Oversized cuts, breathable weaves. Engineered for how you actually live.',
  },
  {
    icon: Leaf,
    title: 'Minimal Footprint',
    description: 'Carbon-neutral shipping, plastic-free packaging. Direct-to-consumer only.',
  },
];

export default function Values() {
  return (
    <section id="values" className="py-24 lg:py-[120px] px-6 lg:px-20 bg-[#F9F7F5]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 lg:mb-[72px]"
      >
        <div className="eye-text eye-text-center mb-3.5">What We Stand For</div>
        <h2 className="section-title">
          Built on <em className="italic text-[#C0132A]">Four Pillars</em>
        </h2>
      </motion.div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {values.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ 
              duration: 0.9, 
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.1 
            }}
            className="group p-10 lg:p-11 bg-white relative transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.08)]"
          >
            {/* Left accent line */}
            <div className="absolute top-0 left-0 w-[3px] h-0 bg-[#C0132A] transition-all duration-500 group-hover:h-full"
                 style={{ transitionTimingFunction: 'var(--ease)' }} />
            
            {/* Icon */}
            <div className="w-11 h-11 mb-5 flex items-center justify-center">
              <value.icon 
                size={26} 
                strokeWidth={1.2} 
                className="text-[#C0132A]" 
              />
            </div>
            
            {/* Title */}
            <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-2.5">
              {value.title}
            </h3>
            
            {/* Description */}
            <p className="text-[13px] font-light text-[#888880] leading-[1.85]">
              {value.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
