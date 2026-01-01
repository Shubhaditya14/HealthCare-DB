from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token, create_refresh_token
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Patient, Appointment
from app.schemas import PatientRegistrationSchema, PatientUpdateSchema
from app.utils.decorators import rate_limit, require_user_type
from app.utils.error_handlers import handle_validation_error, handle_database_error, handle_not_found
from app.utils.sanitization import sanitize_email

patient_bp = Blueprint('patients', __name__)


@patient_bp.route('/register', methods=['POST'])
@rate_limit(max_requests=5, period_seconds=3600)  # 5 registrations per hour
def register():
    """
    Register a new patient.

    Request body:
        - first_name: Patient's first name
        - last_name: Patient's last name
        - email: Patient's email
        - phone: Patient's phone number
        - date_of_birth: Patient's date of birth (YYYY-MM-DD)
        - password: Password
        - confirm_password: Password confirmation
        - blood_group: Optional blood group
        - agree_to_terms: Must be true

    Returns:
        Patient info and JWT tokens on success
    """
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input using Marshmallow schema
    schema = PatientRegistrationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    # Check if email already exists
    existing_patient = Patient.query.filter_by(
        email=sanitize_email(validated_data['email'])
    ).first()

    if existing_patient:
        return jsonify({
            'error': 'duplicate_entry',
            'message': 'An account with this email already exists',
            'errors': {'email': ['This email is already registered']}
        }), 409

    try:
        # Create new patient
        patient = Patient(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            date_of_birth=validated_data['date_of_birth'],
            password=validated_data['password'],
            blood_group=validated_data.get('blood_group')
        )

        db.session.add(patient)
        db.session.commit()

        # Create JWT tokens
        additional_claims = {
            'user_type': 'patient',
            'user_id': patient.id
        }

        access_token = create_access_token(
            identity=str(patient.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            identity=str(patient.id),
            additional_claims=additional_claims
        )

        return jsonify({
            'message': 'Registration successful',
            'patient_id': patient.id,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': patient.id,
                'email': patient.email,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'full_name': patient.full_name,
                'user_type': 'patient'
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


@patient_bp.route('/me', methods=['GET'])
@jwt_required()
@require_user_type(['patient'])
def get_profile():
    """
    Get current patient's profile.

    Returns:
        Patient's profile information
    """
    patient_id = int(get_jwt_identity())
    patient = Patient.query.get(patient_id)

    if not patient:
        return handle_not_found('Patient')

    return jsonify({
        'patient': patient.to_dict()
    }), 200


@patient_bp.route('/me', methods=['PUT'])
@jwt_required()
@require_user_type(['patient'])
def update_profile():
    """
    Update current patient's profile.

    Request body:
        - first_name: Optional
        - last_name: Optional
        - phone: Optional
        - blood_group: Optional

    Returns:
        Updated patient profile
    """
    patient_id = int(get_jwt_identity())
    patient = Patient.query.get(patient_id)

    if not patient:
        return handle_not_found('Patient')

    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input
    schema = PatientUpdateSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    # Update fields
    if 'first_name' in validated_data:
        patient.first_name = validated_data['first_name']
    if 'last_name' in validated_data:
        patient.last_name = validated_data['last_name']
    if 'phone' in validated_data:
        patient.phone = validated_data['phone']
    if 'blood_group' in validated_data:
        patient.blood_group = validated_data['blood_group']

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'patient': patient.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred while updating profile'
        }), 500


@patient_bp.route('/appointments', methods=['GET'])
@jwt_required()
@require_user_type(['patient'])
def get_appointments():
    """
    Get current patient's appointments.

    Returns:
        List of patient's appointments
    """
    patient_id = int(get_jwt_identity())
    patient = Patient.query.get(patient_id)

    if not patient:
        return handle_not_found('Patient')

    # Get appointments ordered by date and time
    appointments = Appointment.query.filter_by(patient_id=patient_id)\
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())\
        .all()

    return jsonify({
        'appointments': [apt.to_dict() for apt in appointments]
    }), 200
