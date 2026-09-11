import { useState, useMemo } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LoginView, AuthUser } from './components/LoginView';
import { ProductsTable } from './components/ProductsTable';
import { ProductModal } from './components/ProductModal';
import { SqlInspector } from './components/SqlInspector';
import { CodeViewer } from './components/CodeViewer';
import { OtherViews } from './components/OtherViews';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
} from './data/mockProducts';
import { Category, FilterState, Product, Supplier } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  // Authentication State (defaults to logged-in user; user can sign out to test login page)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 1,
    name: 'Alex Vance',
    email: 'admin@forecastinq.com',
    role: 'admin',
  });

  // Navigation State - Options on the LEFT sidebar
  const [currentTab, setCurrentTab] = useState<NavTab>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Products Filter State (includes Brand filter, Search, Category, and Page)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 0,
    brand: '',
    page: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Active items count
  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products],
  );

  // Low stock items count for restocking notification
  const lowStockCount = useMemo(
    () => activeProducts.filter((p) => p.stock_quantity <= p.min_stock_level).length,
    [activeProducts],
  );

  // Compute total filtered items
  const filteredCount = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.product_code.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) return false;
      }
      if (filters.category !== 0 && p.category_id !== filters.category) {
        return false;
      }
      if (
        filters.brand &&
        p.brand.toLowerCase() !== filters.brand.toLowerCase()
      ) {
        return false;
      }
      return true;
    }).length;
  }, [products, filters.search, filters.category, filters.brand]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'inactive' } : p)),
    );
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (productData.id) {
      // Edit
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productData.id) {
            const cat = categories.find((c) => c.id === productData.category_id);
            const sup = suppliers.find((s) => s.id === productData.supplier_id);
            return {
              ...p,
              ...productData,
              category_name: cat?.name || p.category_name,
              supplier_name: sup?.name || p.supplier_name,
            } as Product;
          }
          return p;
        }),
      );
    } else {
      // Add
      const nextId = Math.max(...products.map((p) => p.id), 0) + 1;
      const productCode = `PRD${String(nextId).padStart(3, '0')}`;
      const cat = categories.find((c) => c.id === productData.category_id);
      const sup = suppliers.find((s) => s.id === productData.supplier_id);

      const newProduct: Product = {
        id: nextId,
        product_code: productCode,
        name: productData.name || '',
        category_id: productData.category_id || 1,
        category_name: cat?.name || 'General',
        brand: productData.brand || '',
        supplier_id: productData.supplier_id || 1,
        supplier_name: sup?.name || 'TechSource India',
        cost_price: Number(productData.cost_price || 0),
        selling_price: Number(productData.selling_price || 0),
        stock_quantity: Number(productData.stock_quantity || 0),
        min_stock_level: Number(productData.min_stock_level || 10),
        reorder_quantity: Number(productData.reorder_quantity || 50),
        description: productData.description || '',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const handleNavigateToProducts = (brand?: string) => {
    if (brand !== undefined) {
      setFilters((prev) => ({ ...prev, brand, page: 1 }));
    }
    setCurrentTab('products');
  };

  // If user is logged out, render the login page!
  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} />;
  }

  // Get display title for topbar
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'products':
        return 'Products';
      case 'inventory':
        return 'Inventory Management';
      case 'restocking':
        return 'Restocking Alerts';
      case 'sales':
        return 'Sales Operations';
      case 'customers':
        return 'Customer Directory';
      case 'suppliers':
        return 'Supplier Directory';
      case 'forecasting':
        return 'Demand Forecasting';
      case 'reports':
        return 'Business Reports';
      case 'code':
        return 'Source Code & Implementation';
      case 'sql':
        return 'SQL Query Inspector';
      case 'users':
        return 'User Management';
      case 'settings':
        return 'Application Settings';
      default:
        return 'Products';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Left-Side Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lowStockCount={lowStockCount}
        productsCount={activeProducts.length}
      />

      {/* 2. Main Content Area (padded on the left for the sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar
          title={getTabTitle(currentTab)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          activeBrand={filters.brand || undefined}
          lowStockCount={lowStockCount}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'products' && (
            <ProductsTable
              products={products}
              categories={categories}
              suppliers={suppliers}
              filters={filters}
              onFilterChange={handleFilterChange}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentTab === 'code' && <CodeViewer />}

          {currentTab === 'sql' && (
            <SqlInspector filters={filters} totalFiltered={filteredCount} />
          )}

          {currentTab !== 'products' &&
            currentTab !== 'code' &&
            currentTab !== 'sql' && (
              <OtherViews
                currentTab={currentTab}
                onNavigateToProducts={handleNavigateToProducts}
                products={products}
              />
            )}
        </main>

        {/* Professional Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <strong>ForecastinQ</strong> • Intelligent Sales Forecasting & Inventory Management
            </div>
            <div>
              Product Brand Filter • SQL parameter binding & pagination preserved
            </div>
          </div>
        </footer>
      </div>

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
}
