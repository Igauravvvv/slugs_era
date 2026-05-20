import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Layers, FolderOpen, Palette,
  Image, ChevronLeft, ChevronRight, LogOut, ExternalLink,
  X, Sparkles, ShoppingCart, Users, BarChart3, Settings,
} from 'lucide-react';

export type DashboardView =
  | 'overview'
  | 'products'
  | 'products-new'
  | 'products-edit'
  | 'drops'
  | 'drops-new'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'site-editor'
  | 'media'
  | 'settings';

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'drops', label: 'Seasonal Drops', icon: Layers },
      { id: 'categories', label: 'Categories', icon: FolderOpen },
    ],
  },
  {
    title: 'COMMERCE',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { id: 'site-editor', label: 'Site Editor', icon: Palette },
      { id: 'media', label: 'Media Library', icon: Image },
    ],
  },
];

interface SidebarProps {
  activeView: DashboardView;
  onNavigate: (view: DashboardView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  onGoToStore: () => void;
}

export default function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onSignOut,
  onGoToStore,
}: SidebarProps) {
  // Determine which nav item is "active" — products-new and products-edit map to products
  const activeNav = activeView.startsWith('products') ? 'products'
    : activeView.startsWith('drops') ? 'drops'
    : activeView;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`cms-sidebar fixed lg:relative z-50 h-full flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: collapsed ? 72 : 260 }}
      >
        {/* Logo Area */}
        <div className="cms-sidebar-header flex items-center justify-between px-4 h-16 flex-shrink-0">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="cms-logo-mark">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="cms-logo-text">SLUGSERA</span>
                <p className="cms-logo-sub">Dashboard</p>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div className="cms-logo-mark mx-auto">
              <Sparkles size={16} />
            </div>
          )}
          <button
            className="hidden lg:flex cms-sidebar-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            className="lg:hidden cms-sidebar-toggle"
            onClick={onCloseMobile}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <div className="cms-nav-label">{section.title}</div>
              )}
              {collapsed && <div className="h-px bg-[#2A2A2A] mx-2 my-2" />}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`cms-nav-item ${isActive ? 'cms-nav-item--active' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="cms-active-nav"
                          className="cms-nav-indicator"
                          transition={{ type: 'spring', damping: 30, stiffness: 500 }}
                        />
                      )}
                      <item.icon size={18} className="flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="cms-nav-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="cms-sidebar-footer px-3 py-3 space-y-1">
          <button
            onClick={() => {
              onNavigate('settings');
              onCloseMobile();
            }}
            className={`cms-nav-item ${activeNav === 'settings' ? 'cms-nav-item--active' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            {activeNav === 'settings' && (
              <motion.div
                layoutId="cms-active-nav"
                className="cms-nav-indicator"
                transition={{ type: 'spring', damping: 30, stiffness: 500 }}
              />
            )}
            <Settings size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </button>
          <button
            onClick={onGoToStore}
            className="cms-nav-item"
            title={collapsed ? 'View Store' : undefined}
          >
            <ExternalLink size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">View Store</span>}
          </button>
          <button
            onClick={onSignOut}
            className="cms-nav-item cms-nav-item--danger"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
