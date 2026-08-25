import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blogData';
import SEOHead from '@/components/SEOHead';

export default function BlogList() {
  const orderedPosts = [...blogPosts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return (
    <div className="bg-[#F9F7F5] min-h-screen pb-20">
      <SEOHead 
        title="Indian Streetwear & Slow Fashion Journal | Slugsera"
        description="Read practical guides to oversized T-shirt fit, fabric GSM, garment care, Indian streetwear styling and the ideas behind the Slugsera movement."
        keywords={['slow fashion blog India', 'oversized t-shirt styling guide', 'Indian streetwear culture', 'Slugsera blog']}
        url="/blog" 
        structuredData={{ '@context': 'https://schema.org', '@type': 'Blog', name: "The Slugsera Streetwear Journal", url: 'https://www.slugsera.com/blog', blogPost: orderedPosts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: `https://www.slugsera.com/blog/${post.slug}`, datePublished: post.date })) }}
      />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-5 lg:px-20 text-center border-b border-[#E8E4E0]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <span className="eye-text eye-text-center mb-4">The Journal</span>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] font-light leading-[1.1] text-[#1A1A1A] mt-4">
            Stories from the <em className="italic text-[#C0132A]">Slug's Era</em>
          </h1>
          <p className="text-[#888880] text-[15px] lg:text-[17px] font-light leading-[1.7] mt-6">
            Insights on slow fashion, streetwear styling, and the philosophy that drives Slugsera.
          </p>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-5 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {orderedPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block h-full flex flex-col">
                <div className="overflow-hidden aspect-[4/3] bg-[#E8E4E0] relative mb-6">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#1A1A1A]">
                    {post.category}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[11px] text-[#888880] uppercase tracking-wider mb-3">
                    <span>{new Date(post.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1CCC5]"></span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h2 className="font-display text-[22px] lg:text-[26px] leading-tight text-[#1A1A1A] mb-3 group-hover:text-[#C0132A] transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-[14px] text-[#888880] leading-[1.6] font-light mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                    Read Story <span className="text-[#C0132A]">&rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
