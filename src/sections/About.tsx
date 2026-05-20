import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Instagram, Play } from 'lucide-react';
import { useStore } from '@/store';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';

export default function About() {
  const { isAboutMobileVisible } = useStore();
  const [instaPosts, setInstaPosts] = useState<any[]>([]);
  const { section, getMeta } = useSiteSection('about');

  const year = (getMeta('year') as string) || '2026';
  const eyebrow = section?.subtitle || 'OUR STORY';
  const heading = section?.title || 'Born from a\n<em>quiet rebellion</em>';
  const quote = section?.body_text || "We got tired of choosing between things that looked good and things that felt good. So we built something that didn't ask you to compromise.";
  const description = (getMeta('description') as string) || '';
  const signatureSequences = (getMeta('signature_sequences') as string[]) || ['— The Founders', '— The Creators', '— The Visionaries'];
  const mainImage = section?.image_url || CDN.WHITE_HOODIE_TABLE;
  const accentImage = (getMeta('accent_image') as string) || CDN.RED_ON_TABLE;

  const BEHOLD_URL = "https://feeds.behold.so/jEX0GvueRxPPOb9VgUbX";

  useEffect(() => {
    if (!BEHOLD_URL) return;

    fetch(BEHOLD_URL)
      .then(res => res.json())
      .then(data => {
        // Behold returns an array of post objects
        const posts = Array.isArray(data) ? data : data.posts || [];
        setInstaPosts(posts.slice(0, 4));
      })
      .catch(err => console.error("Error fetching Instagram feed:", err));
  }, []);

  return (
    <section id="about" className="py-10 lg:py-[120px] px-5 lg:px-20 bg-white">
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
          alt="Our Story"
          className="w-full aspect-square object-cover bg-[#F9F7F5] p-[6%]"
        />
        {/* Accent image */}
        <div className="absolute -bottom-9 -right-9 w-[42%] aspect-square bg-white border-[7px] border-white flex items-center justify-center overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.1)] hidden lg:flex">
          <img
            src={accentImage}
            alt="Detail"
              className="w-[80%] object-contain"
            />
          </div>
        </motion.div>

        {/* Right - Content */}
        <div>
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
        </div>
      </div>

      {/* Instagram Live Feed */}
      <div className="mt-16 lg:mt-32 pt-12 lg:pt-24 border-t border-[#E8E4E0] relative w-full lg:col-span-2">
        <div className="flex flex-col items-center w-full">
          <motion.a
            href="https://www.instagram.com/slugsera/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group flex flex-col items-center gap-1.5 lg:gap-2 mb-8 lg:mb-12 hover:text-[#C0132A] transition-colors"
          >
            <span className="text-[#C0132A] text-[10px] font-medium tracking-[0.24em] uppercase">Join the community</span>
            <span className="text-[#1A1A1A] text-[15px] font-display italic tracking-[0.05em] group-hover:text-[#C0132A] transition-colors">
              @slugsera
            </span>
          </motion.a>

          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 lg:gap-6 w-full max-w-[1400px]">
            {!BEHOLD_URL ? (
              // Instruction State: What they see before pacing the link
              Array.from({ length: 4 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  className={`relative w-full aspect-[2/5] lg:aspect-[4/5] overflow-hidden bg-[#F9F7F5] rounded-full lg:rounded-2xl border border-[#E8E4E0] shadow-sm ${idx % 2 !== 0 ? 'translate-y-4 lg:translate-y-6' : ''
                    }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white hover:bg-[#F9F7F5] transition-colors duration-500">
                    <div className="w-16 h-16 bg-[#F9F7F5] rounded-full flex items-center justify-center mb-6 border border-[#E8E4E0]">
                      <Instagram className="w-6 h-6 text-[#1A1A1A] opacity-40" />
                    </div>
                    <h4 className="font-display italic text-[22px] text-[#1A1A1A] mb-3">Your Feed {idx + 1}</h4>
                    <p className="text-[13px] font-light text-[#888880] leading-[1.6]">
                      Paste your <strong>Behold.so JSON Link</strong> into <code>About.tsx</code> to automatically sync your latest posts!
                    </p>
                  </div>
                </motion.div>
              ))
            ) : instaPosts.length > 0 ? (
              // Loaded State: What they see when Behold data arrives
              instaPosts.map((post, idx) => {
                const isVideo = post.mediaType === 'VIDEO';
                const imageSource = post.thumbnailUrl || post.mediaUrl;

                return (
                  <motion.a
                    key={post.id || idx}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1 }}
                    className={`group relative w-full aspect-[2/5] lg:aspect-[4/5] overflow-hidden bg-[#F9F7F5] rounded-full lg:rounded-2xl border border-[#E8E4E0] shadow-sm block ${idx % 2 !== 0 ? 'translate-y-4 lg:translate-y-6' : ''
                      }`}
                  >
                    <img
                      src={imageSource}
                      alt="Instagram Post"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      {isVideo && (
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pb-0.5 pl-1 scale-50 group-hover:scale-100 transition-transform duration-500 delay-100 border border-white/30 hover:bg-white/30">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                      )}
                    </div>
                  </motion.a>
                );
              })
            ) : (
              // Loading State: What they see while fetching
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-full aspect-[2/5] lg:aspect-[4/5] lg:h-[580px] bg-gray-100 animate-pulse rounded-full lg:rounded-2xl ${idx % 2 !== 0 ? 'translate-y-4 lg:translate-y-6' : ''
                    }`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
