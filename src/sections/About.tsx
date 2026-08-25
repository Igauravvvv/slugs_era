import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';
import InstagramFeed from '@/components/InstagramFeed';

export default function About() {
  const { section, getMeta } = useSiteSection('about');

  const year = (getMeta('year') as string) || '2026';
  const eyebrow = section?.subtitle || 'OUR STORY';
  const heading = section?.title || 'Born from a\n<em>quiet rebellion</em>';
  const quote = section?.body_text || "We got tired of choosing between things that looked good and things that felt good. So we built something that didn't ask you to compromise.";
  const description = (getMeta('description') as string) || '';
  const signatureSequences = (getMeta('signature_sequences') as string[]) || ['— The Founders', '— The Creators', '— The Visionaries'];
  const mainImage = section?.image_url && section.image_url.trim() !== '' ? section.image_url : CDN.RED_ON_TABLE;
  const accentImage = (getMeta('accent_image') as string)?.trim() ? (getMeta('accent_image') as string) : CDN.ARTWORK_BG;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const rightX = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={sectionRef} id="about" className="py-10 lg:py-[120px] px-5 lg:px-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
        {/* Left - Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
        <img
          src={mainImage}
          alt="Slugsera founders developing Indian streetwear artwork and garments"
          loading="lazy"
          decoding="async"
          className="w-full aspect-square object-cover bg-[#F9F7F5] p-[6%]"
        />
        {/* Accent image */}
        <div className="absolute -bottom-9 -right-9 w-[42%] aspect-square bg-white border-[7px] border-white flex items-center justify-center overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.1)] hidden lg:flex">
          <img
            src={accentImage}
            alt="Close-up of Slugsera garment artwork and production detail"
            loading="lazy"
            decoding="async"
              className="w-[80%] object-contain"
            />
          </div>
        </motion.div>

        {/* Right - Content */}
        <motion.div style={{ x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? rightX : 0 }}>
          {/* Year */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(48px,9vw,128px)] font-light text-transparent leading-none mb-[-14px]"
          style={{ WebkitTextStroke: '1px #E8E4E0' }}
        >
          {year}
        </motion.div>

        {/* Eye text */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="eye-text mb-3.5 uppercase"
        >
          {eyebrow}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="section-title mb-6"
        >
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
        </motion.h2>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="font-display text-[17px] lg:text-[21px] italic font-light text-[#1A1A1A] leading-[1.5] lg:leading-[1.65] border-l-2 border-[#C0132A] pl-4 lg:pl-5 mb-5 lg:mb-7"
        >
          &ldquo;{quote}&rdquo;
        </motion.div>

        {/* Description */}
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="text-[14px] lg:text-[15px] font-light leading-[1.6] lg:leading-[1.8] text-[#888880] mb-6 lg:mb-8 space-y-3 lg:space-y-4"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="font-display text-[24px] lg:text-[30px] italic font-light text-[#C0132A] h-[35px] lg:h-[45px]"
          >
        <TypeAnimation
          sequence={signatureSequences.flatMap(s => [s, 3000])}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              cursor={true}
            />
          </motion.div>
        </motion.div>
      </div>

      <InstagramFeed className="mt-16 lg:mt-32" />
    </section>
  );
}
