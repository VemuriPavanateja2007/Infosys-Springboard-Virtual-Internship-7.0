import os
import sqlite3
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from config import Config

def init_db():
    print("Initializing ForecastinQ database...")
    db_path = Config.DATABASE_PATH
    db_dir = os.path.dirname(db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Read schema.sql
    schema_path = os.path.join(db_dir, 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
        
    cur.executescript(schema_sql)
    conn.commit()
    print("Schema applied successfully.")
    
    # 1. Seed Users
    hashed_pw = generate_password_hash('Admin@123')
    users_data = [
        ('admin', hashed_pw, 'System Administrator', 'admin@forecastinq.com', 'admin'),
        ('manager', hashed_pw, 'Inventory Manager', 'manager@forecastinq.com', 'manager'),
        ('staff', hashed_pw, 'Sales Staff', 'staff@forecastinq.com', 'staff')
    ]
    cur.executemany(
        "INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)",
        users_data
    )
    
    # 2. Seed Categories
    categories = [
        ('Electronics', 'Gadgets, components, and electronic devices'),
        ('Office Supplies', 'Paper, stationery, and desk accessories'),
        ('Food & Beverages', 'Snacks, packaged food, and drinks'),
        ('Hardware', 'Tools, fasteners, and build materials'),
        ('Apparel', 'Clothing, caps, and branded merchandise')
    ]
    cur.executemany(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        categories
    )
    
    # 3. Seed Suppliers
    suppliers = [
        ('TechDistro Corp', 'Alex Vance', 'alex@techdistro.com', '+1-555-0101', '100 Silicon Way, Tech City'),
        ('Global Paper Co', 'Maria Garcia', 'maria@globalpaper.com', '+1-555-0102', '45 Mill Road, Industrial Park'),
        ('Prime Foods Ltd', 'David Smith', 'david@primefoods.com', '+1-555-0103', '78 Harvest Ave, Commerce Zone'),
        ('Fastener Depot', 'Sarah Lin', 'sarah@fastenerdepot.com', '+1-555-0104', '12 Industrial Blvd, Build Town'),
        ('Urban Wear Inc', 'Robert Taylor', 'robert@urbanwear.com', '+1-555-0105', '88 Fashion St, Metro Center')
    ]
    cur.executemany(
        "INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)",
        suppliers
    )
    
    # 4. Seed Customers
    customers = [
        ('Acme Retail', 'acme@contact.com', '+1-555-0201', '12 Commerce St, Downtown'),
        ('Nexus Solutions', 'nexus@contact.com', '+1-555-0202', '54 Tech Park, North Side'),
        ('Horizon Corp', 'horizon@contact.com', '+1-555-0203', '90 Business Loop, East Wing'),
        ('Retail Dynamics', 'rdynamics@contact.com', '+1-555-0204', '33 Market Ave, City Center'),
        ('Stellar Enterprises', 'stellar@contact.com', '+1-555-0205', '71 Innovation Way, West End')
    ]
    cur.executemany(
        "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
        customers
    )
    
    # 5. Seed Products (Category IDs 1..5, Supplier IDs 1..5)
    products = [
        # Electronics (Cat 1)
        ('Wireless Ergonomic Mouse', 'SKU-ELEC-001', 1, 'pcs', 29.99, 15.00, 45, 15, 1),
        ('Mechanical Gaming Keyboard', 'SKU-ELEC-002', 1, 'pcs', 89.99, 50.00, 8, 12, 1), # Low stock!
        ('USB-C Multiport Hub', 'SKU-ELEC-003', 1, 'pcs', 39.99, 20.00, 60, 20, 1),
        ('27-Inch HD Monitor', 'SKU-ELEC-004', 1, 'pcs', 199.99, 130.00, 5, 10, 1), # Low stock!
        
        # Office Supplies (Cat 2)
        ('Premium A4 Copy Paper (Ream)', 'SKU-OFF-001', 2, 'box', 8.50, 4.00, 120, 30, 2),
        ('Gel Ink Pen (Pack of 12)', 'SKU-OFF-002', 2, 'pack', 12.00, 5.50, 200, 50, 2),
        ('Heavy Duty Desktop Stapler', 'SKU-OFF-003', 2, 'pcs', 18.50, 9.00, 3, 8, 2), # Low stock!
        
        # Food & Beverages (Cat 3)
        ('Organic Roasted Coffee Beans 1kg', 'SKU-FOOD-001', 3, 'bag', 22.50, 12.00, 35, 15, 3),
        ('Sparkling Mineral Water (Case of 24)', 'SKU-FOOD-002', 3, 'case', 16.00, 8.00, 50, 20, 3),
        ('Assorted Energy Protein Bars', 'SKU-FOOD-003', 3, 'box', 24.00, 11.00, 4, 15, 3), # Low stock!
        
        # Hardware (Cat 4)
        ('Cordless Power Drill Set', 'SKU-HARD-001', 4, 'set', 129.00, 75.00, 18, 10, 4),
        ('Stainless Steel Screw Assortment', 'SKU-HARD-002', 4, 'box', 14.50, 6.00, 85, 25, 4),
        
        # Apparel (Cat 5)
        ('Branded Cotton Polo T-Shirt', 'SKU-APP-001', 5, 'pcs', 25.00, 10.00, 90, 20, 5),
        ('Waterproof Executive Backpack', 'SKU-APP-002', 5, 'pcs', 59.00, 28.00, 6, 10, 5) # Low stock!
    ]
    
    cur.executemany(
        """INSERT INTO products 
           (name, sku, category_id, unit, price, cost_price, stock_level, min_stock_level, supplier_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products
    )
    
    # 6. Seed Settings
    settings = [
        ('company_name', 'ForecastinQ Corp'),
        ('currency_symbol', '$'),
        ('low_stock_threshold_ratio', '1.0'),
        ('default_forecasting_model', 'linear_regression')
    ]
    cur.executemany(
        "INSERT INTO settings (key, value) VALUES (?, ?)",
        settings
    )
    
    # 7. Seed Notifications for low stock items
    notifications = [
        ('Low Stock Alert: Mechanical Gaming Keyboard', 'Product "Mechanical Gaming Keyboard" stock level (8) is below minimum threshold (12). Restock recommended.', 'warning', 0),
        ('Low Stock Alert: 27-Inch HD Monitor', 'Product "27-Inch HD Monitor" stock level (5) is below minimum threshold (10). Restock recommended.', 'warning', 0),
        ('Low Stock Alert: Heavy Duty Desktop Stapler', 'Product "Heavy Duty Desktop Stapler" stock level (3) is below minimum threshold (8). Restock recommended.', 'danger', 0),
        ('Low Stock Alert: Assorted Energy Protein Bars', 'Product "Assorted Energy Protein Bars" stock level (4) is below minimum threshold (15). Restock recommended.', 'danger', 0),
        ('System Initialized', 'ForecastinQ Sales & Inventory Management system initialized successfully.', 'info', 1)
    ]
    cur.executemany(
        "INSERT INTO notifications (title, message, type, is_read) VALUES (?, ?, ?, ?)",
        notifications
    )
    
    # 8. Seed 35 Days of Historical Sales Transactions
    print("Generating 35 days of historical sales data for forecasting...")
    start_date = datetime.now() - timedelta(days=35)
    
    # Product price lookup
    cur.execute("SELECT id, price FROM products")
    product_rows = cur.fetchall()
    prod_map = {row[0]: row[1] for row in product_rows}
    prod_ids = list(prod_map.keys())
    
    payment_methods = ['Cash', 'Credit Card', 'Bank Transfer', 'UPI']
    invoice_counter = 1001
    
    for day_offset in range(36):
        current_date = start_date + timedelta(days=day_offset)
        # 2 to 5 sales transactions per day
        daily_sales_count = random.randint(2, 5)
        
        for _ in range(daily_sales_count):
            invoice_no = f"INV-2026-{invoice_counter}"
            invoice_counter += 1
            customer_id = random.randint(1, 5)
            user_id = random.choice([1, 2, 3]) # Admin, Manager, or Staff
            payment_method = random.choice(payment_methods)
            
            # Select 1 to 4 products for this sale
            num_items = random.randint(1, 4)
            chosen_prods = random.sample(prod_ids, num_items)
            
            sale_total = 0.0
            sale_items_buffer = []
            
            for pid in chosen_prods:
                unit_price = prod_map[pid]
                # Quantity 1 to 5, with slight upward trend over time for realism
                qty = random.randint(1, 4) + (1 if day_offset > 20 else 0)
                subtotal = round(unit_price * qty, 2)
                sale_total += subtotal
                sale_items_buffer.append((pid, qty, unit_price, subtotal))
                
            sale_date_str = current_date.strftime('%Y-%m-%d %H:%M:%S')
            
            # Insert sale
            cur.execute(
                """INSERT INTO sales (invoice_no, customer_id, user_id, total_amount, payment_method, sale_date)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (invoice_no, customer_id, user_id, round(sale_total, 2), payment_method, sale_date_str)
            )
            sale_id = cur.lastrowid
            
            # Insert sale items
            for item in sale_items_buffer:
                cur.execute(
                    """INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
                       VALUES (?, ?, ?, ?, ?)""",
                    (sale_id, item[0], item[1], item[2], item[3])
                )
                
    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    init_db()
