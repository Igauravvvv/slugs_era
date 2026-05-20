import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Eye, EyeOff, Layers, Star, ShoppingBag,
  Plus, Palette, ArrowUpRight, TrendingUp, Box,
} from 'lucide-react';
import { fetchDashboardStats, fetchRecentProducts } from '@/lib/queries';
import { StatsGridSkeleton } from '@/components/dashboard/SkeletonLoader';
import type { DashboardStats, Product } from '@/types/dashboard';
import type { DashboardView } from '@/components/dashboard/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (view: DashboardView) => void;
}

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } },
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={stagger.item}
      className="cms-card cms-card--hover p-5 relative overflow-hidden group"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ background: gradient }}
      />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#4CAF50] uppercase tracking-wider">
          <TrendingUp size={10} />
          Live
        </div>
      </div>
      <p className="text-2xl font-bold text-[#F5F5F5] mb-1 relative z-10 font-heading">
        {value}
      </p>
      <p className="text-xs text-[#888] relative z-10">{label}</p>
      {sub && <p className="text-[10px] text-[#555] mt-1 relative z-10">{sub}</p>}
    </motion.div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cms-card cms-card--hover p-4 flex items-center gap-3 group w-full text-left"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: gradient }}
      >
        <Icon size={16} className="text-white" />
      </div>
      <span className="text-sm font-medium text-[#F5F5F5] flex-1">{label}</span>
      <ArrowUpRight
        size={14}
        className="text-[#555] group-hover:text-[#C8A96E] transition-colors"
      />
    </motion.button>
  );
}

function RecentProductRow({ product, index }: { product: Product; index: number }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 25 }}
      className="flex items-center gap-4 px-4 py-3 hover:bg-[#1A1A1A]/50 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0 border border-[#2A2A2A]">
        {primaryImage?.url ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={14} className="text-[#555]" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F5F5F5] truncate">{product.name}</p>
        <p className="text-[10px] text-[#666] truncate">
          {product.category && <span className="capitalize">{product.category}</span>}
          {product.season && <span> · {product.season}</span>}
        </p>
      </div>

      {/* Price */}
      <p className="text-sm font-semibold text-[#C8A96E] flex-shrink-0">
        ₹{Number(product.price).toLocaleString('en-IN')}
      </p>

      {/* Status */}
      <div className="flex-shrink-0">
        {product.is_published ? (
          <span className="cms-badge cms-badge--success">Live</span>
        ) : (
          <span className="cms-badge cms-badge--draft">Draft</span>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [statsData, productsData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentProducts(5),
        ]);
        if (mounted) {
          setStats(statsData);
          setRecentProducts(productsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsGridSkeleton />
        <div className="cms-card p-6">
          <div className="cms-skeleton rounded-md mb-4" style={{ width: 200, height: 20 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3">
              <div className="cms-skeleton rounded-lg" style={{ width: 40, height: 40 }} />
              <div className="flex-1 space-y-2">
                <div className="cms-skeleton rounded-md" style={{ width: '60%', height: 14 }} />
                <div className="cms-skeleton rounded-md" style={{ width: '30%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">
            Welcome back to SLUGSERA
          </h2>
          <p className="text-sm text-[#888] mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#666]">
          <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
          All systems operational
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger.container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          sub={`${stats?.featuredProducts ?? 0} featured`}
          gradient="linear-gradient(135deg, #C8A96E, #A8894E)"
        />
        <StatCard
          icon={Eye}
          label="Published"
          value={stats?.publishedProducts ?? 0}
          sub={`${stats?.draftProducts ?? 0} drafts`}
          gradient="linear-gradient(135deg, #4CAF50, #388E3C)"
        />
        <StatCard
          icon={Layers}
          label="Active Drops"
          value={stats?.activeDrops ?? 0}
          sub="Seasonal collections"
          gradient="linear-gradient(135deg, #7C4DFF, #651FFF)"
        />
        <StatCard
          icon={Box}
          label="Total Stock"
          value={stats?.totalStock?.toLocaleString('en-IN') ?? 0}
          sub={`${stats?.totalCategories ?? 0} categories`}
          gradient="linear-gradient(135deg, #FF6B35, #E55520)"
        />
      </motion.div>

      {/* Quick Actions + Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={stagger.item} className="space-y-3">
          <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider px-1">
            Quick Actions
          </h3>
          <QuickActionButton
            icon={Plus}
            label="Add New Product"
            onClick={() => onNavigate('products-new')}
            gradient="linear-gradient(135deg, #C8A96E, #A8894E)"
          />
          <QuickActionButton
            icon={Layers}
            label="Create New Drop"
            onClick={() => onNavigate('drops-new')}
            gradient="linear-gradient(135deg, #7C4DFF, #651FFF)"
          />
          <QuickActionButton
            icon={Palette}
            label="Edit Hero Section"
            onClick={() => onNavigate('site-editor')}
            gradient="linear-gradient(135deg, #FF6B35, #E55520)"
          />
          <QuickActionButton
            icon={ShoppingBag}
            label="View All Products"
            onClick={() => onNavigate('products')}
            gradient="linear-gradient(135deg, #00BCD4, #0097A7)"
          />
        </motion.div>

        {/* Recent Products */}
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
              Latest Products
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-[#C8A96E] hover:text-[#D4B87A] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="cms-card overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#2A2A2A] text-[10px] font-semibold text-[#666] uppercase tracking-wider">
              <span className="w-10 flex-shrink-0"></span>
              <span className="flex-1">Product</span>
              <span className="flex-shrink-0 w-20 text-right">Price</span>
              <span className="flex-shrink-0 w-16 text-center">Status</span>
            </div>

            {recentProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={32} className="mx-auto text-[#333] mb-3" />
                <p className="text-sm text-[#666]">No products yet</p>
                <button
                  onClick={() => onNavigate('products-new')}
                  className="cms-btn cms-btn--primary mt-4 text-xs"
                >
                  <Plus size={14} />
                  Add your first product
                </button>
              </div>
            ) : (
              recentProducts.map((product, index) => (
                <RecentProductRow key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Brand Stats Footer */}
      <motion.div
        variants={stagger.item}
        className="cms-card p-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A96E] to-[#A8894E] flex items-center justify-center">
            <Star size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F5F5F5]">SLUGSERA CMS</p>
            <p className="text-[10px] text-[#666]">Visual Content Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#666]">
          <span>Products: <strong className="text-[#F5F5F5]">{stats?.totalProducts ?? 0}</strong></span>
          <span>Published: <strong className="text-[#4CAF50]">{stats?.publishedProducts ?? 0}</strong></span>
          <span>Drops: <strong className="text-[#7C4DFF]">{stats?.activeDrops ?? 0}</strong></span>
        </div>
      </motion.div>
    </motion.div>
  );
}
