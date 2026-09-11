from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from db import db_fetch_one
from utils import generate_csrf_token, validate_csrf

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.context_processor
def inject_csrf():
    return dict(csrf_token=generate_csrf_token())

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))
        
    if request.method == 'POST':
        token = request.form.get('csrf_token')
        if not validate_csrf(token):
            flash('Invalid CSRF token. Please try again.', 'danger')
            return redirect(url_for('auth.login'))
            
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        user = db_fetch_one("SELECT * FROM users WHERE username = ?", (username,))
        
        if user and check_password_hash(user['password_hash'], password):
            session.clear()
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            session['email'] = user['email']
            session['role'] = user['role']
            session['csrf_token'] = generate_csrf_token()
            
            flash(f"Welcome back, {user['full_name']}!", 'success')
            next_url = request.args.get('next')
            return redirect(next_url or url_for('dashboard.index'))
        else:
            flash('Invalid username or password.', 'danger')
            
    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
