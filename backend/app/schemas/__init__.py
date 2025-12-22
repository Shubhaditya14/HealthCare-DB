from .patient_schema import PatientRegistrationSchema, PatientLoginSchema, PatientUpdateSchema
from .doctor_schema import DoctorRegistrationSchema, DoctorLoginSchema, DoctorUpdateSchema
from .appointment_schema import AppointmentCreateSchema, AppointmentUpdateSchema

__all__ = [
    'PatientRegistrationSchema',
    'PatientLoginSchema',
    'PatientUpdateSchema',
    'DoctorRegistrationSchema',
    'DoctorLoginSchema',
    'DoctorUpdateSchema',
    'AppointmentCreateSchema',
    'AppointmentUpdateSchema'
]
