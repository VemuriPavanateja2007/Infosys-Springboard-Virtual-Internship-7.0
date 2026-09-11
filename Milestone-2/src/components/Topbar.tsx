import { useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut, Tag, ShieldCheck } from 'lucide-react';
import { AuthUser } from './LoginView';

interface TopbarProps {
  title: string;
  onToggleSidebar: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
  activeBrand?: string;
  lowStockCount: number;
}

export function Topbar({
  title,
  onToggleSidebar,
  currentUser,
  onLogout,
  activeBrand,
  lowStockCount,
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left side: Hamburger button + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {activeBrand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Tag className="w-3 h-3" />
                Brand: {activeBrand}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right side: Alerts, Status, User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs">
              <div className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Inventory Alerts</span>
                <span className="text-[10px] font-normal text-slate-400">Real-time</span>
              </div>
              <div className="mt-2 space-y-2">
                {lowStockCount > 0 ? (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <div>
                      <div className="font-semibold">{lowStockCount} items low on stock</div>
                      <div className="text-[11px] text-amber-700">Check the Restocking or Products view.</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-2 text-center">No new inventory alerts</div>
                )}
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Brand Filter Active</div>
                    <div className="text-[11px] text-indigo-700">Parameter-bound SQL query enabled</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-700"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
              {currentUser.name ? currentUser.name[0] : 'U'}
            </div>
            <span className="hidden sm:inline font-medium text-slate-800">{currentUser.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-1">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
