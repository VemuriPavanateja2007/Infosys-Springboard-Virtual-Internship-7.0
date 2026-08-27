from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import db_fetch_all, db_fetch_one, db_update, db_insert
from utils import login_required, role_required, validate_csrf

inventory_bp = Blueprint('inventory', __name__, url_prefix='/inventory')

@inventory_bp.route('/')
@login_required
def index():
    status_filter = request.args.get('status', 'all')
    
    query = """
        SELECT p.*, c.name as category_name, s.name as supplier_name,
               (p.stock_level * p.cost_price) as total_value,
               CASE 
                   WHEN p.stock_level <= 0 THEN 'Out of Stock'
                   WHEN p.stock_level <= p.min_stock_level THEN 'Low Stock'
                   ELSE 'Adequate'
               END as stock_status,
               CASE
                   WHEN p.stock_level <= p.min_stock_level THEN MAX(0, (p.min_stock_level * 2) - p.stock_level)
                   ELSE 0
               END as suggested_reorder
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE 1=1
    """
    
    if status_filter == 'low':
        query += " AND p.stock_level <= p.min_stock_level AND p.stock_level > 0"
    elif status_filter == 'out':
        query += " AND p.stock_level <= 0"
    elif status_filter == 'reorder':
        query += " AND p.stock_level <= p.min_stock_level"
        
    query += " ORDER BY p.stock_level ASC"
    
    inventory_items = db_fetch_all(query)
    
    # Calculate valuation summary
    total_val_res = db_fetch_one("SELECT SUM(stock_level * cost_price) as total_val, SUM(stock_level) as total_units FROM products")
    total_valuation = total_val_res['total_val'] or 0.0
    total_units = total_val_res['total_units'] or 0
    
    low_count = db_fetch_one("SELECT COUNT(id) as c FROM products WHERE stock_level <= min_stock_level AND stock_level > 0")['c']
    out_count = db_fetch_one("SELECT COUNT(id) as c FROM products WHERE stock_level <= 0")['c']
    
    return render_template('inventory/index.html',
                           inventory_items=inventory_items,
                           total_valuation=total_valuation,
                           total_units=total_units,
                           low_count=low_count,
                           out_count=out_count,
                           current_filter=status_filter)

@inventory_bp.route('/adjust', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def adjust_stock():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('inventory.index'))
        
    product_id = request.form.get('product_id', type=int)
    adjustment = request.form.get('adjustment', type=int) or 0
    reason = request.form.get('reason', 'Manual Stock Adjustment').strip()
    
    product = db_fetch_one("SELECT * FROM products WHERE id = ?", (product_id,))
    if not product:
        flash('Product not found.', 'danger')
        return redirect(url_for('inventory.index'))
        
    new_stock = max(0, product['stock_level'] + adjustment)
    db_update("UPDATE products SET stock_level = ? WHERE id = ?", (new_stock, product_id))
    
    # Check if stock condition triggered or resolved low-stock alert
    if new_stock <= product['min_stock_level']:
        title = f"Low Stock Alert: {product['name']}"
        msg = f"Stock level ({new_stock}) for '{product['name']}' is below minimum threshold ({product['min_stock_level']}). Reason: {reason}."
        db_insert("INSERT INTO notifications (title, message, type) VALUES (?, ?, 'warning')", (title, msg))
        
    flash(f"Stock for '{product['name']}' updated to {new_stock} units.", 'success')
    return redirect(url_for('inventory.index'))
