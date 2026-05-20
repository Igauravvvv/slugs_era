import { Globe, Activity, Shield, Eye, Search, Zap, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export default function SiteOverviewPage() {
  // Static metrics (these would come from real monitoring in production)
  const seoScore = 78;
  const speedScore = 92;
  const uptime = 99.9;

  const seoTasks = [
    { label: 'Meta titles on all pages', done: true },
    { label: 'Meta descriptions on all pages', done: true },
    { label: 'H1 tags present', done: true },
    { label: 'Alt text on images', done: false },
    { label: 'Sitemap.xml configured', done: false },
    { label: 'robots.txt configured', done: true },
    { label: 'Open Graph tags', done: true },
    { label: 'Canonical URLs', done: false },
  ];
  const completedTasks = seoTasks.filter(t => t.done).length;

  const coreWebVitals = [
    { label: 'LCP', value: '2.1s', status: 'Good', desc: 'Largest Contentful Paint' },
    { label: 'INP', value: '89ms', status: 'Good', desc: 'Interaction to Next Paint' },
    { label: 'CLS', value: '0.08', status: 'Fair', desc: 'Cumulative Layout Shift' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Website Overview</h1>

      {/* Site Card */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 flex items-center gap-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="w-12 h-12 rounded-xl bg-[#111111] flex items-center justify-center">
          <span className="text-white font-bold text-sm">SE</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#1A1A1A]">Slug's Era</h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              <span className="text-[10px] font-medium text-[#2E7D32]">Live</span>
            </div>
          </div>
          <p className="text-xs text-[#9E9E9E]">slugsera.com</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226]">Edit Site</button>
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Search size={16} className="text-[#9E9E9E]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Search Engine Optimization</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
          {/* Progress Ring */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E5E5" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#C0392B" strokeWidth="3"
                  strokeDasharray={`${seoScore * 0.88} 88`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#1A1A1A]">{seoScore}%</span>
              </div>
            </div>
            <span className="text-xs text-[#9E9E9E]">SEO Score</span>
          </div>

          <div className="bg-[#FEECEC] rounded-lg p-3 text-center">
            <AlertCircle size={18} className="mx-auto text-[#C0392B] mb-1" />
            <p className="text-xl font-bold text-[#C0392B]">{seoTasks.filter(t => !t.done).length}</p>
            <p className="text-[10px] text-[#C0392B] uppercase tracking-wider font-medium">Issues</p>
          </div>
          <div className="bg-[#FFF8E1] rounded-lg p-3 text-center">
            <AlertTriangle size={18} className="mx-auto text-[#F57F17] mb-1" />
            <p className="text-xl font-bold text-[#F57F17]">2</p>
            <p className="text-[10px] text-[#F57F17] uppercase tracking-wider font-medium">Warnings</p>
          </div>
          <div className="bg-[#E6F4EA] rounded-lg p-3 text-center">
            <CheckCircle size={18} className="mx-auto text-[#2E7D32] mb-1" />
            <p className="text-xl font-bold text-[#2E7D32]">{completedTasks}</p>
            <p className="text-[10px] text-[#2E7D32] uppercase tracking-wider font-medium">Completed</p>
          </div>
        </div>

        <div className="space-y-2">
          {seoTasks.map((task, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              {task.done ? (
                <CheckCircle size={14} className="text-[#2E7D32] flex-shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-[#C0392B] flex-shrink-0" />
              )}
              <span className={`text-sm ${task.done ? 'text-[#6B6B6B]' : 'text-[#1A1A1A] font-medium'}`}>{task.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-[#9E9E9E]" />
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Site Speed</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E5E5" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2E7D32" strokeWidth="3"
                  strokeDasharray={`${speedScore * 0.88} 88`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#2E7D32]">{speedScore}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Excellent</p>
              <p className="text-xs text-[#9E9E9E] mt-1">PageSpeed Insights score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[#9E9E9E]" />
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Uptime</h3>
          </div>
          <p className="text-3xl font-bold text-[#2E7D32]">{uptime}%</p>
          <div className="w-full h-2 bg-[#E6F4EA] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#2E7D32] rounded-full" style={{ width: `${uptime}%` }} />
          </div>
          <p className="text-xs text-[#9E9E9E] mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Eye size={16} className="text-[#9E9E9E]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Core Web Vitals</h3>
          <span className="text-xs text-[#9E9E9E]">· Real visitor experience</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {coreWebVitals.map(v => (
            <div key={v.label} className="border border-[#E5E5E5] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1A1A1A]">{v.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                  v.status === 'Good' ? 'bg-[#E6F4EA] text-[#2E7D32]' : 'bg-[#FFF8E1] text-[#F57F17]'
                }`}>{v.status}</span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{v.value}</p>
              <p className="text-xs text-[#9E9E9E] mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 flex items-center justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-[#F57F17]" />
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Accessibility</h3>
            <p className="text-xs text-[#9E9E9E]">Score: 85/100 — Good, but improvable</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-[#C0392B] border border-[#C0392B] rounded-lg hover:bg-[#FEECEC]">
          View Details
        </button>
      </div>
    </div>
  );
}
