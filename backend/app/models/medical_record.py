from app import db
from datetime import datetime
from sqlalchemy.orm import relationship

class MedicalRecord(db.Model):
    """Stores patient medical history for AI-powered search and analysis."""
    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  # diagnosis, lab_result, procedure, allergy, note
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    record_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Store embedding vector as JSON string (for simplicity, no pgvector needed)
    embedding = db.Column(db.Text, nullable=True)

    patient = relationship('Patient', backref='medical_records')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'record_type': self.record_type,
            'title': self.title,
            'content': self.content,
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<MedicalRecord {self.id} - {self.record_type}>"
