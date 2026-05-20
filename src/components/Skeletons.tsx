import { motion } from 'framer-motion';

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="image-wrapper bg-[#E8E4E0]/40 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
      <div className="pt-3 lg:pt-4 px-1 space-y-2">
        <div className="h-5 bg-[#E8E4E0]/40 rounded w-3/4" />
        <div className="h-3 bg-[#E8E4E0]/30 rounded w-1/2" />
        <div className="h-4 bg-[#E8E4E0]/40 rounded w-1/4" />
      </div>
    </div>
  );
}

// Products Grid Skeleton
export function ProductsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="animate-pulse border border-[#E8E4E0] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#E8E4E0]/40 rounded w-32" />
        <div className="h-5 bg-[#E8E4E0]/40 rounded w-20" />
      </div>
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-[#E8E4E0]/40 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#E8E4E0]/40 rounded w-2/3" />
          <div className="h-3 bg-[#E8E4E0]/30 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Stat Skeleton (for admin)
export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl p-5" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="space-y-3">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-7 bg-white/5 rounded w-32" />
        <div className="h-3 bg-white/5 rounded w-20" />
      </div>
    </div>
  );
}

// Full page loader with spinner
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div
        className="w-10 h-10 border-2 border-[#E8E4E0] border-t-[#C0132A] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Inline spinner
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <motion.div
      className="border-2 border-current/20 border-t-current rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}
