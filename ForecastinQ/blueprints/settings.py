from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import db_fetch_all, db_update, db_insert
from utils import login_required, role_required, validate_csrf

settings_bp = Blueprint('settings', __name__, url_prefix='/settings')

@settings_bp.route('/')
@login_required
@role_required(['admin', 'manager'])
def index():
    raw_settings = db_fetch_all("SELECT * FROM settings")
    settings_dict = {row['key']: row['value'] for row in raw_settings}
    return render_template('settings/index.html', settings=settings_dict)

@settings_bp.route('/save', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def save():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('settings.index'))
        
    form_keys = ['company_name', 'currency_symbol', 'low_stock_threshold_ratio', 'default_forecasting_model']
    
    for key in form_keys:
        val = request.form.get(key, '').strip()
        db_insert("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?", (key, val, val))
        
    flash('Settings updated successfully.', 'success')
    return redirect(url_for('settings.index'))
