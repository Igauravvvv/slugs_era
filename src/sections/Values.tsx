import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Footprints, Shirt, Scissors, Users, Eye, Leaf, Sparkles } from 'lucide-react';
import { ExpandOnHover } from '@/components/ui/expand-cards';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';
import LogoAnimation from '@/components/LogoAnimation';

const iconMap: Record<string, any> = { Star, Eye, Scissors, Sparkles, Footprints, Users, Leaf, Shirt };

const defaultValues = [
  {
    icon: Star,
    title: 'Uncompromised Quality',
    quote: "This is what quality looks like before it hits your skin.",
    description: "260 GSM fabric that feels like intention. Hand-selected, tested for durability. This is what quality looks like before it hits your skin.",
    image: CDN.FLUID_FITS_BG,
    objectPosition: 'object-bottom',
  },
  {
    icon: Eye,
    title: 'Our Process',
    quote: "Every print is a decision, not a production line.",
    description: "Screen printing by hand. Red ink, precision, no shortcuts. Every print is a decision, not a production line.",
    image: CDN.TRANSPARENCY_BG,
    objectPosition: 'object-bottom',
  },
  {
    icon: Scissors,
    title: 'Artwork',
    quote: "No dies, no templates — just hands and shears and intention.",
    description: "Cut by hand. Patches are raw, imperfect, deliberate. No dies, no templates — just hands and shears and intention.",
    image: CDN.ARTWORK_BG,
  },
  {
    icon: Sparkles,
    title: 'The Print',
    quote: "Graphic energy that could be anywhere.",
    description: "Graphic energy that could be anywhere. Bold, simple, unmissable. This is what a Slug's Era print carries.",
    image: CDN.RED_ON_TABLE,
    objectPosition: 'object-[100%_20%]',
  },
  {
    icon: Footprints,
    title: 'Our Sourcing',
    quote: "Real supply chain, unglamorous, honest.",
    description: "Fabric loaded at night. Real supply chain, unglamorous, honest. We show you how it actually moves.",
    image: CDN.FABRIC_LOADING_BG,
  },
  {
    icon: Users,
    title: 'The Slow Club',
    quote: "Not merch. Movement.",
    description: "Not merch. Movement. Join the community of people who wear with intention. This is where it lives.",
    image: CDN.COMMUNITY_BG,
    objectPosition: 'object-[50%_75%]',
  },
];

export default function Values() {
  const { section, getMeta } = useSiteSection('values');
  const eyebrow = section?.subtitle || 'What We Stand For';
  const metaItems = getMeta('items') as any[] | undefined;
  const values = metaItems && metaItems.length > 0
    ? metaItems.map((item: any) => ({
        ...item,
        icon: iconMap[item.icon] || Star,
      }))
    : defaultValues;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Fade in, stay visible, then fade out as they leave
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5, 1], [0, 1, 1, 0]);
  
  // Both come from the right, hold in center, then exit back to the right
  const contentX = useTransform(scrollYProgress, [0, 0.4, 0.5, 1], ["100vw", "0vw", "0vw", "100vw"]); 

  return (
    <section ref={sectionRef} id="values" className="pt-8 pb-16 lg:pt-[60px] lg:pb-[120px] bg-[#F9F7F5] overflow-hidden relative">
      {/* Header */}
      <div className="text-center px-5 lg:px-20 mb-16 lg:mb-[80px] relative z-10 overflow-hidden">
        <motion.div 
          className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0"
          style={{ 
            opacity: contentOpacity, 
            x: contentX,
          }}
        >
          <div className="font-display font-light italic text-4xl md:text-6xl lg:text-[70px] text-[#C0132A] whitespace-nowrap">
            {eyebrow}
          </div>
          
          {/* Static Background Logo - Blended to remove white background */}
          <div className="flex items-center justify-center mt-3 lg:mt-0 lg:ml-8">
            <img 
              src="/images/TEXT-LOGO.webp" 
              alt="Slug's Era"
              className="w-[180px] md:w-[240px] lg:w-[300px] h-auto object-contain opacity-90"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Expand Cards Component */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full"
      >
        <ExpandOnHover items={values} />
      </motion.div>
    </section>
  );
}
