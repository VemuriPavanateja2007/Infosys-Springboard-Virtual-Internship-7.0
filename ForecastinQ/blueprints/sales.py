from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
import json
from datetime import datetime
from db import db_fetch_all, db_fetch_one, db_insert, db_update
from utils import login_required, validate_csrf

sales_bp = Blueprint('sales', __name__, url_prefix='/sales')

@sales_bp.route('/')
@login_required
def index():
    sales = db_fetch_all("""
        SELECT s.*, c.name as customer_name, u.full_name as staff_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.sale_date DESC
    """)
    
    customers = db_fetch_all("SELECT * FROM customers ORDER BY name ASC")
    products = db_fetch_all("SELECT * FROM products WHERE stock_level > 0 ORDER BY name ASC")
    
    return render_template('sales/index.html',
                           sales=sales,
                           customers=customers,
                           products=products)

@sales_bp.route('/create', methods=['POST'])
@login_required
def create_sale():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('sales.index'))
        
    customer_id = request.form.get('customer_id', type=int)
    payment_method = request.form.get('payment_method', 'Cash').strip()
    
    # Selected items passed as JSON array string or form list
    items_json = request.form.get('items_json', '[]')
    try:
        items = json.loads(items_json)
    except Exception:
        items = []
        
    if not items:
        flash('No products selected for the transaction.', 'warning')
        return redirect(url_for('sales.index'))
        
    # Verify stock and compute total
    total_amount = 0.0
    validated_items = []
    
    for item in items:
        product_id = int(item.get('product_id'))
        qty = int(item.get('quantity'))
        
        prod = db_fetch_one("SELECT * FROM products WHERE id = ?", (product_id,))
        if not prod:
            flash(f"Product ID {product_id} not found.", 'danger')
            return redirect(url_for('sales.index'))
            
        if prod['stock_level'] < qty:
            flash(f"Insufficient stock for '{prod['name']}'. Available: {prod['stock_level']}, Requested: {qty}.", 'danger')
            return redirect(url_for('sales.index'))
            
        subtotal = round(prod['price'] * qty, 2)
        total_amount += subtotal
        validated_items.append({
            'product_id': product_id,
            'name': prod['name'],
            'unit_price': prod['price'],
            'quantity': qty,
            'subtotal': subtotal,
            'current_stock': prod['stock_level'],
            'min_stock_level': prod['min_stock_level']
        })
        
    # Generate Invoice Number
    timestamp_str = datetime.now().strftime('%Y%m%d%H%M%S')
    invoice_no = f"INV-{timestamp_str}"
    user_id = session.get('user_id')
    
    # 1. Create Sale
    sale_id = db_insert("""
        INSERT INTO sales (invoice_no, customer_id, user_id, total_amount, payment_method)
        VALUES (?, ?, ?, ?, ?)
    """, (invoice_no, customer_id, user_id, round(total_amount, 2), payment_method))
    
    # 2. Insert Sale Items and Auto-Decrement Stock
    for v_item in validated_items:
        db_insert("""
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        """, (sale_id, v_item['product_id'], v_item['quantity'], v_item['unit_price'], v_item['subtotal']))
        
        # Decrement Stock
        new_stock = v_item['current_stock'] - v_item['quantity']
        db_update("UPDATE products SET stock_level = ? WHERE id = ?", (new_stock, v_item['product_id']))
        
        # Low Stock Notification Check
        if new_stock <= v_item['min_stock_level']:
            title = f"Low Stock Alert: {v_item['name']}"
            msg = f"Product '{v_item['name']}' stock decreased to {new_stock} (Min threshold: {v_item['min_stock_level']})."
            db_insert("INSERT INTO notifications (title, message, type) VALUES (?, ?, 'warning')", (title, msg))
            
    flash(f"Sale recorded successfully! Invoice #{invoice_no} total: ${total_amount:.2f}", 'success')
    return redirect(url_for('sales.index'))

@sales_bp.route('/invoice/<int:id>')
@login_required
def invoice(id):
    sale = db_fetch_one("""
        SELECT s.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
               u.full_name as staff_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    """, (id,))
    
    if not sale:
        flash('Invoice not found.', 'danger')
        return redirect(url_for('sales.index'))
        
    items = db_fetch_all("""
        SELECT si.*, p.name as product_name, p.sku, p.unit
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
    """, (id,))
    
    return render_template('sales/invoice.html', sale=sale, items=items)
