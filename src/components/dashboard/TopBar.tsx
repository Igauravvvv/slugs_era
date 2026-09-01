import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, Moon, Sun, User, Check } from 'lucide-react';
import type { DashboardView } from './Sidebar';
import { useMarkNotificationsRead, useNotifications } from '@/hooks/useNotifications';
import { useDashboardToast } from '@/store/dashboardToast';

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
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const addToast = useDashboardToast((state) => state.addToast);
  const seenOrderNotifications = useRef(new Set<string>());
  const orderNotificationsInitialized = useRef(false);
  const unread = (notifications.data || []).filter((item) => !item.is_read);

  useEffect(() => {
    const newOrderNotifications = (notifications.data || []).filter((item) => item.type === 'new_order');
    const unseen = newOrderNotifications.filter((item) => !seenOrderNotifications.current.has(item.id));
    if (orderNotificationsInitialized.current && unseen.length > 0) {
      const latest = unseen[0];
      addToast({
        type: 'info',
        title: 'You received an order',
        message: latest.message || 'A new order was added to your order list.',
      });
    }
    newOrderNotifications.forEach((item) => seenOrderNotifications.current.add(item.id));
    orderNotificationsInitialized.current = true;
  }, [addToast, notifications.data]);

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
                placeholder="Search products..."
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
            {unread.length > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[var(--cms-accent)] text-white text-[9px] font-bold flex items-center justify-center">{unread.length > 9 ? '9+' : unread.length}</span>}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="cms-notif-dropdown"
              >
                <div className="flex items-center justify-between p-4 border-b border-[var(--cms-border)]">
                  <span className="text-sm font-semibold text-[var(--cms-text)]">Notifications</span>
                  <button disabled={unread.length === 0 || markRead.isPending} onClick={() => markRead.mutate(undefined)} className="text-[10px] font-medium text-[var(--cms-accent)] disabled:opacity-40 flex items-center gap-1">
                    <Check size={10} /> Mark all read
                  </button>
                </div>
                {notifications.isLoading ? <div className="py-6 text-center text-xs text-[var(--cms-text-muted)]">Loading notifications…</div> : unread.length === 0 ? <div className="py-6 text-center"><Bell size={24} className="mx-auto text-[var(--cms-text-muted)] mb-2" /><p className="text-xs text-[var(--cms-text-secondary)]">You are all caught up</p></div> : <div className="divide-y divide-[var(--cms-border)]">{unread.slice(0, 8).map((item) => <button key={item.id} onClick={() => markRead.mutate([item.id])} className="w-full text-left p-4 hover:bg-[var(--cms-surface-2)] transition-colors"><p className="text-xs font-semibold text-[var(--cms-text)]">{item.type === 'new_order' ? 'You received an order' : item.title}</p>{item.message && <p className="text-[11px] text-[var(--cms-text-secondary)] mt-1 line-clamp-2">{item.message}</p>}<p className="text-[10px] text-[var(--cms-text-muted)] mt-1.5">{new Date(item.created_at).toLocaleString('en-IN')}</p></button>)}</div>}
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
            <p className="text-xs font-semibold text-[var(--cms-text)] truncate max-w-[120px]">
              {userEmail?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[10px] text-[var(--cms-text-muted)]">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
