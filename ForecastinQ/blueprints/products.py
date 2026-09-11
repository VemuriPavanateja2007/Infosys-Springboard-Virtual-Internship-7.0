from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import db_fetch_all, db_fetch_one, db_insert, db_update
from utils import login_required, role_required, validate_csrf

products_bp = Blueprint('products', __name__, url_prefix='/products')

@products_bp.route('/')
@login_required
def index():
    category_filter = request.args.get('category', type=int)
    search_query = request.args.get('q', '').strip()
    
    query = """
        SELECT p.*, c.name as category_name, s.name as supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE 1=1
    """
    args = []
    
    if category_filter:
        query += " AND p.category_id = ?"
        args.append(category_filter)
        
    if search_query:
        query += " AND (p.name LIKE ? OR p.sku LIKE ?)"
        args.extend([f"%{search_query}%", f"%{search_query}%"])
        
    query += " ORDER BY p.name ASC"
    
    products = db_fetch_all(query, args)
    categories = db_fetch_all("SELECT * FROM categories ORDER BY name ASC")
    suppliers = db_fetch_all("SELECT * FROM suppliers ORDER BY name ASC")
    
    return render_template('products/index.html',
                           products=products,
                           categories=categories,
                           suppliers=suppliers,
                           selected_category=category_filter,
                           search_query=search_query)

@products_bp.route('/add', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def add():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('products.index'))
        
    name = request.form.get('name', '').strip()
    sku = request.form.get('sku', '').strip().upper()
    category_id = request.form.get('category_id', type=int)
    unit = request.form.get('unit', 'pcs').strip()
    price = request.form.get('price', type=float) or 0.0
    cost_price = request.form.get('cost_price', type=float) or 0.0
    stock_level = request.form.get('stock_level', type=int) or 0
    min_stock_level = request.form.get('min_stock_level', type=int) or 10
    supplier_id = request.form.get('supplier_id', type=int)
    
    existing = db_fetch_one("SELECT id FROM products WHERE sku = ?", (sku,))
    if existing:
        flash(f'SKU "{sku}" already exists. Please use a unique SKU.', 'danger')
        return redirect(url_for('products.index'))
        
    db_insert("""
        INSERT INTO products (name, sku, category_id, unit, price, cost_price, stock_level, min_stock_level, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, sku, category_id, unit, price, cost_price, stock_level, min_stock_level, supplier_id))
    
    flash(f'Product "{name}" created successfully.', 'success')
    return redirect(url_for('products.index'))

@products_bp.route('/edit/<int:id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def edit(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('products.index'))
        
    name = request.form.get('name', '').strip()
    sku = request.form.get('sku', '').strip().upper()
    category_id = request.form.get('category_id', type=int)
    unit = request.form.get('unit', 'pcs').strip()
    price = request.form.get('price', type=float) or 0.0
    cost_price = request.form.get('cost_price', type=float) or 0.0
    stock_level = request.form.get('stock_level', type=int) or 0
    min_stock_level = request.form.get('min_stock_level', type=int) or 10
    supplier_id = request.form.get('supplier_id', type=int)
    
    db_update("""
        UPDATE products
        SET name = ?, sku = ?, category_id = ?, unit = ?, price = ?, cost_price = ?, stock_level = ?, min_stock_level = ?, supplier_id = ?
        WHERE id = ?
    """, (name, sku, category_id, unit, price, cost_price, stock_level, min_stock_level, supplier_id, id))
    
    flash(f'Product "{name}" updated successfully.', 'success')
    return redirect(url_for('products.index'))

@products_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def delete(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('products.index'))
        
    db_update("DELETE FROM products WHERE id = ?", (id,))
    flash('Product deleted successfully.', 'success')
    return redirect(url_for('products.index'))

@products_bp.route('/categories/add', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def add_category():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('products.index'))
        
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    
    if name:
        db_insert("INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)", (name, description))
        flash(f'Category "{name}" added.', 'success')
    return redirect(url_for('products.index'))
