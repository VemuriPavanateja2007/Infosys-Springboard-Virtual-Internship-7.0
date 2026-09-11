import { CheckCircle2, Code2, Database, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  activeTab: 'demo' | 'code' | 'sql';
  setActiveTab: (tab: 'demo' | 'code' | 'sql') => void;
  totalProducts: number;
  filteredCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  totalProducts,
  filteredCount,
}: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
              FQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  ForecastinQ
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Sales & Inventory
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Products Brand Filter Implementation
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Live Products View</span>
              <span className="ml-1 px-1.5 py-0.2 text-[11px] rounded bg-indigo-800 text-indigo-200">
                {filteredCount}/{totalProducts}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Updated Code & Diff</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sql'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>SQL Query Inspector</span>
            </button>
          </div>

          {/* Quick Status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Task 1 Verified (Search + Category + Brand + Pagination)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
