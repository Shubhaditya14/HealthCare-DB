import re
from datetime import date, datetime
from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError


class PatientRegistrationSchema(Schema):
    """Schema for patient registration validation."""

    first_name = fields.String(
        required=True,
        validate=[
            validate.Length(min=2, max=50, error="First name must be between 2 and 50 characters"),
            validate.Regexp(
                r"^[a-zA-Z\s\-']+$",
                error="First name can only contain letters, spaces, hyphens, and apostrophes"
            )
        ]
    )

    last_name = fields.String(
        required=True,
        validate=[
            validate.Length(min=2, max=50, error="Last name must be between 2 and 50 characters"),
            validate.Regexp(
                r"^[a-zA-Z\s\-']+$",
                error="Last name can only contain letters, spaces, hyphens, and apostrophes"
            )
        ]
    )

    email = fields.Email(
        required=True,
        validate=validate.Length(max=100, error="Email must be at most 100 characters")
    )

    phone = fields.String(
        required=True,
        validate=[
            validate.Length(min=10, max=14, error="Phone number must be between 10 and 14 characters"),
            validate.Regexp(r"^\+?[\d\s\-]+$", error="Invalid phone number format")
        ]
    )

    date_of_birth = fields.Date(
        required=True,
        format='%Y-%m-%d'
    )

    blood_group = fields.String(
        required=False,
        allow_none=True,
        validate=validate.OneOf(
            ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
            error="Invalid blood group"
        )
    )

    password = fields.String(
        required=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters")
    )

    confirm_password = fields.String(required=True)

    agree_to_terms = fields.Boolean(required=True)

    @validates('date_of_birth')
    def validate_date_of_birth(self, value, **kwargs):
        """Validate that date of birth is reasonable."""
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))

        if value > today:
            raise ValidationError("Date of birth cannot be in the future")
        if age > 120:
            raise ValidationError("Invalid date of birth - age cannot exceed 120 years")
        if age < 0:
            raise ValidationError("Invalid date of birth")

    @validates('password')
    def validate_password_strength(self, value, **kwargs):
        """Validate password meets security requirements."""
        if not re.search(r'[A-Z]', value):
            raise ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', value):
            raise ValidationError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', value):
            raise ValidationError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError("Password must contain at least one special character")

    @validates('agree_to_terms')
    def validate_terms(self, value, **kwargs):
        """Validate that terms are accepted."""
        if not value:
            raise ValidationError("You must agree to the terms and conditions")

    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        """Validate that password and confirm_password match."""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError("Passwords do not match", field_name="confirm_password")


class PatientLoginSchema(Schema):
    """Schema for patient login validation."""

    email = fields.Email(required=True)
    password = fields.String(required=True)


class PatientUpdateSchema(Schema):
    """Schema for patient profile update validation."""

    first_name = fields.String(
        validate=[
            validate.Length(min=2, max=50, error="First name must be between 2 and 50 characters"),
            validate.Regexp(
                r"^[a-zA-Z\s\-']+$",
                error="First name can only contain letters, spaces, hyphens, and apostrophes"
            )
        ]
    )

    last_name = fields.String(
        validate=[
            validate.Length(min=2, max=50, error="Last name must be between 2 and 50 characters"),
            validate.Regexp(
                r"^[a-zA-Z\s\-']+$",
                error="Last name can only contain letters, spaces, hyphens, and apostrophes"
            )
        ]
    )

    phone = fields.String(
        validate=[
            validate.Length(min=10, max=14, error="Phone number must be between 10 and 14 characters"),
            validate.Regexp(r"^\+?[\d\s\-]+$", error="Invalid phone number format")
        ]
    )

    blood_group = fields.String(
        allow_none=True,
        validate=validate.OneOf(
            ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
            error="Invalid blood group"
        )
    )
