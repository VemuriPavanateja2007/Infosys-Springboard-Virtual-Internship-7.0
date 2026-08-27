import sqlite3
import os
from flask import g
from config import Config

def get_db():
    if 'db' not in g:
        # Ensure database directory exists
        db_dir = os.path.dirname(Config.DATABASE_PATH)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            
        g.db = sqlite3.connect(
            Config.DATABASE_PATH,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

from datetime import datetime, date

def _clean_row(row):
    if not row:
        return None
    d = {}
    for k, v in dict(row).items():
        if isinstance(v, (datetime, date)):
            d[k] = str(v)
        else:
            d[k] = v
    return d

def db_fetch_all(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    rows = cur.fetchall()
    cur.close()
    return [_clean_row(row) for row in rows]

def db_fetch_one(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    row = cur.fetchone()
    cur.close()
    return _clean_row(row)

def db_insert(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    last_id = cur.lastrowid
    conn.commit()
    cur.close()
    return last_id

def db_update(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    rowcount = cur.rowcount
    conn.commit()
    cur.close()
    return rowcount

def db_execute_script(script_sql):
    conn = get_db()
    conn.executescript(script_sql)
    conn.commit()

def init_app_db(app):
    app.teardown_appcontext(close_db)
