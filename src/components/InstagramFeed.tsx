import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Play } from 'lucide-react';

interface InstagramPost {
  id?: string;
  permalink?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
}

interface InstagramFeedProps {
  className?: string;
}

const INSTAGRAM_URL = 'https://www.instagram.com/slugsera/';
const BEHOLD_FEED_URL = 'https://feeds.behold.so/jEX0GvueRxPPOb9VgUbX';

/** Shared live Instagram section used on the home page and cart. */
export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    fetch(BEHOLD_FEED_URL)
      .then((response) => response.json())
      .then((data) => {
        if (!isCurrent) return;
        const feed = Array.isArray(data) ? data : data.posts || [];
        setPosts(feed.slice(0, 4));
      })
      .catch(() => {
        // The direct Instagram link remains useful if a feed provider is unavailable.
        if (isCurrent) setPosts([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, []);

  return (
    <section className={`border-t border-[#E8E4E0] pt-10 sm:pt-14 ${className}`.trim()}>
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#C0132A] mb-2">Join the community</p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-display text-lg italic text-[#1A1A1A] hover:text-[#C0132A] transition-colors"
        >
          <Instagram size={17} /> @slugsera
        </a>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {posts.map((post, index) => {
            const imageSource = post.thumbnailUrl || post.mediaUrl;
            return (
              <motion.a
                key={post.id || index}
                href={post.permalink || INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group relative aspect-square sm:aspect-[4/5] overflow-hidden bg-[#F9F7F5]"
              >
                {imageSource && <img src={imageSource} alt="Slugsera Instagram post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                {post.mediaType === 'VIDEO' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10 text-white">
                    <span className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"><Play size={16} fill="currentColor" /></span>
                  </span>
                )}
              </motion.a>
            );
          })}
        </div>
      ) : (
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-24 px-5 py-6 flex items-center justify-center gap-3 bg-[#F9F7F5] text-center text-sm text-[#888880] hover:text-[#C0132A] transition-colors"
        >
          <Instagram size={20} className="text-[#C0132A]" />
          {isLoading ? 'Loading the latest from Instagram…' : 'Follow @slugsera for new drops, styling, and behind the scenes.'}
        </a>
      )}
    </section>
  );
}
