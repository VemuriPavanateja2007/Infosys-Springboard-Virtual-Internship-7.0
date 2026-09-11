import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  PackageOpen,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Tag,
  Building2,
} from 'lucide-react';
import { Category, FilterState, Product, Supplier } from '../types';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
}

export function ProductsTable({
  products,
  categories,
  suppliers: _suppliers,
  filters,
  onFilterChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
}: ProductsTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Extract all unique brands from active products
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.status === 'active' && p.brand && p.brand.trim() !== '') {
        brandsSet.add(p.brand.trim());
      }
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Apply SQL-equivalent filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;

      // Search filter (name contains search text)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.product_code.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) return false;
      }

      // Category filter (WHERE p.category_id = ?)
      if (filters.category !== 0) {
        if (p.category_id !== filters.category) return false;
      }

      // Brand filter (Task 1: WHERE p.brand = ?)
      if (filters.brand) {
        if (p.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      }

      return true;
    });
  }, [products, filters.search, filters.category, filters.brand]);

  // Pagination calculation: 10 items per page
  const perPage = 10;
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);

  const paginatedProducts = useMemo(() => {
    const offset = (currentPage - 1) * perPage;
    return filteredProducts.slice(offset, offset + perPage);
  }, [filteredProducts, currentPage]);

  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStockBadge = (p: Product) => {
    if (p.stock_quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          Out of Stock
        </span>
      );
    }
    if (p.stock_quantity <= p.min_stock_level) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        In Stock
      </span>
    );
  };

  const hasActiveFilters =
    filters.search || filters.category !== 0 || filters.brand !== '';

  const clearAllFilters = () => {
    onFilterChange({ search: '', category: 0, brand: '', page: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar matching ForecastinQ templates/products/index.html */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="searchInput"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) =>
                  onFilterChange({ search: e.target.value, page: 1 })
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="w-44">
              <select
                id="catFilter"
                value={filters.category}
                onChange={(e) =>
                  onFilterChange({ category: Number(e.target.value), page: 1 })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value={0}>All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter Dropdown (TASK 1) */}
            <div className="w-48 relative">
              <select
                id="brandFilter"
                value={filters.brand}
                onChange={(e) =>
                  onFilterChange({ brand: e.target.value, page: 1 })
                }
                className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                  filters.brand
                    ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-950 font-semibold shadow-xs'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              >
                <option value="">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Active Filters Pill display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                Search: "{filters.search}"
                <button
                  onClick={() => onFilterChange({ search: '', page: 1 })}
                  className="hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category !== 0 && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 border border-indigo-200">
                Category:{' '}
                {categories.find((c) => c.id === filters.category)?.name}
                <button
                  onClick={() => onFilterChange({ category: 0, page: 1 })}
                  className="hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center gap-1 bg-indigo-100 px-2 py-0.5 rounded text-indigo-900 font-semibold border border-indigo-300 shadow-2xs">
                <Tag className="w-3 h-3" />
                Brand: {filters.brand}
                <button
                  onClick={() => onFilterChange({ brand: '', page: 1 })}
                  className="hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              </span>
            )}
            <span className="ml-auto text-slate-400">
              Found {totalItems} matching {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}
      </div>

      {/* Main Table Card matching ForecastinQ styles */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Product Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Showing {paginatedProducts.length} of {totalItems} active items
              {filters.brand ? ` filtered by brand "${filters.brand}"` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live SQLite Synchronization</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Code</th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Brand</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Cost</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Stock</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <PackageOpen className="w-10 h-10 text-slate-300" />
                      <p className="text-base font-medium text-slate-700">
                        No products found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No products match your current filters. Try relaxing
                        your search, category, or brand filter.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isMatchingBrand =
                    filters.brand &&
                    p.brand.toLowerCase() === filters.brand.toLowerCase();

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isMatchingBrand ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.product_code}
                        </span>
                      </td>

                      {/* Product Name & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{p.description || 'No description'}</span>
                        </div>
                      </td>

                      {/* Brand Pill (Task 1 focus) */}
                      <td className="py-3.5 px-4">
                        {p.brand ? (
                          <button
                            onClick={() =>
                              onFilterChange({ brand: p.brand, page: 1 })
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                              isMatchingBrand
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800'
                            }`}
                            title={`Filter by brand: ${p.brand}`}
                          >
                            <Building2 className="w-3 h-3" />
                            {p.brand}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            —
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {p.category_name ||
                            categories.find((c) => c.id === p.category_id)
                              ?.name ||
                            '—'}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {fmtCurrency(p.cost_price)}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fmtCurrency(p.selling_price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {p.stock_quantity}
                          </span>
                          <span className="text-xs text-slate-400">
                            / {p.min_stock_level} min
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">{getStockBadge(p)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteProduct(p.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              title="Delete Product"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching ForecastinQ templates/products/index.html */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50/60 gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Showing page{' '}
              <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span>
              <span className="ml-2 font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                URL Query: ?page={currentPage}
                {filters.search
                  ? `&search=${encodeURIComponent(filters.search)}`
                  : ''}
                {filters.category ? `&category=${filters.category}` : ''}
                {filters.brand
                  ? `&brand=${encodeURIComponent(filters.brand)}`
                  : ''}
              </span>
            </div>

            <nav aria-label="Product table pagination">
              <ul className="flex items-center gap-1 text-sm font-medium">
                {/* Previous Page */}
                <li>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() =>
                      onFilterChange({ page: Math.max(1, currentPage - 1) })
                    }
                    className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </li>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <li key={pageNum}>
                      <button
                        onClick={() => onFilterChange({ page: pageNum })}
                        className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                          pageNum === currentPage
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ),
                )}

                {/* Next Page */}
                <li>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      onFilterChange({
                        page: Math.min(totalPages, currentPage + 1),
                      })
                    }
                    className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
