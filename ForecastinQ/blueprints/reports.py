import csv
import io
from flask import Blueprint, render_template, request, Response
from datetime import datetime, timedelta
from db import db_fetch_all, db_fetch_one
from utils import login_required, role_required

reports_bp = Blueprint('reports', __name__, url_prefix='/reports')

@reports_bp.route('/')
@login_required
def index():
    today_str = datetime.now().strftime('%Y-%m-%d')
    month_start_str = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    start_date = request.args.get('start_date', month_start_str)
    end_date = request.args.get('end_date', today_str)
    
    sales_report = db_fetch_all("""
        SELECT s.invoice_no, s.sale_date, c.name as customer_name,
               u.full_name as staff_name, s.payment_method, s.total_amount
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE DATE(s.sale_date) BETWEEN ? AND ?
        ORDER BY s.sale_date DESC
    """, (start_date, end_date))
    
    sales_stats = db_fetch_one("""
        SELECT SUM(total_amount) as total_rev, COUNT(id) as total_count, AVG(total_amount) as avg_order
        FROM sales
        WHERE DATE(sale_date) BETWEEN ? AND ?
    """, (start_date, end_date))
    
    total_rev = sales_stats['total_rev'] or 0.0
    total_count = sales_stats['total_count'] or 0
    avg_order = sales_stats['avg_order'] or 0.0
    
    # Inventory Valuation Report
    stock_report = db_fetch_all("""
        SELECT p.name, p.sku, c.name as category_name, p.stock_level, p.price, p.cost_price,
               (p.stock_level * p.cost_price) as stock_valuation
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
    """)
    
    return render_template('reports/index.html',
                           sales_report=sales_report,
                           stock_report=stock_report,
                           start_date=start_date,
                           end_date=end_date,
                           total_rev=total_rev,
                           total_count=total_count,
                           avg_order=avg_order)

@reports_bp.route('/sales/export')
@login_required
@role_required(['admin', 'manager'])
def export_sales_csv():
    start_date = request.args.get('start_date', '2020-01-01')
    end_date = request.args.get('end_date', '2030-12-31')
    
    sales = db_fetch_all("""
        SELECT s.invoice_no, s.sale_date, IFNULL(c.name, 'N/A') as customer,
               IFNULL(u.full_name, 'N/A') as staff, s.payment_method, s.total_amount
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE DATE(s.sale_date) BETWEEN ? AND ?
        ORDER BY s.sale_date DESC
    """, (start_date, end_date))
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Invoice No', 'Date & Time', 'Customer', 'Logged By Staff', 'Payment Method', 'Total Amount ($)'])
    
    for s in sales:
        writer.writerow([s['invoice_no'], s['sale_date'], s['customer'], s['staff'], s['payment_method'], f"{s['total_amount']:.2f}"])
        
    output.seek(0)
    filename = f"forecastinq_sales_report_{start_date}_to_{end_date}.csv"
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )

@reports_bp.route('/inventory/export')
@login_required
@role_required(['admin', 'manager'])
def export_inventory_csv():
    products = db_fetch_all("""
        SELECT p.name, p.sku, IFNULL(c.name, 'N/A') as category, p.unit, p.price, p.cost_price,
               p.stock_level, p.min_stock_level, (p.stock_level * p.cost_price) as valuation
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
    """)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Product Name', 'SKU', 'Category', 'Unit', 'Retail Price ($)', 'Cost Price ($)', 'Stock Level', 'Min Threshold', 'Total Valuation ($)'])
    
    for p in products:
        writer.writerow([p['name'], p['sku'], p['category'], p['unit'], f"{p['price']:.2f}", f"{p['cost_price']:.2f}", p['stock_level'], p['min_stock_level'], f"{p['valuation']:.2f}"])
        
    output.seek(0)
    filename = f"forecastinq_inventory_report_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )
