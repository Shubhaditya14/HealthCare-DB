from app import db
from datetime import datetime
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(14), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(20), unique=True, nullable=False)
    years_experience = db.Column(db.Integer, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    appointments = relationship('Appointment', back_populates='doctor', lazy=True)
    prescriptions = relationship('Prescription', back_populates='doctor', lazy=True)

    def __init__(self, **kwargs):
        """Initialize doctor with password hashing."""
        password = kwargs.pop('password', None)
        super(Doctor, self).__init__(**kwargs)
        if password:
            self.set_password(password)

    def set_password(self, password):
        """Hash and set the password."""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        """Return doctor's full name."""
        return f"Dr. {self.first_name} {self.last_name}"

    def to_dict(self, include_private=False):
        """
        Serialize doctor to dictionary.
        
        Args:
            include_private: If True, include email and phone (for own profile)
        """
        data = {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'specialization': self.specialization,
            'years_experience': self.years_experience,
        }
        
        if include_private:
            data.update({
                'email': self.email,
                'phone': self.phone,
                'license_number': self.license_number,
                'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if self.created_at else None
            })
        
        return data

    def __repr__(self):
        return f"<Doctor {self.email}>"