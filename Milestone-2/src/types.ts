export interface Product {
  id: number;
  product_code: string;
  name: string;
  category_id: number | null;
  category_name?: string;
  brand: string;
  supplier_id: number | null;
  supplier_name?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  reorder_quantity: number;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
}

export interface FilterState {
  search: string;
  category: number;
  brand: string;
  page: number;
}
