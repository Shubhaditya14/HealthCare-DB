from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from app import db
from app.models import Patient, Doctor
from app.utils.decorators import rate_limit
from app.utils.error_handlers import handle_auth_error

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=10, period_seconds=300)  # 10 attempts per 5 minutes
def login():
    """
    Login endpoint for both patients and doctors.

    Request body:
        - email: User's email
        - password: User's password
        - user_type: 'patient' or 'doctor'

    Returns:
        JWT tokens and user info on success
    """
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    user_type = data.get('user_type', '').lower()

    # Validate required fields
    if not email or not password or not user_type:
        return jsonify({
            'error': 'validation_error',
            'message': 'Email, password, and user_type are required'
        }), 400

    if user_type not in ['patient', 'doctor']:
        return jsonify({
            'error': 'validation_error',
            'message': 'user_type must be either "patient" or "doctor"'
        }), 400

    # Find user based on type
    user = None
    if user_type == 'patient':
        user = Patient.query.filter_by(email=email).first()
    else:
        user = Doctor.query.filter_by(email=email).first()

    # Verify user exists and password is correct
    if not user or not user.check_password(password):
        return handle_auth_error('wrong passcode')

    # Check if user is active
    if not user.is_active:
        return handle_auth_error('Your account has been deactivated')

    # Create JWT tokens with user type in claims
    additional_claims = {
        'user_type': user_type,
        'user_id': user.id
    }

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims=additional_claims
    )

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'user_type': user_type
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token.

    Returns:
        New access token
    """
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims.get('user_type')

    # Verify user still exists and is active
    if user_type == 'patient':
        user = Patient.query.get(current_user_id)
    else:
        user = Doctor.query.get(current_user_id)

    if not user or not user.is_active:
        return handle_auth_error('User not found or inactive')

    additional_claims = {
        'user_type': user_type,
        'user_id': current_user_id
    }

    new_access_token = create_access_token(
        identity=str(current_user_id),
        additional_claims=additional_claims
    )

    return jsonify({
        'access_token': new_access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user's info.

    Returns:
        User information based on user type
    """
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims.get('user_type')

    if user_type == 'patient':
        user = Patient.query.get(current_user_id)
        if user:
            return jsonify({
                'user': user.to_dict(),
                'user_type': 'patient'
            }), 200
    else:
        user = Doctor.query.get(current_user_id)
        if user:
            return jsonify({
                'user': user.to_dict(include_private=True),
                'user_type': 'doctor'
            }), 200

    return handle_auth_error('User not found')


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint.
    Note: With JWT, actual logout is handled client-side by deleting tokens.
    This endpoint is for logging purposes and future token blacklisting.

    Returns:
        Logout confirmation message
    """
    # In a production app, you might want to:
    # 1. Add the token to a blacklist (stored in Redis)
    # 2. Log the logout event

    return jsonify({
        'message': 'Successfully logged out'
    }), 200
