from app import create_app, db
from app.models.patient import Patient
from app.models.doctor import Doctor
from datetime import date

app = create_app()

def create_demo_users():
    with app.app_context():
        # Check if demo users already exist
        if Patient.query.filter_by(email='patient@example.com').first():
            print("Demo patient already exists.")
        else:
            patient = Patient(
                first_name='John',
                last_name='Doe',
                email='patient@example.com',
                phone='1234567890',
                date_of_birth=date(1990, 1, 1),
                blood_group='O+',
                password='Password123!'
            )
            db.session.add(patient)
            print("Created demo patient: patient@example.com")

        if Doctor.query.filter_by(email='doctor@example.com').first():
            print("Demo doctor already exists.")
        else:
            doctor = Doctor(
                first_name='Sarah',
                last_name='Smith',
                email='doctor@example.com',
                phone='0987654321',
                specialization='Cardiology',
                license_number='LIC12345',
                years_experience=10,
                password='Password123!'
            )
            db.session.add(doctor)
            print("Created demo doctor: doctor@example.com")

        try:
            db.session.commit()
            print("Database changes committed successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating demo users: {e}")

if __name__ == '__main__':
    create_demo_users()
