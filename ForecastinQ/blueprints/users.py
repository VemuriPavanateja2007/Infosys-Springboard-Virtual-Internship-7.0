from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash
from db import db_fetch_all, db_fetch_one, db_insert, db_update
from utils import login_required, role_required, validate_csrf

users_bp = Blueprint('users', __name__, url_prefix='/users')

@users_bp.route('/')
@login_required
@role_required(['admin'])
def index():
    users = db_fetch_all("SELECT id, username, full_name, email, role, created_at FROM users ORDER BY username ASC")
    return render_template('users/index.html', users=users)

@users_bp.route('/add', methods=['POST'])
@login_required
@role_required(['admin'])
def add():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('users.index'))
        
    username = request.form.get('username', '').strip()
    full_name = request.form.get('full_name', '').strip()
    email = request.form.get('email', '').strip()
    role = request.form.get('role', 'staff')
    password = request.form.get('password', '').strip()
    
    if not username or not password:
        flash('Username and password are required.', 'danger')
        return redirect(url_for('users.index'))
        
    existing = db_fetch_one("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if existing:
        flash('Username or email already in use.', 'danger')
        return redirect(url_for('users.index'))
        
    hashed_pw = generate_password_hash(password)
    db_insert("""
        INSERT INTO users (username, password_hash, full_name, email, role)
        VALUES (?, ?, ?, ?, ?)
    """, (username, hashed_pw, full_name, email, role))
    
    flash(f'User "{username}" created successfully.', 'success')
    return redirect(url_for('users.index'))

@users_bp.route('/edit/<int:id>', methods=['POST'])
@login_required
@role_required(['admin'])
def edit(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('users.index'))
        
    full_name = request.form.get('full_name', '').strip()
    email = request.form.get('email', '').strip()
    role = request.form.get('role', 'staff')
    password = request.form.get('password', '').strip()
    
    if password:
        hashed_pw = generate_password_hash(password)
        db_update("UPDATE users SET full_name = ?, email = ?, role = ?, password_hash = ? WHERE id = ?",
                  (full_name, email, role, hashed_pw, id))
    else:
        db_update("UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?",
                  (full_name, email, role, id))
                  
    flash('User profile updated successfully.', 'success')
    return redirect(url_for('users.index'))

@users_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
@role_required(['admin'])
def delete(id):
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('users.index'))
        
    if id == session.get('user_id'):
        flash('You cannot delete your own logged-in user account.', 'danger')
        return redirect(url_for('users.index'))
        
    db_update("DELETE FROM users WHERE id = ?", (id,))
    flash('User account deleted.', 'success')
    return redirect(url_for('users.index'))
