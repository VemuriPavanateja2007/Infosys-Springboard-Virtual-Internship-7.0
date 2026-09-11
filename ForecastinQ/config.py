import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'forecastinq-secret-key-2026-super-secure'
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'forecasting.db')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
