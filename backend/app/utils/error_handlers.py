from flask import jsonify
from marshmallow import ValidationError as MarshmallowValidationError


def handle_validation_error(errors):
    """
    Format validation errors for API response.

    Args:
        errors: Dictionary of field errors from Marshmallow

    Returns:
        Formatted error response tuple
    """
    return jsonify({
        'error': 'validation_error',
        'message': 'Validation failed',
        'errors': errors
    }), 422


def handle_database_error(error):
    """
    Handle database errors.

    Args:
        error: The database exception

    Returns:
        Formatted error response tuple
    """
    error_message = str(error)

    # Check for duplicate entry
    if 'Duplicate entry' in error_message or 'UNIQUE constraint' in error_message:
        if 'email' in error_message.lower():
            return jsonify({
                'error': 'duplicate_entry',
                'message': 'An account with this email already exists',
                'errors': {'email': ['This email is already registered']}
            }), 409
        elif 'license_number' in error_message.lower():
            return jsonify({
                'error': 'duplicate_entry',
                'message': 'A doctor with this license number already exists',
                'errors': {'license_number': ['This license number is already registered']}
            }), 409

    # Generic database error
    return jsonify({
        'error': 'database_error',
        'message': 'A database error occurred. Please try again.'
    }), 500


def handle_auth_error(message="Authentication failed"):
    """
    Handle authentication errors.

    Args:
        message: Custom error message

    Returns:
        Formatted error response tuple
    """
    return jsonify({
        'error': 'authentication_error',
        'message': message
    }), 401


def handle_not_found(resource="Resource"):
    """
    Handle not found errors.

    Args:
        resource: Name of the resource that was not found

    Returns:
        Formatted error response tuple
    """
    return jsonify({
        'error': 'not_found',
        'message': f'{resource} not found'
    }), 404
