import { motion } from 'framer-motion';
import {
  Search, AlertCircle, CheckCircle, AlertTriangle, Info,
  ExternalLink, Image as ImageIcon, Type, FileText, Link2,
  Tag, RefreshCw
} from 'lucide-react';

interface ProductSEO {
  id: string; name: string; slug: string; score: number;
  metaTitle: string; metaTitleLength: number;
  metaDescription: string; metaDescLength: number;
  hasAltText: boolean; imageCount: number; imagesWithAlt: number;
  descriptionLength: number;
  issues: { type: 'error' | 'warning' | 'info'; message: string; field: string }[];
}

const mockSEOData: ProductSEO[] = [
  {
    id: '1', name: 'The Tortoise', slug: 'the-tortoise', score: 92,
    metaTitle: "The Tortoise Tee - Premium T-Shirts | Slug's Era", metaTitleLength: 50,
    metaDescription: "Shop The Tortoise Tee from Slug's Era. Premium cotton oversized tee with a beautifully patterned sea turtle graphic. Always Finishes.", metaDescLength: 131,
    hasAltText: true, imageCount: 3, imagesWithAlt: 3, descriptionLength: 180,
    issues: [{ type: 'info', message: 'Consider adding more product images', field: 'images' }],
  },
  {
    id: '2', name: 'Let The Moment Play', slug: 'let-the-moment-play', score: 85,
    metaTitle: "Let The Moment Play - T-Shirts | Slug's Era", metaTitleLength: 45,
    metaDescription: "Vinyl teaches patience. Premium black oversized tee from Slug's Era featuring a vintage vinyl record graphic.", metaDescLength: 108,
    hasAltText: true, imageCount: 2, imagesWithAlt: 2, descriptionLength: 165,
    issues: [
      { type: 'warning', message: 'Meta description slightly short (108/120-160 ideal)', field: 'meta_description' },
    ],
  },
  {
    id: '3', name: 'NYT & WAVES', slug: 'nyt-and-waves', score: 88,
    metaTitle: "NYT & WAVES Shirt - Premium Shirts | Slug's Era", metaTitleLength: 49,
    metaDescription: "A striking button-up shirt featuring dark midnight waves. Perfect for late night outings. Premium rayon, relaxed fit.", metaDescLength: 115,
    hasAltText: true, imageCount: 2, imagesWithAlt: 1, descriptionLength: 140,
    issues: [
      { type: 'warning', message: '1 image missing alt text', field: 'images' },
    ],
  },
  {
    id: '4', name: 'Slow Down', slug: 'slow-down', score: 78,
    metaTitle: "Slow Down Tee | Slug's Era", metaTitleLength: 27,
    metaDescription: "Forest green oversized tee with a relaxed sloth.", metaDescLength: 49,
    hasAltText: false, imageCount: 1, imagesWithAlt: 0, descriptionLength: 120,
    issues: [
      { type: 'error', message: 'Meta title too short (27 chars, aim for 50-60)', field: 'meta_title' },
      { type: 'error', message: 'Meta description too short (49 chars, aim for 120-160)', field: 'meta_description' },
      { type: 'warning', message: 'No image alt text set', field: 'images' },
      { type: 'info', message: 'Only 1 product image', field: 'images' },
    ],
  },
  {
    id: '5', name: 'The Slow Club', slug: 'the-slow-club', score: 70,
    metaTitle: '', metaTitleLength: 0,
    metaDescription: '', metaDescLength: 0,
    hasAltText: false, imageCount: 1, imagesWithAlt: 0, descriptionLength: 155,
    issues: [
      { type: 'error', message: 'Missing meta title', field: 'meta_title' },
      { type: 'error', message: 'Missing meta description', field: 'meta_description' },
      { type: 'warning', message: 'No image alt text', field: 'images' },
    ],
  },
  {
    id: '6', name: 'SUNLIGHT & WAVES', slug: 'sunlight-and-waves', score: 65,
    metaTitle: 'SUNLIGHT', metaTitleLength: 8,
    metaDescription: 'A shirt.', metaDescLength: 8,
    hasAltText: false, imageCount: 1, imagesWithAlt: 0, descriptionLength: 90,
    issues: [
      { type: 'error', message: 'Meta title far too short (8 chars)', field: 'meta_title' },
      { type: 'error', message: 'Meta description far too short (8 chars)', field: 'meta_description' },
      { type: 'warning', message: 'Product description under 100 chars', field: 'description' },
      { type: 'warning', message: 'No image alt text', field: 'images' },
    ],
  },
  {
    id: '7', name: 'Classic Embroidered Logo', slug: 'classic-embroidered-logo', score: 72,
    metaTitle: "Classic Embroidered Logo Hoodie | Slug's Era", metaTitleLength: 46,
    metaDescription: "Heavyweight cotton hoodie with subtle embroidered logo on the chest. Built to last.", metaDescLength: 83,
    hasAltText: false, imageCount: 1, imagesWithAlt: 0, descriptionLength: 95,
    issues: [
      { type: 'warning', message: 'Meta description slightly short', field: 'meta_description' },
      { type: 'warning', message: 'Product description under 100 chars', field: 'description' },
      { type: 'warning', message: 'No image alt text', field: 'images' },
    ],
  },
  {
    id: '8', name: 'Vintage Patchwork', slug: 'vintage-patchwork', score: 45,
    metaTitle: '', metaTitleLength: 0,
    metaDescription: '', metaDescLength: 0,
    hasAltText: false, imageCount: 1, imagesWithAlt: 0, descriptionLength: 75,
    issues: [
      { type: 'error', message: 'Missing meta title', field: 'meta_title' },
      { type: 'error', message: 'Missing meta description', field: 'meta_description' },
      { type: 'error', message: 'Product description too short (75 chars)', field: 'description' },
      { type: 'warning', message: 'No image alt text', field: 'images' },
      { type: 'info', message: 'Product is in draft status', field: 'status' },
    ],
  },
];

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
        <motion.circle
          cx="40" cy="40" r="36" stroke={color} strokeWidth="4" fill="none"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

const issueIcon = { error: AlertCircle, warning: AlertTriangle, info: Info };
const issueColor = { error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

export default function SEO() {
  const avgScore = Math.round(mockSEOData.reduce((s, p) => s + p.score, 0) / mockSEOData.length);
  const totalErrors = mockSEOData.reduce((s, p) => s + p.issues.filter(i => i.type === 'error').length, 0);
  const totalWarnings = mockSEOData.reduce((s, p) => s + p.issues.filter(i => i.type === 'warning').length, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SEO Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Optimize your products for search engines</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
          <RefreshCw size={16} /> Re-analyze All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 flex items-center gap-5" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <ScoreCircle score={avgScore} />
          <div>
            <p className="text-white font-bold text-lg">Average Score</p>
            <p className="text-gray-500 text-xs mt-0.5">Across {mockSEOData.length} products</p>
            <p className={`text-xs font-medium mt-1 ${avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {avgScore >= 80 ? '✓ Good' : avgScore >= 60 ? '⚠ Needs improvement' : '✗ Poor'}
            </p>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-gray-400 text-xs uppercase tracking-wider">Errors</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{totalErrors}</p>
          <p className="text-gray-500 text-xs mt-1">Critical issues to fix</p>
        </div>
        <div className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-gray-400 text-xs uppercase tracking-wider">Warnings</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{totalWarnings}</p>
          <p className="text-gray-500 text-xs mt-1">Improvements suggested</p>
        </div>
      </div>

      {/* Product SEO Cards */}
      <div className="space-y-3">
        {mockSEOData.sort((a, b) => a.score - b.score).map((product, i) => {
          const scoreColor = product.score >= 80 ? '#10b981' : product.score >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                       style={{ background: `${scoreColor}15`, color: scoreColor }}>
                    {product.score}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{product.name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Link2 size={10} /> slugsera.com/product/{product.slug}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#ff4757] bg-[#C0132A]/10 hover:bg-[#C0132A]/20 transition-colors">
                  Fix Issues
                </button>
              </div>

              {/* SEO Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <Type size={12} className={product.metaTitleLength >= 30 && product.metaTitleLength <= 60 ? 'text-emerald-400' : 'text-red-400'} />
                  <div>
                    <p className="text-[10px] text-gray-500">Title</p>
                    <p className="text-xs text-white">{product.metaTitleLength}/60</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <FileText size={12} className={product.metaDescLength >= 120 && product.metaDescLength <= 160 ? 'text-emerald-400' : product.metaDescLength > 0 ? 'text-amber-400' : 'text-red-400'} />
                  <div>
                    <p className="text-[10px] text-gray-500">Description</p>
                    <p className="text-xs text-white">{product.metaDescLength}/160</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <ImageIcon size={12} className={product.imagesWithAlt === product.imageCount ? 'text-emerald-400' : 'text-amber-400'} />
                  <div>
                    <p className="text-[10px] text-gray-500">Alt Text</p>
                    <p className="text-xs text-white">{product.imagesWithAlt}/{product.imageCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <Tag size={12} className={product.descriptionLength >= 100 ? 'text-emerald-400' : 'text-amber-400'} />
                  <div>
                    <p className="text-[10px] text-gray-500">Content</p>
                    <p className="text-xs text-white">{product.descriptionLength} chars</p>
                  </div>
                </div>
              </div>

              {/* Issues */}
              {product.issues.length > 0 && (
                <div className="space-y-1.5">
                  {product.issues.map((issue, j) => {
                    const IssueIcon = issueIcon[issue.type];
                    return (
                      <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                           style={{ background: `${issueColor[issue.type]}08` }}>
                        <IssueIcon size={12} style={{ color: issueColor[issue.type] }} />
                        <span className="text-gray-300 text-xs">{issue.message}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
