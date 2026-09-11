from flask import Blueprint, render_template, request, jsonify
from datetime import datetime, timedelta
from db import db_fetch_all, db_fetch_one
from utils import login_required, simple_moving_average, exponential_smoothing, linear_regression

forecasting_bp = Blueprint('forecasting', __name__, url_prefix='/forecasting')

@forecasting_bp.route('/')
@login_required
def index():
    products = db_fetch_all("SELECT id, name, sku, stock_level, min_stock_level, price FROM products ORDER BY name ASC")
    selected_product_id = request.args.get('product_id', type=int)
    if not selected_product_id and products:
        selected_product_id = products[0]['id']
        
    model_type = request.args.get('model', 'linear_regression')
    horizon = request.args.get('horizon', type=int) or 14
    
    selected_product = None
    if selected_product_id:
        selected_product = db_fetch_one("SELECT * FROM products WHERE id = ?", (selected_product_id,))
        
    return render_template('forecasting/index.html',
                           products=products,
                           selected_product=selected_product,
                           selected_model=model_type,
                           horizon=horizon)

@forecasting_bp.route('/api/forecast-data')
@login_required
def forecast_data_api():
    product_id = request.args.get('product_id', type=int)
    model_type = request.args.get('model', 'linear_regression')
    horizon = request.args.get('horizon', type=int) or 14
    
    if not product_id:
        return jsonify({'error': 'Product ID required'}), 400
        
    product = db_fetch_one("SELECT * FROM products WHERE id = ?", (product_id,))
    if not product:
        return jsonify({'error': 'Product not found'}), 404
        
    # Get daily sales aggregation for past 40 days
    historical_rows = db_fetch_all("""
        SELECT DATE(s.sale_date) as sale_day, SUM(si.quantity) as daily_qty
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.product_id = ? AND s.sale_date >= DATE('now', '-40 days')
        GROUP BY DATE(s.sale_date)
        ORDER BY DATE(s.sale_date) ASC
    """, (product_id,))
    
    # Fill in missing dates with 0 sales for a continuous daily time series
    sales_map = {row['sale_day']: row['daily_qty'] for row in historical_rows}
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=35)
    
    labels = []
    actual_data = []
    
    curr = start_date
    while curr <= end_date:
        date_str = curr.strftime('%Y-%m-%d')
        labels.append(date_str)
        actual_data.append(sales_map.get(date_str, 0))
        curr += timedelta(days=1)
        
    # Generate Future Forecast Dates
    forecast_labels = []
    for i in range(1, horizon + 1):
        future_day = end_date + timedelta(days=i)
        forecast_labels.append(future_day.strftime('%Y-%m-%d'))
        
    # Run Algorithm
    if model_type == 'sma':
        res = simple_moving_average(actual_data, window=7, forecast_periods=horizon)
    elif model_type == 'ema':
        res = exponential_smoothing(actual_data, alpha=0.3, forecast_periods=horizon)
    else: # linear_regression
        res = linear_regression(actual_data, forecast_periods=horizon)
        
    fitted = res.get('fitted', [])
    forecast = res.get('forecast', [])
    
    # Total Projected Demand
    projected_demand = sum(forecast)
    projected_revenue = projected_demand * product['price']
    
    # Stock reorder recommendation
    current_stock = product['stock_level']
    shortfall = max(0, round(projected_demand - current_stock, 2))
    reorder_recommended = shortfall > 0
    suggested_order_qty = round(shortfall + product['min_stock_level'], 2) if reorder_recommended else 0
    
    return jsonify({
        'product': dict(product),
        'historical_labels': labels,
        'actual_data': actual_data,
        'fitted_data': fitted,
        'forecast_labels': forecast_labels,
        'forecast_data': forecast,
        'projected_demand': round(projected_demand, 2),
        'projected_revenue': round(projected_revenue, 2),
        'reorder_recommended': reorder_recommended,
        'suggested_order_qty': suggested_order_qty,
        'model_name': model_type.upper()
    })
