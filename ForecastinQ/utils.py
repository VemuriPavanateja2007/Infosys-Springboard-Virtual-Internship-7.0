import secrets
from functools import wraps
from flask import session, redirect, url_for, flash, request, abort

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please log in first.', 'warning')
                return redirect(url_for('auth.login'))
            user_role = session.get('role', 'staff')
            if user_role not in roles:
                flash('Unauthorized access for your role.', 'danger')
                return redirect(url_for('dashboard.index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def generate_csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(16)
    return session['csrf_token']

def validate_csrf(token):
    session_token = session.get('csrf_token')
    if not session_token or not token or session_token != token:
        return False
    return True

# --- Statistical Forecasting Engines ---

def simple_moving_average(data, window=7, forecast_periods=7):
    """
    Computes Simple Moving Average (SMA) over historical data
    and generates future period predictions.
    """
    if not data:
        return {'fitted': [], 'forecast': [0] * forecast_periods}
    
    n = len(data)
    fitted = []
    
    for i in range(n):
        if i < window - 1:
            fitted.append(round(data[i], 2))
        else:
            window_slice = data[i - window + 1: i + 1]
            fitted.append(round(sum(window_slice) / len(window_slice), 2))
            
    # Future forecast based on last window
    last_window = data[-window:] if n >= window else data
    last_avg = round(sum(last_window) / len(last_window), 2) if last_window else 0
    forecast = [last_avg] * forecast_periods
    
    return {
        'fitted': fitted,
        'forecast': forecast,
        'next_period_prediction': last_avg
    }

def exponential_smoothing(data, alpha=0.3, forecast_periods=7):
    """
    Computes Single Exponential Smoothing (EMA) over historical data
    and generates future period predictions.
    """
    if not data:
        return {'fitted': [], 'forecast': [0] * forecast_periods}
        
    fitted = [round(data[0], 2)]
    for i in range(1, len(data)):
        st = alpha * data[i] + (1 - alpha) * fitted[-1]
        fitted.append(round(st, 2))
        
    last_val = fitted[-1] if fitted else 0
    forecast = [round(last_val, 2)] * forecast_periods
    
    return {
        'fitted': fitted,
        'forecast': forecast,
        'next_period_prediction': round(last_val, 2)
    }

def linear_regression(data, forecast_periods=7):
    """
    Computes Linear Regression (y = mx + b) over historical sales data.
    Returns fitted values and projected future demand.
    """
    if not data:
        return {'fitted': [], 'forecast': [0] * forecast_periods, 'slope': 0, 'intercept': 0}
        
    n = len(data)
    if n == 1:
        val = round(data[0], 2)
        return {'fitted': [val], 'forecast': [val] * forecast_periods, 'slope': 0, 'intercept': val}
        
    x = list(range(n))
    y = data
    
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    denominator = sum((x[i] - mean_x) ** 2 for i in range(n))
    
    m = numerator / denominator if denominator != 0 else 0
    b = mean_y - m * mean_x
    
    fitted = [round(max(0, m * i + b), 2) for i in range(n)]
    
    forecast = []
    for step in range(n, n + forecast_periods):
        pred = round(max(0, m * step + b), 2)
        forecast.append(pred)
        
    return {
        'fitted': fitted,
        'forecast': forecast,
        'slope': round(m, 4),
        'intercept': round(b, 4),
        'next_period_prediction': forecast[0] if forecast else 0
    }
