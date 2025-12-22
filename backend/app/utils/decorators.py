from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
import time

# Simple in-memory rate limiting (use Redis in production)
rate_limit_storage = {}


def rate_limit(max_requests, period_seconds):
    """
    Rate limiting decorator.

    Args:
        max_requests: Maximum number of requests allowed
        period_seconds: Time period in seconds
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client IP
            client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
            if client_ip:
                client_ip = client_ip.split(',')[0].strip()

            # Create a unique key for this endpoint + IP
            key = f"{f.__name__}:{client_ip}"

            current_time = time.time()

            # Clean up old entries
            if key in rate_limit_storage:
                rate_limit_storage[key] = [
                    timestamp for timestamp in rate_limit_storage[key]
                    if current_time - timestamp < period_seconds
                ]
            else:
                rate_limit_storage[key] = []

            # Check rate limit
            if len(rate_limit_storage[key]) >= max_requests:
                return jsonify({
                    'error': 'rate_limit_exceeded',
                    'message': f'Too many requests. Please try again in {period_seconds} seconds.'
                }), 429

            # Add current request timestamp
            rate_limit_storage[key].append(current_time)

            return f(*args, **kwargs)

        return decorated_function
    return decorator


def require_user_type(allowed_types):
    """
    Decorator to restrict access based on user type.
    Must be used after @jwt_required decorator.

    Args:
        allowed_types: List of allowed user types (e.g., ['patient', 'doctor'])
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask_jwt_extended import get_jwt

            claims = get_jwt()
            user_type = claims.get('user_type')

            if user_type not in allowed_types:
                return jsonify({
                    'error': 'forbidden',
                    'message': f'This endpoint is only accessible to {", ".join(allowed_types)}'
                }), 403

            return f(*args, **kwargs)

        return decorated_function
    return decorator
