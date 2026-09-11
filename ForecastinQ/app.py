from flask import Flask, session
from config import Config
from db import init_app_db, db_fetch_one, db_fetch_all
from utils import generate_csrf_token

from blueprints.auth import auth_bp
from blueprints.dashboard import dashboard_bp
from blueprints.products import products_bp
from blueprints.inventory import inventory_bp
from blueprints.sales import sales_bp
from blueprints.customers import customers_bp
from blueprints.suppliers import suppliers_bp
from blueprints.forecasting import forecasting_bp
from blueprints.reports import reports_bp
from blueprints.notifications import notifications_bp
from blueprints.users import users_bp
from blueprints.settings import settings_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize DB context teardown
    init_app_db(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(suppliers_bp)
    app.register_blueprint(forecasting_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(settings_bp)
    
    # Context Processor for Templates
    @app.context_processor
    def inject_global_vars():
        csrf_tok = generate_csrf_token()
        unread_count = 0
        unread_notifications = []
        company_name = 'ForecastinQ'
        currency_symbol = '$'
        
        if 'user_id' in session:
            try:
                unread_res = db_fetch_one("SELECT COUNT(id) as c FROM notifications WHERE is_read = 0")
                if unread_res:
                    unread_count = unread_res['c']
                unread_notifications = db_fetch_all("SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 5")
                
                raw_settings = db_fetch_all("SELECT * FROM settings")
                settings_map = {r['key']: r['value'] for r in raw_settings}
                company_name = settings_map.get('company_name', 'ForecastinQ')
                currency_symbol = settings_map.get('currency_symbol', '$')
            except Exception:
                pass
                
        return dict(
            csrf_token=csrf_tok,
            unread_count=unread_count,
            unread_notifications=unread_notifications,
            company_name=company_name,
            currency_symbol=currency_symbol,
            user_session=session
        )
        
    return app

app = create_app()

if __name__ == '__main__':
    print("Starting ForecastinQ server on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=True)
