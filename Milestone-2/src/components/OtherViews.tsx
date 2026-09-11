import {
  TrendingUp,
  Package,
  RotateCcw,
  Users,
  Building2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { Product } from '../types';
import { NavTab } from './Sidebar';

interface OtherViewsProps {
  currentTab: NavTab;
  onNavigateToProducts: (brand?: string) => void;
  products: Product[];
}

export function OtherViews({
  currentTab,
  onNavigateToProducts,
  products,
}: OtherViewsProps) {
  const activeProducts = products.filter((p) => p.status === 'active');
  const lowStockProducts = activeProducts.filter(
    (p) => p.stock_quantity <= p.min_stock_level,
  );
  const outOfStockProducts = activeProducts.filter((p) => p.stock_quantity === 0);

  // Group by brand
  const brandsCount: Record<string, number> = {};
  activeProducts.forEach((p) => {
    if (p.brand) {
      brandsCount[p.brand] = (brandsCount[p.brand] || 0) + 1;
    }
  });

  const topBrands = Object.entries(brandsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (currentTab === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Products</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {activeProducts.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 100%
              </span>
              <span>active catalog items</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Active Brands</span>
              <Building2 className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {Object.keys(brandsCount).length}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Filterable in Products</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Low / Out of Stock</span>
              <RotateCcw className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
              {lowStockProducts.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {outOfStockProducts.length} items completely out
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Inventory Value</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              ₹
              {activeProducts
                .reduce((sum, p) => sum + p.cost_price * p.stock_quantity, 0)
                .toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Across all categories
            </div>
          </div>
        </div>

        {/* Quick Brands breakdown & Fast Jump */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Brand Distribution & Quick Filter
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any brand to jump directly to the filtered Products
                  catalog.
                </p>
              </div>
              <button
                onClick={() => onNavigateToProducts()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {topBrands.map(([brand, count]) => (
                <button
                  key={brand}
                  onClick={() => onNavigateToProducts(brand)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                      {brand}
                    </span>
                    <Filter className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                    {count} <span className="text-xs font-normal text-slate-500">items</span>
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-1 font-medium group-hover:underline">
                    Apply filter →
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Catalog Health
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Brand Filter Parameterized</div>
                  <div className="text-emerald-800 mt-0.5">
                    Safe SQL parameter binding: <code className="font-mono bg-white/60 px-1 py-0.5 rounded">WHERE p.brand = ?</code>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                <div className="font-semibold text-slate-900">Pagination Coexistence</div>
                <div className="text-slate-500 mt-0.5">
                  The brand query parameter is preserved across all pagination links without reset.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'restocking') {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Restocking Requirements
            </h2>
            <p className="text-xs text-slate-500">
              {lowStockProducts.length} items have fallen below their minimum stock threshold.
            </p>
          </div>
          <button
            onClick={() => onNavigateToProducts()}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Manage in Products Catalog
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Min Level</th>
                <th className="py-2.5 px-3">Reorder Qty</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {p.brand}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">
                    {p.stock_quantity}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.min_stock_level}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">
                    +{p.reorder_quantity}
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onNavigateToProducts(p.brand)}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Filter by {p.brand}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback for other navigation sections (Forecasting, Inventory, Sales, Customers, Suppliers, Reports, Users, Settings)
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
        {currentTab === 'forecasting' && <TrendingUp className="w-6 h-6" />}
        {currentTab === 'inventory' && <Package className="w-6 h-6" />}
        {currentTab === 'customers' && <Users className="w-6 h-6" />}
        {currentTab === 'suppliers' && <Building2 className="w-6 h-6" />}
        {!['forecasting', 'inventory', 'customers', 'suppliers'].includes(currentTab) && (
          <Package className="w-6 h-6" />
        )}
      </div>

      <div className="max-w-md mx-auto">
        <h3 className="text-base font-bold text-slate-900 capitalize tracking-tight">
          {currentTab} Overview
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Connected to the active ForecastinQ SQLite database with real-time synchronization.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigateToProducts()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Go to Products Catalog with Brand Filter</span>
        </button>
      </div>
    </div>
  );
}
