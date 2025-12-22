import os
from datetime import timedelta

class Config:
    # Database configuration
    # Use SQLite for local development, MySQL for production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///healthcare.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secret-jwt-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CSRF Configuration
    # We will use Flask-WTF for CSRF protection for forms,
    # and custom logic for API endpoints using a cookie and header approach.
    # This secret will be used for signing the CSRF token.
    CSRF_SECRET = os.environ.get('CSRF_SECRET') or 'super-secret-csrf-key'

    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'

    # Application settings
    FLASK_ENV = os.environ.get('FLASK_ENV') or 'development'
    DEBUG = os.environ.get('FLASK_ENV') == 'development'

    # Security settings
    PASSWORD_SALT = os.environ.get('PASSWORD_SALT') or 'random_salt_for_password_hashing'