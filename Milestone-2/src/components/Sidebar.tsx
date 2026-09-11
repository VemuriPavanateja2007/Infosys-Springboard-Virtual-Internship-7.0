import {
  LayoutDashboard,
  Package,
  Archive,
  RotateCcw,
  ShoppingCart,
  Users,
  Truck,
  TrendingUp,
  FileBarChart,
  UserCog,
  Settings,
  LogOut,
  Code2,
  Database,
  X,
} from 'lucide-react';
import { AuthUser } from './LoginView';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'restocking'
  | 'sales'
  | 'customers'
  | 'suppliers'
  | 'forecasting'
  | 'reports'
  | 'code'
  | 'sql'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: AuthUser;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  lowStockCount: number;
  productsCount: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  lowStockCount,
  productsCount,
}: SidebarProps) {
  const navSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Inventory',
      items: [
        {
          id: 'products' as NavTab,
          label: 'Products',
          icon: Package,
          badge: productsCount ? `${productsCount}` : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        },
        { id: 'inventory' as NavTab, label: 'Inventory', icon: Archive },
        {
          id: 'restocking' as NavTab,
          label: 'Restocking',
          icon: RotateCcw,
          badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { id: 'sales' as NavTab, label: 'Sales', icon: ShoppingCart },
        { id: 'customers' as NavTab, label: 'Customers', icon: Users },
        { id: 'suppliers' as NavTab, label: 'Suppliers', icon: Truck },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'forecasting' as NavTab, label: 'Forecasting', icon: TrendingUp },
        { id: 'reports' as NavTab, label: 'Reports', icon: FileBarChart },
      ],
    },
    {
      title: 'Implementation',
      items: [
        { id: 'code' as NavTab, label: 'Source Code & Diff', icon: Code2 },
        { id: 'sql' as NavTab, label: 'SQL Query Inspector', icon: Database },
      ],
    },
    {
      title: 'Admin',
      items: [
        { id: 'users' as NavTab, label: 'User Management', icon: UserCog },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container on the LEFT side */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0f172a] text-slate-300 flex flex-col z-50 transition-transform duration-200 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-bold text-lg">
              📈
            </div>
            <div>
              <div className="font-bold text-white tracking-tight text-base font-mono leading-none">
                Forecastin<span className="text-cyan-400">Q</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
                Sales & Inventory
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-xs">
            {currentUser.name ? currentUser.name[0] : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List organized by Sections */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-thin">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Logout button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
