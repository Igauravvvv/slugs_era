import { motion } from 'framer-motion';
import { Heart, Leaf, Shield, Gem, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const values = [
  {
    icon: Heart,
    title: 'Crafted with Soul',
    description: 'Every stitch, every print, every design decision is made with intention. We don\'t mass-produce — we craft.',
  },
  {
    icon: Leaf,
    title: 'Slow Fashion',
    description: 'We reject fast fashion. Small batches, premium fabrics, timeless designs that last years — not weeks.',
  },
  {
    icon: Shield,
    title: '240 GSM Promise',
    description: 'We use heavyweight combed cotton that holds its shape, colour, and comfort wash after wash.',
  },
  {
    icon: Gem,
    title: 'Accessible Luxury',
    description: 'Premium quality shouldn\'t cost ₹8,000. We keep prices between ₹1,500–₹2,500 because good clothing is a right.',
  },
  {
    icon: Users,
    title: 'Made for Indian Bodies',
    description: 'Our silhouettes are cut specifically for Indian body types — oversized that actually fits right.',
  },
];

const timeline = [
  { year: '2025', event: 'The idea was born — two friends frustrated with overpriced, ill-fitting streetwear in India.' },
  { year: 'Early 2026', event: 'First prototypes crafted. 50+ fabric samples tested before landing on our signature 240 GSM cotton.' },
  { year: 'Mar 2026', event: 'Slug\'s Era officially launches with 5 oversized tees and 2 custom shirts.' },
  { year: 'Apr 2026', event: 'Sold out first Limited Edition "The Slow Club" tee in under 48 hours.' },
  { year: 'May 2026', event: 'Hoodies collection drops — heavyweight 400 GSM French Terry, patchwork, embroidery.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#F9F7F5]">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, #1A1A1A 49px, #1A1A1A 50px)',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-5 max-w-3xl mx-auto"
        >
          <span className="eye-text eye-text-center mb-4">Our Story</span>
          <h1 className="font-display text-[clamp(36px,6vw,72px)] font-light leading-[1.1] text-[#1A1A1A] mt-4">
            We're not a brand.<br />
            <em className="italic text-[#C0132A]">We're a movement.</em>
          </h1>
          <p className="text-[#888880] text-[15px] lg:text-[17px] font-light leading-[1.7] mt-6 max-w-xl mx-auto">
            Slugsera is an independent Indian slow-fashion streetwear label founded by college entrepreneurs Gaurav Bhatt and Bandhan Kumar. Built for people who move at their own pace, we turn heavyweight cotton, oversized Indian-fit silhouettes and fearless graphics into wearable art — because good clothes shouldn't cost a month's rent.
          </p>
        </motion.div>
      </section>

      {/* The Story */}
      <section className="py-16 lg:py-28 px-5 lg:px-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div {...fadeUp}>
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=900&fit=crop"
              alt="Our workshop"
              className="w-full aspect-[4/5] object-cover bg-[#F9F7F5]"
            />
          </motion.div>
          <div>
            <motion.div {...fadeUp}>
              <span className="eye-text mb-3">The Beginning</span>
            </motion.div>
            <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="section-title mb-6 mt-3">
              It started with a<br /><em className="italic text-[#C0132A]">simple search</em>
            </motion.h2>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="space-y-4 text-[14px] lg:text-[15px] font-light leading-[1.7] text-[#888880]"
            >
              <p>
                We were just two guys looking for that one perfect tee — patchwork, a design that felt like us, fabric that moved like water. We'd find something close, then see the price. ₹8,000. ₹12,000. And if it wasn't expensive, it simply didn't exist in India.
              </p>
              <p>
                So we stopped searching and started building. We tested 50+ fabric samples. Went through 12 iterations of our first design. Argued about stitching patterns until 3 AM. And when we finally held the first Slug's Era tee in our hands, we knew — this was it.
              </p>
              <p className="text-[#1A1A1A] font-normal">
                Clothes that feel like artwork. Silhouettes made for Indian bodies. And a price that doesn't make you think twice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 lg:py-28 px-5 lg:px-20 bg-[#F9F7F5]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
            <span className="eye-text eye-text-center mb-3">What We Stand For</span>
            <h2 className="section-title mt-3">Our <em className="italic text-[#C0132A]">values</em></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white p-7 lg:p-8 group hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-500"
              >
                <div className="w-11 h-11 flex items-center justify-center bg-[#C0132A]/5 text-[#C0132A] mb-5 transition-colors duration-300 group-hover:bg-[#C0132A] group-hover:text-white">
                  <v.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[20px] lg:text-[22px] font-light text-[#1A1A1A] mb-2">{v.title}</h3>
                <p className="text-[13px] font-light text-[#888880] leading-[1.7]">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-28 px-5 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
            <span className="eye-text eye-text-center mb-3">The Journey</span>
            <h2 className="section-title mt-3">Our <em className="italic text-[#C0132A]">timeline</em></h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-[#E8E4E0] -translate-x-1/2" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-start gap-6 mb-10 pl-10 lg:pl-0 ${
                  i % 2 === 0 ? 'lg:pr-[55%]' : 'lg:pl-[55%]'
                }`}
              >
                <div className="absolute left-4 lg:left-1/2 top-1.5 w-3 h-3 rounded-full bg-[#C0132A] -translate-x-1/2 ring-4 ring-white z-10" />
                <div>
                  <span className="text-[#C0132A] text-[11px] font-semibold tracking-[0.15em] uppercase">{item.year}</span>
                  <p className="text-[14px] font-light text-[#888880] leading-[1.7] mt-1">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 px-5 lg:px-20 bg-[#1A1A1A] text-center">
        <motion.div {...fadeUp} className="max-w-xl mx-auto">
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-light text-white leading-tight mb-4">
            Join the <em className="italic text-[#C0132A]">slow club</em>
          </h2>
          <p className="text-white/50 text-[14px] font-light leading-[1.7] mb-8">
            Shop pieces that tell a story. Wear something that means something.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="btn-primary"
          >
            Shop Now <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
