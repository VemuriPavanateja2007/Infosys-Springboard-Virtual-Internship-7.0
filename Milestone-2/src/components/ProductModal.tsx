import { useState, useEffect, FormEvent } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Category, Product, Supplier } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  productToEdit?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  suppliers,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: 1,
    supplier_id: 1,
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 10,
    min_stock_level: 10,
    reorder_quantity: 50,
    description: '',
  });

  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        brand: productToEdit.brand || '',
        category_id: productToEdit.category_id || 1,
        supplier_id: productToEdit.supplier_id || 1,
        cost_price: productToEdit.cost_price,
        selling_price: productToEdit.selling_price,
        stock_quantity: productToEdit.stock_quantity,
        min_stock_level: productToEdit.min_stock_level,
        reorder_quantity: productToEdit.reorder_quantity,
        description: productToEdit.description || '',
      });
      setPriceError(
        productToEdit.selling_price < productToEdit.cost_price
          ? 'Selling price cannot be lower than cost price.'
          : null,
      );
    } else {
      setFormData({
        name: '',
        brand: '',
        category_id: 1,
        supplier_id: 1,
        cost_price: 0,
        selling_price: 0,
        stock_quantity: 10,
        min_stock_level: 10,
        reorder_quantity: 50,
        description: '',
      });
      setPriceError(null);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCostChange = (cost: number) => {
    setFormData((prev) => {
      const next = { ...prev, cost_price: cost };
      if (next.selling_price < cost) {
        setPriceError('Selling price cannot be lower than cost price.');
      } else {
        setPriceError(null);
      }
      return next;
    });
  };

  const handlePriceChange = (price: number) => {
    setFormData((prev) => {
      const next = { ...prev, selling_price: price };
      if (price < next.cost_price) {
        setPriceError('Selling price cannot be lower than cost price.');
      } else {
        setPriceError(null);
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (formData.selling_price < formData.cost_price) {
      setPriceError('Selling price cannot be lower than cost price.');
      return;
    }

    onSave({
      ...formData,
      id: productToEdit ? productToEdit.id : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">
            {productToEdit ? 'Edit Product' : 'Add Product'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Samsung Galaxy S24"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g. Samsung, Apple, HP"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-indigo-950 bg-indigo-50/30"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplier_id: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost_price}
                onChange={(e) => handleCostChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.selling_price}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-hidden focus:ring-2 transition-colors ${
                  priceError
                    ? 'border-2 border-rose-500 bg-rose-50/30 text-rose-950 focus:ring-rose-500 focus:border-rose-500'
                    : 'border border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {/* Inline Error on the Form */}
              {priceError && (
                <div className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{priceError}</span>
                </div>
              )}
              {/* Margin feedback when valid */}
              {!priceError && formData.cost_price > 0 && formData.selling_price >= formData.cost_price && (
                <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <span>
                    Margin: +₹{(formData.selling_price - formData.cost_price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    +{(((formData.selling_price - formData.cost_price) / formData.cost_price) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_stock_level: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reorder Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_quantity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional product description..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(priceError)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                priceError
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm'
              }`}
            >
              <Check className="w-4 h-4" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
