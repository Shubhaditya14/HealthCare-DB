from app import db
from datetime import datetime
from sqlalchemy.orm import relationship

class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), unique=True, nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    medication = db.Column(db.Text, nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    appointment = relationship('Appointment', back_populates='prescriptions')
    doctor = relationship('Doctor', back_populates='prescriptions')
    patient = relationship('Patient', back_populates='prescriptions')

    def __repr__(self):
        return f"<Prescription {self.id} for Appointment {self.appointment_id}>"
