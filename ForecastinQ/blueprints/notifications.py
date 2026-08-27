from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, request
from db import db_fetch_all, db_fetch_one, db_update
from utils import login_required, validate_csrf

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

@notifications_bp.route('/')
@login_required
def index():
    notifications = db_fetch_all("SELECT * FROM notifications ORDER BY created_at DESC")
    return render_template('notifications/index.html', notifications=notifications)

@notifications_bp.route('/api/unread')
@login_required
def get_unread_api():
    unread = db_fetch_all("SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 5")
    count = db_fetch_one("SELECT COUNT(id) as c FROM notifications WHERE is_read = 0")['c'] or 0
    return jsonify({
        'count': count,
        'notifications': unread
    })

@notifications_bp.route('/mark-read/<int:id>', methods=['POST'])
@login_required
def mark_read(id):
    db_update("UPDATE notifications SET is_read = 1 WHERE id = ?", (id,))
    if request.is_json:
        return jsonify({'status': 'success'})
    return redirect(url_for('notifications.index'))

@notifications_bp.route('/clear-all', methods=['POST'])
@login_required
def clear_all():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        flash('Invalid CSRF token.', 'danger')
        return redirect(url_for('notifications.index'))
        
    db_update("UPDATE notifications SET is_read = 1")
    flash('All notifications marked as read.', 'info')
    return redirect(url_for('notifications.index'))
