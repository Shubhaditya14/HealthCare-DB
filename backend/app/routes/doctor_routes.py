from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token, create_refresh_token
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Doctor, Appointment
from app.schemas import DoctorRegistrationSchema, DoctorUpdateSchema
from app.utils.decorators import rate_limit, require_user_type
from app.utils.error_handlers import handle_validation_error, handle_database_error, handle_not_found
from app.utils.sanitization import sanitize_email

doctor_bp = Blueprint('doctors', __name__)


@doctor_bp.route('/register', methods=['POST'])
@rate_limit(max_requests=5, period_seconds=3600)  # 5 registrations per hour
def register():
    """
    Register a new doctor.

    Request body:
        - first_name: Doctor's first name
        - last_name: Doctor's last name
        - email: Doctor's email
        - phone: Doctor's phone number
        - specialization: Doctor's specialization
        - license_number: Medical license number
        - years_experience: Years of experience
        - password: Password
        - confirm_password: Password confirmation
        - agree_to_terms: Must be true

    Returns:
        Doctor info and JWT tokens on success
    """
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input using Marshmallow schema
    schema = DoctorRegistrationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    # Check if email already exists
    existing_doctor = Doctor.query.filter_by(
        email=sanitize_email(validated_data['email'])
    ).first()

    if existing_doctor:
        return jsonify({
            'error': 'duplicate_entry',
            'message': 'An account with this email already exists',
            'errors': {'email': ['This email is already registered']}
        }), 409

    # Check if license number already exists
    existing_license = Doctor.query.filter_by(
        license_number=validated_data['license_number'].upper()
    ).first()

    if existing_license:
        return jsonify({
            'error': 'duplicate_entry',
            'message': 'A doctor with this license number already exists',
            'errors': {'license_number': ['This license number is already registered']}
        }), 409

    try:
        # Create new doctor
        doctor = Doctor(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            specialization=validated_data['specialization'],
            license_number=validated_data['license_number'],
            years_experience=validated_data['years_experience'],
            password=validated_data['password']
        )

        db.session.add(doctor)
        db.session.commit()

        # Create JWT tokens
        additional_claims = {
            'user_type': 'doctor',
            'user_id': doctor.id
        }

        access_token = create_access_token(
            identity=str(doctor.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            identity=str(doctor.id),
            additional_claims=additional_claims
        )

        return jsonify({
            'message': 'Registration successful',
            'doctor_id': doctor.id,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': doctor.id,
                'email': doctor.email,
                'first_name': doctor.first_name,
                'last_name': doctor.last_name,
                'full_name': doctor.full_name,
                'user_type': 'doctor'
            }
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        return handle_database_error(e)
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred during registration'
        }), 500


@doctor_bp.route('/me', methods=['GET'])
@jwt_required()
@require_user_type(['doctor'])
def get_profile():
    """
    Get current doctor's profile.

    Returns:
        Doctor's profile information
    """
    doctor_id = get_jwt_identity()
    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return handle_not_found('Doctor')

    return jsonify({
        'doctor': doctor.to_dict(include_private=True)
    }), 200


@doctor_bp.route('/me', methods=['PUT'])
@jwt_required()
@require_user_type(['doctor'])
def update_profile():
    """
    Update current doctor's profile.

    Request body:
        - first_name: Optional
        - last_name: Optional
        - phone: Optional
        - specialization: Optional
        - years_experience: Optional

    Returns:
        Updated doctor profile
    """
    doctor_id = get_jwt_identity()
    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return handle_not_found('Doctor')

    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input
    schema = DoctorUpdateSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    # Update fields
    if 'first_name' in validated_data:
        doctor.first_name = validated_data['first_name']
    if 'last_name' in validated_data:
        doctor.last_name = validated_data['last_name']
    if 'phone' in validated_data:
        doctor.phone = validated_data['phone']
    if 'specialization' in validated_data:
        doctor.specialization = validated_data['specialization']
    if 'years_experience' in validated_data:
        doctor.years_experience = validated_data['years_experience']

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'doctor': doctor.to_dict(include_private=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred while updating profile'
        }), 500


@doctor_bp.route('', methods=['GET'])
def list_doctors():
    """
    Get list of all active doctors.
    This endpoint is public for appointment booking.

    Returns:
        List of doctors with public information
    """
    doctors = Doctor.query.filter_by(is_active=True).all()

    return jsonify({
        'doctors': [doctor.to_dict(include_private=False) for doctor in doctors]
    }), 200


@doctor_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """
    Get a specific doctor's public information.

    Args:
        doctor_id: The doctor's ID

    Returns:
        Doctor's public information
    """
    doctor = Doctor.query.get(doctor_id)

    if not doctor or not doctor.is_active:
        return handle_not_found('Doctor')

    return jsonify({
        'doctor': doctor.to_dict(include_private=False)
    }), 200


@doctor_bp.route('/appointments', methods=['GET'])
@jwt_required()
@require_user_type(['doctor'])
def get_appointments():
    """
    Get current doctor's appointments.

    Returns:
        List of doctor's appointments
    """
    doctor_id = get_jwt_identity()
    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return handle_not_found('Doctor')

    # Get appointments ordered by date and time
    appointments = Appointment.query.filter_by(doctor_id=doctor_id)\
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())\
        .all()

    return jsonify({
        'appointments': [apt.to_dict() for apt in appointments]
    }), 200
