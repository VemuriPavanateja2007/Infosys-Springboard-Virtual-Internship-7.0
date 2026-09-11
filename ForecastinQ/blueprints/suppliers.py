from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import db_fetch_all, db_fetch_one, db_insert, db_update
from utils import login_required, role_required, validate_csrf

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/suppliers')

@suppliers_bp.route('/')
@login_required
def index():
    suppliers = db_fetch_all("""
        SELECT s.*, COUNT(p.id) as product_count
        FROM suppliers s
        LEFT JOIN products p ON s.id = p.supplier_id
        GROUP BY s.id
        ORDER BY s.name ASC
    """)
    return render_template('suppliers/index.html', suppliers=suppliers)

@suppliers_bp.route('/add', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def add():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('suppliers.index'))
        
    name = request.form.get('name', '').strip()
    contact_person = request.form.get('contact_person', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    address = request.form.get('address', '').strip()
    
    if name:
        db_insert("""
            INSERT INTO suppliers (name, contact_person, email, phone, address)
            VALUES (?, ?, ?, ?, ?)
        """, (name, contact_person, email, phone, address))
        flash(f'Supplier "{name}" registered successfully.', 'success')
    return redirect(url_for('suppliers.index'))

@suppliers_bp.route('/edit/<int:id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def edit(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('suppliers.index'))
        
    name = request.form.get('name', '').strip()
    contact_person = request.form.get('contact_person', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    address = request.form.get('address', '').strip()
    
    db_update("""
        UPDATE suppliers
        SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?
        WHERE id = ?
    """, (name, contact_person, email, phone, address, id))
    flash(f'Supplier "{name}" updated.', 'success')
    return redirect(url_for('suppliers.index'))

@suppliers_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def delete(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('suppliers.index'))
        
    db_update("DELETE FROM suppliers WHERE id = ?", (id,))
    flash('Supplier removed.', 'success')
    return redirect(url_for('suppliers.index'))
