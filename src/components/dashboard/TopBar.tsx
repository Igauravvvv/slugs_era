import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, Moon, Sun, User, Check } from 'lucide-react';
import type { DashboardView } from './Sidebar';

const viewTitles: Record<string, string> = {
  overview: 'Overview',
  products: 'Products',
  'products-new': 'Add Product',
  'products-edit': 'Edit Product',
  drops: 'Seasonal Drops',
  'drops-new': 'New Drop',
  categories: 'Categories',
  orders: 'Orders',
  customers: 'Customers',
  analytics: 'Analytics',
  'site-editor': 'Site Editor',
  media: 'Media Library',
  settings: 'Settings',
};

const viewSubtitles: Record<string, string> = {
  overview: 'Dashboard analytics & quick actions',
  products: 'Manage your product catalog',
  'products-new': 'Create a new product listing',
  'products-edit': 'Update product details',
  drops: 'Manage seasonal collections',
  'drops-new': 'Create a new seasonal drop',
  categories: 'Organize your product categories',
  orders: 'Track and manage customer orders',
  customers: 'View and manage your customers',
  analytics: 'Sales performance & insights',
  'site-editor': 'Edit your storefront sections',
  media: 'Browse and manage uploaded media',
  settings: 'Configure your store preferences',
};

interface TopBarProps {
  activeView: DashboardView;
  onOpenMobileMenu: () => void;
  userEmail: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSearch?: (query: string) => void;
}

export default function TopBar({
  activeView,
  onOpenMobileMenu,
  userEmail,
  darkMode,
  onToggleDarkMode,
  onSearch,
}: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const title = viewTitles[activeView] || 'Dashboard';
  const subtitle = viewSubtitles[activeView] || '';

  return (
    <header className="cms-topbar">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden cms-topbar-btn"
          onClick={onOpenMobileMenu}
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div>
          <h1 className="cms-topbar-title">{title}</h1>
          <p className="cms-topbar-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="overflow-hidden"
              onSubmit={handleSearchSubmit}
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder="Search products, drops..."
                className="cms-search-input"
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
              />
            </motion.form>
          )}
        </AnimatePresence>
        <button
          className="cms-topbar-btn"
          onClick={() => setSearchOpen(!searchOpen)}
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Dark mode toggle */}
        <button
          className="cms-topbar-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="cms-topbar-btn relative"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8A96E] animate-pulse" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="cms-notif-dropdown"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                  <span className="text-sm font-semibold text-[#F5F5F5]">Notifications</span>
                  <button className="text-[10px] font-medium text-[#C8A96E] hover:text-[#D4B87A] flex items-center gap-1">
                    <Check size={10} /> Mark all read
                  </button>
                </div>
                <div className="py-6 text-center">
                  <Bell size={24} className="mx-auto text-[#333] mb-2" />
                  <p className="text-xs text-[#666]">No new notifications</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="cms-topbar-divider" />
        <div className="flex items-center gap-2.5">
          <div className="cms-avatar">
            <User size={14} />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#F5F5F5] truncate max-w-[120px]">
              {userEmail?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[10px] text-[#666]">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
