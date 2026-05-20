import { motion } from 'framer-motion';
import { Star, Footprints, Shirt, Scissors, Users, Eye, Leaf, Sparkles } from 'lucide-react';
import { ExpandOnHover } from '@/components/ui/expand-cards';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';

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
  const heading = section?.title || 'Our <em class="italic text-[#C0132A]">Journey</em>';
  const metaItems = getMeta('items') as any[] | undefined;
  const values = metaItems && metaItems.length > 0
    ? metaItems.map((item: any) => ({
        ...item,
        icon: iconMap[item.icon] || Star,
      }))
    : defaultValues;

  return (
    <section id="values" className="py-16 lg:py-[120px] bg-[#F9F7F5] overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-5 lg:px-20 mb-10 lg:mb-[60px]"
      >
        <div className="eye-text eye-text-center mb-3.5">{eyebrow}</div>
        <h2
          className="section-title"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
      </motion.div>

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
