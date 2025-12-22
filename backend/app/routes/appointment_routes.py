from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime, date
from app import db
from app.models import Appointment, Patient, Doctor
from app.schemas import AppointmentCreateSchema, AppointmentUpdateSchema
from app.utils.decorators import require_user_type
from app.utils.error_handlers import handle_validation_error, handle_not_found

appointment_bp = Blueprint('appointments', __name__)


@appointment_bp.route('', methods=['POST'])
@jwt_required()
@require_user_type(['patient'])
def create_appointment():
    """
    Create a new appointment.
    Only patients can create appointments.

    Request body:
        - doctor_id: ID of the doctor
        - appointment_date: Date of appointment (YYYY-MM-DD)
        - appointment_time: Time of appointment (HH:MM)
        - reason: Reason for the appointment

    Returns:
        Created appointment info
    """
    patient_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input
    schema = AppointmentCreateSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    # Verify patient exists
    patient = Patient.query.get(patient_id)
    if not patient:
        return handle_not_found('Patient')

    # Verify doctor exists
    doctor = Doctor.query.get(validated_data['doctor_id'])
    if not doctor or not doctor.is_active:
        return jsonify({
            'error': 'not_found',
            'message': 'Doctor not found or is not available',
            'errors': {'doctor_id': ['Invalid doctor selected']}
        }), 404

    # Check for existing appointment at the same time
    existing_appointment = Appointment.query.filter_by(
        doctor_id=validated_data['doctor_id'],
        appointment_date=validated_data['appointment_date'],
        appointment_time=validated_data['appointment_time'],
        status='scheduled'
    ).first()

    if existing_appointment:
        return jsonify({
            'error': 'conflict',
            'message': 'This time slot is already booked',
            'errors': {'appointment_time': ['This time slot is not available']}
        }), 409

    try:
        # Create appointment
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=validated_data['doctor_id'],
            appointment_date=validated_data['appointment_date'],
            appointment_time=validated_data['appointment_time'],
            reason=validated_data['reason']
        )

        db.session.add(appointment)
        db.session.commit()

        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': appointment.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred while booking the appointment'
        }), 500


@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """
    Get appointment details.
    Only the patient or doctor associated with the appointment can view it.

    Args:
        appointment_id: The appointment's ID

    Returns:
        Appointment details
    """
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims.get('user_type')

    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return handle_not_found('Appointment')

    # Check authorization
    if user_type == 'patient' and appointment.patient_id != user_id:
        return jsonify({
            'error': 'forbidden',
            'message': 'You do not have permission to view this appointment'
        }), 403

    if user_type == 'doctor' and appointment.doctor_id != user_id:
        return jsonify({
            'error': 'forbidden',
            'message': 'You do not have permission to view this appointment'
        }), 403

    return jsonify({
        'appointment': appointment.to_dict()
    }), 200


@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """
    Update appointment status.
    Doctors can mark as completed or cancelled.
    Patients can only cancel their own appointments.

    Args:
        appointment_id: The appointment's ID

    Request body:
        - status: New status ('completed' or 'cancelled')

    Returns:
        Updated appointment info
    """
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims.get('user_type')
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'bad_request',
            'message': 'Request body is required'
        }), 400

    # Validate input
    schema = AppointmentUpdateSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return handle_validation_error(err.messages)

    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return handle_not_found('Appointment')

    new_status = validated_data['status']

    # Authorization checks
    if user_type == 'patient':
        if appointment.patient_id != user_id:
            return jsonify({
                'error': 'forbidden',
                'message': 'You do not have permission to modify this appointment'
            }), 403
        # Patients can only cancel
        if new_status != 'cancelled':
            return jsonify({
                'error': 'forbidden',
                'message': 'Patients can only cancel appointments'
            }), 403

    if user_type == 'doctor':
        if appointment.doctor_id != user_id:
            return jsonify({
                'error': 'forbidden',
                'message': 'You do not have permission to modify this appointment'
            }), 403

    # Check if appointment is already in a final state
    if appointment.status in ['completed', 'cancelled']:
        return jsonify({
            'error': 'bad_request',
            'message': f'Cannot modify an appointment that is already {appointment.status}'
        }), 400

    try:
        appointment.status = new_status
        db.session.commit()

        return jsonify({
            'message': f'Appointment {new_status} successfully',
            'appointment': appointment.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred while updating the appointment'
        }), 500


@appointment_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
@require_user_type(['patient'])
def cancel_appointment(appointment_id):
    """
    Cancel an appointment.
    Only patients can cancel their own appointments.

    Args:
        appointment_id: The appointment's ID

    Returns:
        Confirmation message
    """
    patient_id = get_jwt_identity()
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return handle_not_found('Appointment')

    if appointment.patient_id != patient_id:
        return jsonify({
            'error': 'forbidden',
            'message': 'You do not have permission to cancel this appointment'
        }), 403

    if appointment.status != 'scheduled':
        return jsonify({
            'error': 'bad_request',
            'message': f'Cannot cancel an appointment that is already {appointment.status}'
        }), 400

    try:
        appointment.status = 'cancelled'
        db.session.commit()

        return jsonify({
            'message': 'Appointment cancelled successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'internal_error',
            'message': 'An error occurred while cancelling the appointment'
        }), 500
