import { motion, useScroll, useTransform } from 'framer-motion';
import { Bell, Clock, Lock } from 'lucide-react';
import { useSiteSection } from '@/context/SiteContentContext';
import { useStore } from '@/store';
import { CDN } from '@/lib/cdn';
import { useRef } from 'react';

export default function Shirts() {
  const { products } = useStore();
  const shirts = products.filter((p) => p.category === 'shirts').slice(0, 2);
  const { section, getMeta } = useSiteSection('shirts');
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Extended scroll ranges to make the movement much slower and smoother
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [40, 20, 0, -40]);
  const leftX = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], ["-100vw", "0vw", "0vw", "-40vw"]);

  const eyebrow = section?.subtitle || 'Upcoming Drop — Shirts';
  const heading = section?.title || 'Coastal\n<em>Drift</em>';
  const bodyText = section?.body_text || 'Drift Like Waves. Stand Like Palms. Camp collar, relaxed fit, printed with the coastal philosophy you live by.';
  const marqueeText = (getMeta('marquee_text') as string) || 'COMING SOON';

  // Fallback images if store products haven't loaded yet
  const shirtImages = [
    shirts[0]?.image || CDN.NYT_WAVES,
    shirts[1]?.image || CDN.SUNLIGHT_WAVES,
  ];
  const shirtNames = [
    shirts[0]?.name || 'NYT & WAVES',
    shirts[1]?.name || 'SUNLIGHT & WAVES',
  ];

  return (
    <section
      ref={sectionRef}
      id="shirts"
      className="relative min-h-0 lg:min-h-[100vh] flex items-center py-16 lg:py-[160px] px-5 lg:px-20 bg-[#1A1A1A] overflow-hidden"
    >
      {/* Background text Marquee */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0 overflow-hidden flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="font-display text-[clamp(160px,28vw,420px)] scale-y-110 origin-center font-semibold text-transparent px-8 lg:px-16"
              style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.09)' }}
            >
              {marqueeText}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
        {/* Left Content */}
        <motion.div
          style={{ opacity, y, x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? leftX : 0, willChange: "transform, opacity" }}
        >
          <div className="text-[10px] lg:text-[12px] font-medium tracking-[0.24em] uppercase text-[#C0132A] mb-3 lg:mb-6 flex items-center gap-4">
            <span className="w-8 h-px bg-[#C0132A]" />
            {eyebrow}
          </div>

          <h2 className="font-display text-[clamp(32px,7vw,92px)] font-light leading-[1.06] text-white mb-3 lg:mb-6">
            {heading.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line.startsWith('<em>') ? (
                  <em className="italic text-[#C0132A]" dangerouslySetInnerHTML={{ __html: line.replace(/<\/?em>/g, '') }} />
                ) : (
                  line
                )}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>

          <p className="text-[14px] lg:text-[17px] font-light leading-[1.7] lg:leading-[1.85] text-white/45 max-w-[440px] mb-5 lg:mb-10 hidden lg:block">
            {bodyText}
          </p>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-6 lg:mb-10"
          >
            <div className="inline-flex items-center gap-3 border border-[#C0132A]/30 bg-[#C0132A]/[0.06] backdrop-blur-sm px-5 py-3 rounded-full">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-2 h-2 bg-[#C0132A] rounded-full"
              />
              <span className="text-[11px] lg:text-[13px] font-medium tracking-[0.2em] uppercase text-[#C0132A]">
                Coming Soon
              </span>
              <Clock size={14} className="text-[#C0132A]/60" />
            </div>
          </motion.div>

          {/* Notify CTA */}
          <div className="flex gap-4 lg:gap-6 items-center">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-[#C0132A] text-white text-[11px] lg:text-[12px] font-medium tracking-[0.17em] uppercase px-6 lg:px-10 py-3.5 lg:py-5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(192,19,42,0.35)]"
            >
              <Bell size={14} strokeWidth={2} />
              Notify Me
            </motion.button>
            <div className="flex items-center gap-2 text-[11px] lg:text-[12px] font-medium tracking-[0.14em] uppercase text-white/40">
              <Lock size={12} />
              Drops Soon
            </div>
          </div>
        </motion.div>

        {/* Right - Product Cards with Coming Soon Overlay */}
        <motion.div
          style={{ opacity, y }}
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: '-20px', amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-3 lg:gap-6"
        >
          {shirtImages.map((image, index) => {
            const initialX = index === 0 ? -180 : 180;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: initialX, filter: 'blur(10px)', scale: 0.85 }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
                viewport={{ once: false, margin: '-20px', amount: 0.1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
                className={`relative bg-white/[0.04] border border-white/[0.07] overflow-hidden group ${index === 0 ? 'lg:mt-10' : ''}`}
              >
                {/* Product Image — slightly blurred & desaturated for "locked" feel */}
                <div className="overflow-hidden relative">
                  <img
                    src={image}
                    alt={shirtNames[index]}
                    className="w-full aspect-square object-cover p-[6%] transition-all duration-700 filter grayscale-[30%] blur-[6px] group-hover:blur-[4px] group-hover:grayscale-[10%]"
                  />

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/20 to-transparent z-[2] backdrop-blur-[2px]" />

                  {/* Coming Soon centered badge */}
                  <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 + index * 0.2 }}
                      className="flex flex-col items-center gap-3"
                    >
                      {/* Lock icon with glow */}
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(192,19,42,0.15)',
                            '0 0 40px rgba(192,19,42,0.35)',
                            '0 0 20px rgba(192,19,42,0.15)',
                          ],
                        }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#1A1A1A]/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
                      >
                        <Lock size={18} className="text-white/80" />
                      </motion.div>

                      <span className="text-[10px] lg:text-[12px] font-semibold tracking-[0.25em] uppercase text-white/90 text-center">
                        Coming Soon
                      </span>

                      {/* Animated line */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '40px' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.2 }}
                        className="h-[1px] bg-gradient-to-r from-transparent via-[#C0132A] to-transparent"
                      />
                    </motion.div>
                  </div>

                  {/* Corner badge */}
                  <div className="absolute top-3 left-3 z-[4]">
                    <motion.div
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      className="bg-[#C0132A] text-white text-[8px] lg:text-[9px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1"
                    >
                      Soon
                    </motion.div>
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="p-2.5 lg:p-4 border-t border-white/[0.07] flex justify-between items-center text-[10px] lg:text-[12px]">
                  <span className="font-medium tracking-[0.1em] uppercase text-white/60">
                    {shirtNames[index]}
                  </span>
                  <span className="text-[#C0132A]/50 flex items-center gap-1.5">
                    <Clock size={10} />
                    TBA
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
