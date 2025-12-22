from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .doctor_routes import doctor_bp
from .appointment_routes import appointment_bp

__all__ = ['auth_bp', 'patient_bp', 'doctor_bp', 'appointment_bp']
