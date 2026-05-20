import { motion } from 'framer-motion';

function Pulse({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`cms-skeleton ${className}`}
      style={style}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/** Skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="cms-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Pulse className="rounded-lg" style={{ width: 40, height: 40 }} />
        <Pulse className="rounded-md" style={{ width: 60, height: 20 }} />
      </div>
      <Pulse className="rounded-md mb-2" style={{ width: '60%', height: 28 }} />
      <Pulse className="rounded-md" style={{ width: '40%', height: 14 }} />
    </div>
  );
}

/** Skeleton for the overview stat row */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a table row */
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[#2A2A2A]">
      <Pulse className="rounded-md flex-shrink-0" style={{ width: 40, height: 40 }} />
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <Pulse
          key={i}
          className="rounded-md flex-1"
          style={{ height: 16, maxWidth: i === 0 ? 160 : 80 }}
        />
      ))}
    </div>
  );
}

/** Skeleton for a product table */
export function ProductTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="cms-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#2A2A2A]">
        {['Thumb', 'Name', 'Category', 'Price', 'Stock', 'Status'].map((h) => (
          <Pulse
            key={h}
            className="rounded-md flex-1"
            style={{ height: 12, maxWidth: h === 'Thumb' ? 40 : h === 'Name' ? 140 : 70 }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a card (drop card, category card) */
export function CardSkeleton() {
  return (
    <div className="cms-card overflow-hidden">
      <Pulse style={{ width: '100%', height: 180 }} />
      <div className="p-4 space-y-3">
        <Pulse className="rounded-md" style={{ width: '70%', height: 18 }} />
        <Pulse className="rounded-md" style={{ width: '50%', height: 14 }} />
        <div className="flex gap-2">
          <Pulse className="rounded-full" style={{ width: 60, height: 24 }} />
          <Pulse className="rounded-full" style={{ width: 60, height: 24 }} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the media grid */
export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cms-card overflow-hidden">
          <Pulse style={{ width: '100%', aspectRatio: '1', display: 'block' }} />
          <div className="p-2">
            <Pulse className="rounded-md" style={{ width: '80%', height: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the hero editor */
export function HeroEditorSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview */}
      <div className="cms-card overflow-hidden">
        <Pulse style={{ width: '100%', height: 400 }} />
      </div>
      {/* Controls */}
      <div className="cms-card p-6 space-y-6">
        <Pulse className="rounded-md" style={{ width: '40%', height: 20 }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Pulse className="rounded-md" style={{ width: 80, height: 12 }} />
            <Pulse className="rounded-lg" style={{ width: '100%', height: 40 }} />
          </div>
        ))}
        <Pulse className="rounded-lg" style={{ width: 120, height: 40 }} />
      </div>
    </div>
  );
}

/** Full page skeleton */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <Pulse className="rounded-md" style={{ width: 200, height: 28 }} />
        <Pulse className="rounded-lg" style={{ width: 120, height: 40 }} />
      </div>
      <StatsGridSkeleton />
      <ProductTableSkeleton />
    </div>
  );
}
