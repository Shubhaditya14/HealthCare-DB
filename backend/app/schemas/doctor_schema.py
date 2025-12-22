import re
from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError


class DoctorRegistrationSchema(Schema):
    """Schema for doctor registration validation."""

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

    specialization = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100, error="Specialization must be between 3 and 100 characters")
    )

    license_number = fields.String(
        required=True,
        validate=[
            validate.Length(min=5, max=20, error="License number must be between 5 and 20 characters"),
            validate.Regexp(r"^[A-Za-z0-9\-]+$", error="License number must be alphanumeric")
        ]
    )

    years_experience = fields.Integer(
        required=True,
        validate=validate.Range(min=0, max=70, error="Years of experience must be between 0 and 70")
    )

    password = fields.String(
        required=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters")
    )

    confirm_password = fields.String(required=True)

    agree_to_terms = fields.Boolean(required=True)

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


class DoctorLoginSchema(Schema):
    """Schema for doctor login validation."""

    email = fields.Email(required=True)
    password = fields.String(required=True)


class DoctorUpdateSchema(Schema):
    """Schema for doctor profile update validation."""

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

    specialization = fields.String(
        validate=validate.Length(min=3, max=100, error="Specialization must be between 3 and 100 characters")
    )

    years_experience = fields.Integer(
        validate=validate.Range(min=0, max=70, error="Years of experience must be between 0 and 70")
    )
