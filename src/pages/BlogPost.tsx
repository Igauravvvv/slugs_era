import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts } from '@/data/blogData';
import SEOHead from '@/components/SEOHead';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEOHead 
        title={post.title} 
        description={post.excerpt} 
        url={`/blog/${post.slug}`} 
        image={post.image}
        type="article"
      />
      
      {/* JSON-LD Article Schema for rich snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://slugsera.com/blog/${post.slug}`
          },
          "headline": post.title,
          "image": post.image.startsWith('http') ? post.image : `https://slugsera.com${post.image}`,  
          "author": {
            "@type": "Organization",
            "name": post.author,
            "url": "https://slugsera.com"
          },  
          "publisher": {
            "@type": "Organization",
            "name": "Slug's Era",
            "logo": {
              "@type": "ImageObject",
              "url": "https://slugsera.com/images/logo.png"
            }
          },
          "datePublished": post.date,
          "dateModified": post.date,
          "description": post.excerpt
        })}
      </script>

      {/* Header Image */}
      <div className="w-full h-[50vh] lg:h-[70vh] relative overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-5 lg:px-0 -mt-20 relative z-10">
        <div className="bg-white p-8 lg:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
          
          <Link to="/blog" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#888880] hover:text-[#C0132A] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Journal
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#888880] uppercase tracking-wider mb-6">
            <span className="bg-[#F9F7F5] px-3 py-1 text-[#1A1A1A] font-semibold">{post.category}</span>
            <span>{new Date(post.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-[#D1CCC5]"></span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.1] text-[#1A1A1A] mb-10">
            {post.title}
          </h1>

          <div 
            className="prose prose-lg max-w-none text-[#555] font-light leading-[1.8]
              prose-h2:font-display prose-h2:text-[28px] prose-h2:text-[#1A1A1A] prose-h2:mt-12 prose-h2:mb-6 prose-h2:font-light
              prose-p:mb-6 prose-p:text-[15px] lg:prose-p:text-[16px]
              prose-strong:font-semibold prose-strong:text-[#1A1A1A]
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
              prose-li:mb-2 prose-li:text-[15px] lg:prose-li:text-[16px]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-8 border-t border-[#E8E4E0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[13px] text-[#888880]">
              Written by <strong className="text-[#1A1A1A] uppercase tracking-wider text-[11px]">{post.author}</strong>
            </div>
            
            {/* Social Share mock */}
            <div className="flex gap-4">
              <span className="text-[11px] uppercase tracking-wider text-[#888880]">Share:</span>
              <a href="#" className="text-[#1A1A1A] hover:text-[#C0132A]">Tw</a>
              <a href="#" className="text-[#1A1A1A] hover:text-[#C0132A]">Fb</a>
              <a href="#" className="text-[#1A1A1A] hover:text-[#C0132A]">In</a>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-20 mt-24">
          <div className="border-t border-[#E8E4E0] pt-16">
            <h3 className="font-display text-[28px] text-[#1A1A1A] mb-10">Read More from Slugsera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <div className="overflow-hidden aspect-video bg-[#E8E4E0] mb-4">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="font-display text-[18px] leading-tight text-[#1A1A1A] mb-2 group-hover:text-[#C0132A] transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-[13px] text-[#888880] line-clamp-2">
                      {post.excerpt}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
