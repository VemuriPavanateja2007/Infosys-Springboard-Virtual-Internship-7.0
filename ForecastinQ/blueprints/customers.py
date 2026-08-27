from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import db_fetch_all, db_fetch_one, db_insert, db_update
from utils import login_required, role_required, validate_csrf

customers_bp = Blueprint('customers', __name__, url_prefix='/customers')

@customers_bp.route('/')
@login_required
def index():
    customers = db_fetch_all("""
        SELECT c.*, COUNT(s.id) as total_orders, IFNULL(SUM(s.total_amount), 0.0) as total_spent
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id
        ORDER BY c.name ASC
    """)
    return render_template('customers/index.html', customers=customers)

@customers_bp.route('/add', methods=['POST'])
@login_required
def add():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('customers.index'))
        
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    address = request.form.get('address', '').strip()
    
    if name:
        db_insert("INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
                  (name, email, phone, address))
        flash(f'Customer "{name}" added successfully.', 'success')
    return redirect(url_for('customers.index'))

@customers_bp.route('/edit/<int:id>', methods=['POST'])
@login_required
def edit(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('customers.index'))
        
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    address = request.form.get('address', '').strip()
    
    db_update("UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
              (name, email, phone, address, id))
    flash(f'Customer "{name}" updated.', 'success')
    return redirect(url_for('customers.index'))

@customers_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def delete(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('customers.index'))
        
    db_update("DELETE FROM customers WHERE id = ?", (id,))
    flash('Customer deleted.', 'success')
    return redirect(url_for('customers.index'))
