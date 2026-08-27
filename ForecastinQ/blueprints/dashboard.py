from flask import Blueprint, render_template, jsonify
from db import db_fetch_one, db_fetch_all
from utils import login_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@login_required
def index():
    # Summary statistics
    total_sales_res = db_fetch_one("SELECT SUM(total_amount) as total_rev, COUNT(id) as total_orders FROM sales")
    total_revenue = total_sales_res['total_rev'] or 0.0
    total_orders = total_sales_res['total_orders'] or 0
    
    total_products = db_fetch_one("SELECT COUNT(id) as count FROM products")['count'] or 0
    low_stock_count = db_fetch_one("SELECT COUNT(id) as count FROM products WHERE stock_level <= min_stock_level")['count'] or 0
    
    # Recent Sales (last 5)
    recent_sales = db_fetch_all("""
        SELECT s.id, s.invoice_no, s.total_amount, s.payment_method, s.sale_date, c.name as customer_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.sale_date DESC LIMIT 5
    """)
    
    # Top 5 Best Selling Products
    top_products = db_fetch_all("""
        SELECT p.name, p.sku, SUM(si.quantity) as total_qty, SUM(si.subtotal) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.id
        ORDER BY total_qty DESC LIMIT 5
    """)
    
    # Low stock items list
    low_stock_products = db_fetch_all("""
        SELECT p.id, p.name, p.sku, p.stock_level, p.min_stock_level, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock_level <= p.min_stock_level
        ORDER BY p.stock_level ASC LIMIT 5
    """)
    
    return render_template('dashboard/index.html',
                           total_revenue=total_revenue,
                           total_orders=total_orders,
                           total_products=total_products,
                           low_stock_count=low_stock_count,
                           recent_sales=recent_sales,
                           top_products=top_products,
                           low_stock_products=low_stock_products)

@dashboard_bp.route('/api/sales-trend')
@login_required
def sales_trend_api():
    # Group total revenue by day for past 30 days
    trend = db_fetch_all("""
        SELECT DATE(sale_date) as date, SUM(total_amount) as total_revenue, COUNT(id) as order_count
        FROM sales
        WHERE sale_date >= DATE('now', '-30 days')
        GROUP BY DATE(sale_date)
        ORDER BY DATE(sale_date) ASC
    """)
    labels = [item['date'] for item in trend]
    revenues = [round(item['total_revenue'], 2) for item in trend]
    orders = [item['order_count'] for item in trend]
    
    return jsonify({
        'labels': labels,
        'revenues': revenues,
        'orders': orders
    })

@dashboard_bp.route('/api/category-distribution')
@login_required
def category_distribution_api():
    data = db_fetch_all("""
        SELECT c.name as category, SUM(si.subtotal) as revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY revenue DESC
    """)
    labels = [item['category'] for item in data]
    values = [round(item['revenue'], 2) for item in data]
    
    return jsonify({
        'labels': labels,
        'values': values
    })
