from datetime import date, datetime
from marshmallow import Schema, fields, validate, validates, ValidationError


class AppointmentCreateSchema(Schema):
    """Schema for appointment creation validation."""

    doctor_id = fields.Integer(required=True)

    appointment_date = fields.Date(
        required=True,
        format='%Y-%m-%d'
    )

    appointment_time = fields.Time(
        required=True,
        format='%H:%M'
    )

    reason = fields.String(
        required=True,
        validate=validate.Length(
            min=10,
            max=500,
            error="Reason must be between 10 and 500 characters"
        )
    )

    @validates('appointment_date')
    def validate_appointment_date(self, value, **kwargs):
        """Validate that appointment date is not in the past."""
        if value < date.today():
            raise ValidationError("Appointment date cannot be in the past")

    @validates('appointment_time')
    def validate_appointment_time(self, value, **kwargs):
        """Validate that appointment time is within working hours."""
        # Assuming working hours are 8 AM to 6 PM
        if value.hour < 8 or value.hour >= 18:
            raise ValidationError("Appointment time must be between 8:00 AM and 6:00 PM")


class AppointmentUpdateSchema(Schema):
    """Schema for appointment update validation."""

    status = fields.String(
        required=True,
        validate=validate.OneOf(
            ['scheduled', 'completed', 'cancelled'],
            error="Invalid status. Must be 'scheduled', 'completed', or 'cancelled'"
        )
    )
