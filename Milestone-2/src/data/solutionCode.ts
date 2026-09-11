export const PYTHON_PRODUCTS_CODE = `from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import dbFetchAll, dbFetchOne, dbInsert, dbUpdate, dbQuery
from utils import login_required, verify_csrf, get_current_user

bp = Blueprint("products", __name__)


@bp.route("/", methods=["GET", "POST"])
@login_required
def index():
    if request.method == "POST":
        if not verify_csrf(request.form.get("csrf_token", "")):
            flash("Invalid request.", "error")
            return redirect(url_for("products.index"))

        action = request.form.get("action", "")

        if action in ("add", "edit"):
            data = {
                "name": request.form.get("name", "").strip(),
                "category_id": int(request.form.get("category_id") or 0) or None,
                "brand": request.form.get("brand", "").strip(),
                "supplier_id": int(request.form.get("supplier_id") or 0) or None,
                "cost_price": float(request.form.get("cost_price") or 0),
                "selling_price": float(request.form.get("selling_price") or 0),
                "stock_quantity": int(request.form.get("stock_quantity") or 0),
                "min_stock_level": int(request.form.get("min_stock_level") or 10),
                "reorder_quantity": int(request.form.get("reorder_quantity") or 50),
                "description": request.form.get("description", "").strip(),
            }

            if not data["name"]:
                flash("Product name is required.", "error")
                return redirect(url_for("products.index"))

            # Data-integrity check: Prevent selling_price from being lower than cost_price
            if data["selling_price"] < data["cost_price"]:
                flash("Selling price cannot be lower than cost price.", "error")
                return redirect(url_for("products.index"))

            if action == "add":
                last = dbFetchOne("SELECT product_code FROM products ORDER BY id DESC LIMIT 1")
                num = (int(last["product_code"][3:]) + 1) if last else 1
                data["product_code"] = f"PRD{num:03d}"
                new_id = dbInsert("products", data)

                if data["stock_quantity"] > 0:
                    dbInsert("inventory", {
                        "product_id": new_id,
                        "movement_type": "in",
                        "quantity": data["stock_quantity"],
                        "reference": "Initial Stock",
                        "moved_by": get_current_user()["id"],
                    })

                flash("Product added successfully.", "success")
            else:
                pid = int(request.form.get("product_id") or 0)
                dbUpdate("products", data, "id = ?", (pid,))
                flash("Product updated successfully.", "success")

            return redirect(url_for("products.index"))

        if action == "delete":
            pid = int(request.form.get("product_id") or 0)
            dbQuery("UPDATE products SET status='inactive' WHERE id=?", (pid,))
            flash("Product deleted.", "success")
            return redirect(url_for("products.index"))

    # --- Query Parameters (Brand Filter, Search, Category, Pagination) ---
    search = request.args.get("search", "").strip()
    cat_filter = int(request.args.get("category") or 0)
    brand_filter = request.args.get("brand", "").strip()
    page = max(1, int(request.args.get("page") or 1))
    per_page = 10
    offset = (page - 1) * per_page

    where = "WHERE p.status='active'"
    params = []

    if search:
        where += " AND p.name LIKE ?"
        params.append(f"%{search}%")

    if cat_filter:
        where += " AND p.category_id=?"
        params.append(cat_filter)

    # Filter by brand if provided
    if brand_filter:
        where += " AND p.brand = ?"
        params.append(brand_filter)

    total = dbFetchOne(f"SELECT COUNT(*) AS v FROM products p {where}", tuple(params))
    products = dbFetchAll(
        f"""SELECT p.*, c.name AS category_name, s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON c.id=p.category_id
            LEFT JOIN suppliers s ON s.id=p.supplier_id
            {where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?""",
        tuple(params) + (per_page, offset),
    )

    for p in products:
        if p["stock_quantity"] == 0:
            p["badge"], p["label"] = "badge-out-stock", "Out of Stock"
        elif p["stock_quantity"] <= p["min_stock_level"]:
            p["badge"], p["label"] = "badge-low-stock", "Low Stock"
        else:
            p["badge"], p["label"] = "badge-in-stock", "In Stock"

    categories = dbFetchAll("SELECT * FROM categories ORDER BY name")
    suppliers = dbFetchAll("SELECT * FROM suppliers WHERE status='active' ORDER BY name")

    # Fetch unique active brands for dropdown filter
    brands = [
        r["brand"]
        for r in dbFetchAll(
            "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND TRIM(brand) != '' AND status='active' ORDER BY brand"
        )
    ]

    total_pages = (total["v"] + per_page - 1) // per_page if total["v"] else 0

    return render_template(
        "products/index.html",
        page_title="Products",
        active_menu="products",
        products=products,
        categories=categories,
        suppliers=suppliers,
        brands=brands,
        total=total["v"],
        total_pages=total_pages,
        page=page,
        search=search,
        cat_filter=cat_filter,
        brand_filter=brand_filter,
    )
`;

export const TEMPLATE_INDEX_HTML = `{% extends "base.html" %}

{% block content %}
<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
    <div class="d-flex align-items-center gap-3 flex-wrap">
        <div class="search-bar">
            <i class="bi bi-search"></i>
            <input type="text" id="searchInput" class="form-control" placeholder="Search products…" value="{{ search }}"/>
        </div>

        <!-- Category Filter -->
        <select id="catFilter" class="form-select" style="width:160px;">
            <option value="0">All Categories</option>
            {% for cat in categories %}
            <option value="{{ cat.id }}" {{ 'selected' if cat_filter==cat.id else '' }}>{{ cat.name }}</option>
            {% endfor %}
        </select>

        <!-- Brand Filter -->
        <select id="brandFilter" class="form-select" style="width:160px;">
            <option value="">All Brands</option>
            {% for b in brands %}
            <option value="{{ b }}" {{ 'selected' if brand_filter==b else '' }}>{{ b }}</option>
            {% endfor %}
        </select>
    </div>

    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" onclick="openAddModal()">
        <i class="bi bi-plus-lg me-1"></i> Add Product
    </button>
</div>

<div class="table-card">
    <div class="table-card-header">
        <div>
            <div class="table-card-title">Product Catalog</div>
            <div class="table-card-subtitle">Showing {{ products|length }} of {{ total }} active items</div>
        </div>
    </div>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Cost</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {% if not products %}
            <tr><td colspan="8"><div class="empty-state"><i class="bi bi-box-seam"></i><p>No products found.</p></div></td></tr>
            {% else %}
            {% for p in products %}
            <tr>
                <td><code>{{ p.product_code }}</code></td>
                <td>
                    <div class="fw-semibold">{{ p.name }}</div>
                    {% if p.brand %}
                    <small class="text-muted"><i class="bi bi-tag me-1"></i>{{ p.brand }}</small>
                    {% endif %}
                </td>
                <td><span class="badge bg-light text-dark border">{{ p.category_name or '—' }}</span></td>
                <td>₹{{ "%.2f"|format(p.cost_price) }}</td>
                <td class="fw-semibold">₹{{ "%.2f"|format(p.selling_price) }}</td>
                <td>{{ p.stock_quantity }}</td>
                <td><span class="status-badge {{ p.badge }}">{{ p.label }}</span></td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-icon" onclick='editProduct({{ p|tojson }})' title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <form method="POST" action="{{ url_for('products.index') }}" class="d-inline" onsubmit="return confirm('Delete this product?')">
                            <input type="hidden" name="csrf_token" value="{{ csrf_token() }}"/>
                            <input type="hidden" name="action" value="delete"/>
                            <input type="hidden" name="product_id" value="{{ p.id }}"/>
                            <button type="submit" class="btn btn-sm btn-icon text-danger" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            {% endfor %}
            {% endif %}
            </tbody>
        </table>
    </div>

    <!-- Pagination preserving search, category, and brand filters -->
    {% if total_pages > 1 %}
    <div class="d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2">
        <small class="text-muted">Page {{ page }} of {{ total_pages }} ({{ total }} total)</small>
        <nav><ul class="pagination pagination-sm mb-0">
            {% for i in range(1, total_pages + 1) %}
            <li class="page-item {{ 'active' if i==page else '' }}">
                <a class="page-link" href="?page={{ i }}&search={{ search }}&category={{ cat_filter }}&brand={{ brand_filter }}">{{ i }}</a>
            </li>
            {% endfor %}
        </ul></nav>
    </div>
    {% endif %}
</div>

<!-- Add/Edit Product Modal -->
<div class="modal fade" id="productModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">Add Product</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST" action="{{ url_for('products.index') }}" id="productForm">
        <div class="modal-body">
          <input type="hidden" name="csrf_token" value="{{ csrf_token() }}"/>
          <input type="hidden" name="action" id="formAction" value="add"/>
          <input type="hidden" name="product_id" id="productId"/>
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label">Product Name *</label>
              <input type="text" name="name" id="fName" class="form-control" placeholder="e.g. Samsung Galaxy S24" required/>
            </div>
            <div class="col-md-4">
              <label class="form-label">Brand</label>
              <input type="text" name="brand" id="fBrand" class="form-control" placeholder="Samsung"/>
            </div>
            <div class="col-md-6">
              <label class="form-label">Category</label>
              <select name="category_id" id="fCategory" class="form-select">
                <option value="">— Select Category —</option>
                {% for cat in categories %}
                <option value="{{ cat.id }}">{{ cat.name }}</option>
                {% endfor %}
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Supplier</label>
              <select name="supplier_id" id="fSupplier" class="form-select">
                <option value="">— Select Supplier —</option>
                {% for s in suppliers %}
                <option value="{{ s.id }}">{{ s.name }}</option>
                {% endfor %}
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Cost Price (₹) *</label>
              <input type="number" step="0.01" name="cost_price" id="fCost" class="form-control" placeholder="0.00" required/>
            </div>
            <div class="col-md-4">
              <label class="form-label">Selling Price (₹) *</label>
              <input type="number" step="0.01" name="selling_price" id="fPrice" class="form-control" placeholder="0.00" required/>
              <!-- Inline Error on the Form for Selling Price < Cost Price -->
              <div id="priceFeedback" class="text-danger small mt-1" style="display:none;">Selling price cannot be lower than cost price.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Stock Quantity</label>
              <input type="number" name="stock_quantity" id="fStock" class="form-control" placeholder="0" min="0"/>
            </div>
            <div class="col-md-4">
              <label class="form-label">Min Stock Level</label>
              <input type="number" name="min_stock_level" id="fMinStock" class="form-control" placeholder="10" min="0"/>
            </div>
            <div class="col-md-4">
              <label class="form-label">Reorder Quantity</label>
              <input type="number" name="reorder_quantity" id="fReorder" class="form-control" placeholder="50" min="0"/>
            </div>
            <div class="col-12">
              <label class="form-label">Description</label>
              <textarea name="description" id="fDesc" class="form-control" rows="2" placeholder="Optional product description…"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Save Product</button>
        </div>
      </form>
    </div>
  </div>
</div>
{% endblock %}

{% block extra_js %}
<script>
function validatePrices() {
    const cost = parseFloat(document.getElementById('fCost').value) || 0;
    const price = parseFloat(document.getElementById('fPrice').value) || 0;
    const feedback = document.getElementById('priceFeedback');
    const priceInput = document.getElementById('fPrice');

    if (price < cost) {
        if (feedback) feedback.style.display = 'block';
        if (priceInput) priceInput.classList.add('is-invalid');
        return false;
    } else {
        if (feedback) feedback.style.display = 'none';
        if (priceInput) priceInput.classList.remove('is-invalid');
        return true;
    }
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('formAction').value = 'add';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    const feedback = document.getElementById('priceFeedback');
    if (feedback) feedback.style.display = 'none';
    const priceInput = document.getElementById('fPrice');
    if (priceInput) priceInput.classList.remove('is-invalid');
}

function editProduct(p) {
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('formAction').value = 'edit';
    document.getElementById('productId').value = p.id;
    document.getElementById('fName').value = p.name || '';
    document.getElementById('fBrand').value = p.brand || '';
    document.getElementById('fCategory').value = p.category_id || '';
    document.getElementById('fSupplier').value = p.supplier_id || '';
    document.getElementById('fCost').value = p.cost_price || '';
    document.getElementById('fPrice').value = p.selling_price || '';
    document.getElementById('fStock').value = p.stock_quantity || 0;
    document.getElementById('fMinStock').value = p.min_stock_level || 10;
    document.getElementById('fReorder').value = p.reorder_quantity || 50;
    document.getElementById('fDesc').value = p.description || '';
    const feedback = document.getElementById('priceFeedback');
    if (feedback) feedback.style.display = 'none';
    const priceInput = document.getElementById('fPrice');
    if (priceInput) priceInput.classList.remove('is-invalid');
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

// Live price validation
document.getElementById('fCost').addEventListener('input', validatePrices);
document.getElementById('fPrice').addEventListener('input', validatePrices);

document.getElementById('productForm').addEventListener('submit', function(e) {
    if (!validatePrices()) {
        e.preventDefault();
        return false;
    }
});

// Event listeners for real-time filtering
document.getElementById('searchInput').addEventListener('input', debounce(applyFilter, 400));
document.getElementById('catFilter').addEventListener('change', applyFilter);
document.getElementById('brandFilter').addEventListener('change', applyFilter);

function applyFilter() {
    const s = document.getElementById('searchInput').value;
    const c = document.getElementById('catFilter').value;
    const b = document.getElementById('brandFilter').value;
    window.location.href = '{{ url_for("products.index") }}?search=' + encodeURIComponent(s) + '&category=' + c + '&brand=' + encodeURIComponent(b);
}

function debounce(fn, ms) {
    let t;
    return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
    };
}
</script>
{% endblock %}
`;

export const GIT_DIFF_CODE = `diff --git a/blueprints/products.py b/blueprints/products.py
--- a/blueprints/products.py
+++ b/blueprints/products.py
@@ -34,6 +34,10 @@ def index():
             if not data["name"]:
                 flash("Product name is required.", "error")
                 return redirect(url_for("products.index"))
+
+            if data["selling_price"] < data["cost_price"]:
+                flash("Selling price cannot be lower than cost price.", "error")
+                return redirect(url_for("products.index"))
 
             if action == "add":
                 last = dbFetchOne("SELECT product_code FROM products ORDER BY id DESC LIMIT 1")
@@ -62,6 +66,7 @@ def index():
  
     search = request.args.get("search", "").strip()
     cat_filter = int(request.args.get("category") or 0)
+    brand_filter = request.args.get("brand", "").strip()
     page = max(1, int(request.args.get("page") or 1))
     per_page = 10
     offset = (page - 1) * per_page
@@ -73,6 +78,9 @@ def index():
     if cat_filter:
         where += " AND p.category_id=?"
         params.append(cat_filter)
+    if brand_filter:
+        where += " AND p.brand = ?"
+        params.append(brand_filter)
 
     total = dbFetchOne(f"SELECT COUNT(*) AS v FROM products p {where}", tuple(params))
     products = dbFetchAll(
@@ -93,6 +101,11 @@ def index():
 
     categories = dbFetchAll("SELECT * FROM categories ORDER BY name")
     suppliers = dbFetchAll("SELECT * FROM suppliers WHERE status='active' ORDER BY name")
+    brands = [
+        r["brand"]
+        for r in dbFetchAll(
+            "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND TRIM(brand) != '' AND status='active' ORDER BY brand"
+        )
+    ]
     total_pages = (total["v"] + per_page - 1) // per_page if total["v"] else 0
 
     return render_template(
@@ -100,7 +113,9 @@ def index():
         page_title="Products", active_menu="products",
         products=products, categories=categories, suppliers=suppliers,
+        brands=brands,
         total=total["v"], total_pages=total_pages, page=page,
-        search=search, cat_filter=cat_filter,
+        search=search, cat_filter=cat_filter, brand_filter=brand_filter,
     )

diff --git a/templates/products/index.html b/templates/products/index.html
--- a/templates/products/index.html
+++ b/templates/products/index.html
@@ -12,6 +12,12 @@
             {% for cat in categories %}
             <option value="{{ cat.id }}" {{ 'selected' if cat_filter==cat.id else '' }}>{{ cat.name }}</option>
             {% endfor %}
         </select>
+        <select id="brandFilter" class="form-select" style="width:160px;">
+            <option value="">All Brands</option>
+            {% for b in brands %}
+            <option value="{{ b }}" {{ 'selected' if brand_filter==b else '' }}>{{ b }}</option>
+            {% endfor %}
+        </select>
     </div>
     <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" onclick="openAddModal()">
@@ -82,7 +88,7 @@
             {% for i in range(1, total_pages + 1) %}
             <li class="page-item {{ 'active' if i==page else '' }}">
-                <a class="page-link" href="?page={{ i }}&search={{ search }}&category={{ cat_filter }}">{{ i }}</a>
+                <a class="page-link" href="?page={{ i }}&search={{ search }}&category={{ cat_filter }}&brand={{ brand_filter }}">{{ i }}</a>
             </li>
             {% endfor %}
         </ul></nav>
@@ -158,6 +164,7 @@
             <div class="col-md-4">
               <label class="form-label">Selling Price (₹) *</label>
               <input type="number" step="0.01" name="selling_price" id="fPrice" class="form-control" placeholder="0.00" required/>
+              <div id="priceFeedback" class="text-danger small mt-1" style="display:none;">Selling price cannot be lower than cost price.</div>
             </div>
@@ -167,11 +174,38 @@
+function validatePrices() {
+    const cost = parseFloat(document.getElementById('fCost').value) || 0;
+    const price = parseFloat(document.getElementById('fPrice').value) || 0;
+    const feedback = document.getElementById('priceFeedback');
+    const priceInput = document.getElementById('fPrice');
+    if (price < cost) {
+        if (feedback) feedback.style.display = 'block';
+        if (priceInput) priceInput.classList.add('is-invalid');
+        return false;
+    } else {
+        if (feedback) feedback.style.display = 'none';
+        if (priceInput) priceInput.classList.remove('is-invalid');
+        return true;
+    }
+}
+document.getElementById('fCost').addEventListener('input', validatePrices);
+document.getElementById('fPrice').addEventListener('input', validatePrices);
+document.getElementById('productForm').addEventListener('submit', function(e) {
+    if (!validatePrices()) {
+        e.preventDefault();
+        return false;
+    }
+});
+
 document.getElementById('searchInput').addEventListener('input', debounce(applyFilter, 400));
 document.getElementById('catFilter').addEventListener('change', applyFilter);
+document.getElementById('brandFilter').addEventListener('change', applyFilter);
 
 function applyFilter() {
     const s = document.getElementById('searchInput').value;
     const c = document.getElementById('catFilter').value;
-    window.location.href = '{{ url_for("products.index") }}?search='+encodeURIComponent(s)+'&category='+c;
+    const b = document.getElementById('brandFilter').value;
+    window.location.href = '{{ url_for("products.index") }}?search='+encodeURIComponent(s)+'&category='+c+'&brand='+encodeURIComponent(b);
 }
`;
