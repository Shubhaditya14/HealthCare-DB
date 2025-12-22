#!/usr/bin/env python3
"""
Database Manager Script for Smart Healthcare System
====================================================
This script provides direct database access for administrative tasks,
debugging, and data management.

Usage:
    python db_manager.py [command]

Commands:
    shell       - Interactive database shell
    stats       - Show database statistics
    list        - List records from tables
    create      - Create new records
    delete      - Delete records
    reset       - Reset/recreate database
"""

import os
import sys
from datetime import datetime, date, time
from tabulate import tabulate

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.prescription import Prescription


class DatabaseManager:
    """Manager class for database operations."""

    def __init__(self):
        self.app = create_app()
        self.app.app_context().push()

    # ==================== READ OPERATIONS ====================

    def get_all_patients(self, active_only=True):
        """Get all patients from database."""
        query = Patient.query
        if active_only:
            query = query.filter_by(is_active=True)
        return query.all()

    def get_all_doctors(self, active_only=True):
        """Get all doctors from database."""
        query = Doctor.query
        if active_only:
            query = query.filter_by(is_active=True)
        return query.all()

    def get_all_appointments(self, status=None):
        """Get all appointments, optionally filtered by status."""
        query = Appointment.query
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Appointment.appointment_date.desc()).all()

    def get_all_prescriptions(self):
        """Get all prescriptions."""
        return Prescription.query.all()

    def get_patient_by_id(self, patient_id):
        """Get a patient by ID."""
        return Patient.query.get(patient_id)

    def get_patient_by_email(self, email):
        """Get a patient by email."""
        return Patient.query.filter_by(email=email).first()

    def get_doctor_by_id(self, doctor_id):
        """Get a doctor by ID."""
        return Doctor.query.get(doctor_id)

    def get_doctor_by_email(self, email):
        """Get a doctor by email."""
        return Doctor.query.filter_by(email=email).first()

    def get_appointment_by_id(self, appointment_id):
        """Get an appointment by ID."""
        return Appointment.query.get(appointment_id)

    def get_appointments_for_patient(self, patient_id):
        """Get all appointments for a patient."""
        return Appointment.query.filter_by(patient_id=patient_id).all()

    def get_appointments_for_doctor(self, doctor_id):
        """Get all appointments for a doctor."""
        return Appointment.query.filter_by(doctor_id=doctor_id).all()

    # ==================== CREATE OPERATIONS ====================

    def create_patient(self, first_name, last_name, email, phone,
                       date_of_birth, password, blood_group=None):
        """Create a new patient."""
        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            date_of_birth=date_of_birth,
            blood_group=blood_group,
            password=password
        )
        db.session.add(patient)
        db.session.commit()
        print(f"Created patient: {patient.full_name} (ID: {patient.id})")
        return patient

    def create_doctor(self, first_name, last_name, email, phone,
                      specialization, license_number, years_experience, password):
        """Create a new doctor."""
        doctor = Doctor(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            specialization=specialization,
            license_number=license_number,
            years_experience=years_experience,
            password=password
        )
        db.session.add(doctor)
        db.session.commit()
        print(f"Created doctor: {doctor.full_name} (ID: {doctor.id})")
        return doctor

    def create_appointment(self, patient_id, doctor_id, appointment_date,
                           appointment_time, reason):
        """Create a new appointment."""
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            reason=reason,
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.commit()
        print(f"Created appointment ID: {appointment.id}")
        return appointment

    def create_prescription(self, appointment_id, doctor_id, patient_id,
                            medication, dosage, instructions):
        """Create a new prescription."""
        prescription = Prescription(
            appointment_id=appointment_id,
            doctor_id=doctor_id,
            patient_id=patient_id,
            medication=medication,
            dosage=dosage,
            instructions=instructions
        )
        db.session.add(prescription)
        db.session.commit()
        print(f"Created prescription ID: {prescription.id}")
        return prescription

    # ==================== UPDATE OPERATIONS ====================

    def update_patient(self, patient_id, **kwargs):
        """Update a patient's information."""
        patient = Patient.query.get(patient_id)
        if not patient:
            print(f"Patient ID {patient_id} not found")
            return None

        for key, value in kwargs.items():
            if hasattr(patient, key) and key != 'password_hash':
                setattr(patient, key, value)

        if 'password' in kwargs:
            patient.set_password(kwargs['password'])

        db.session.commit()
        print(f"Updated patient: {patient.full_name}")
        return patient

    def update_doctor(self, doctor_id, **kwargs):
        """Update a doctor's information."""
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            print(f"Doctor ID {doctor_id} not found")
            return None

        for key, value in kwargs.items():
            if hasattr(doctor, key) and key != 'password_hash':
                setattr(doctor, key, value)

        if 'password' in kwargs:
            doctor.set_password(kwargs['password'])

        db.session.commit()
        print(f"Updated doctor: {doctor.full_name}")
        return doctor

    def update_appointment_status(self, appointment_id, status):
        """Update an appointment's status."""
        valid_statuses = ['scheduled', 'completed', 'cancelled']
        if status not in valid_statuses:
            print(f"Invalid status. Must be one of: {valid_statuses}")
            return None

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            print(f"Appointment ID {appointment_id} not found")
            return None

        appointment.status = status
        db.session.commit()
        print(f"Updated appointment {appointment_id} status to: {status}")
        return appointment

    # ==================== DELETE OPERATIONS ====================

    def delete_patient(self, patient_id, hard_delete=False):
        """Delete a patient (soft delete by default)."""
        patient = Patient.query.get(patient_id)
        if not patient:
            print(f"Patient ID {patient_id} not found")
            return False

        if hard_delete:
            db.session.delete(patient)
            print(f"Hard deleted patient: {patient.full_name}")
        else:
            patient.is_active = False
            print(f"Soft deleted patient: {patient.full_name}")

        db.session.commit()
        return True

    def delete_doctor(self, doctor_id, hard_delete=False):
        """Delete a doctor (soft delete by default)."""
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            print(f"Doctor ID {doctor_id} not found")
            return False

        if hard_delete:
            db.session.delete(doctor)
            print(f"Hard deleted doctor: {doctor.full_name}")
        else:
            doctor.is_active = False
            print(f"Soft deleted doctor: {doctor.full_name}")

        db.session.commit()
        return True

    def delete_appointment(self, appointment_id):
        """Delete an appointment."""
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            print(f"Appointment ID {appointment_id} not found")
            return False

        db.session.delete(appointment)
        db.session.commit()
        print(f"Deleted appointment ID: {appointment_id}")
        return True

    # ==================== UTILITY OPERATIONS ====================

    def get_statistics(self):
        """Get database statistics."""
        stats = {
            'Total Patients': Patient.query.count(),
            'Active Patients': Patient.query.filter_by(is_active=True).count(),
            'Total Doctors': Doctor.query.count(),
            'Active Doctors': Doctor.query.filter_by(is_active=True).count(),
            'Total Appointments': Appointment.query.count(),
            'Scheduled Appointments': Appointment.query.filter_by(status='scheduled').count(),
            'Completed Appointments': Appointment.query.filter_by(status='completed').count(),
            'Cancelled Appointments': Appointment.query.filter_by(status='cancelled').count(),
            'Total Prescriptions': Prescription.query.count(),
        }
        return stats

    def print_statistics(self):
        """Print formatted database statistics."""
        stats = self.get_statistics()
        print("\n" + "="*50)
        print("DATABASE STATISTICS")
        print("="*50)
        for key, value in stats.items():
            print(f"  {key}: {value}")
        print("="*50 + "\n")

    def print_patients(self, active_only=True):
        """Print all patients in table format."""
        patients = self.get_all_patients(active_only)
        if not patients:
            print("No patients found.")
            return

        headers = ['ID', 'Name', 'Email', 'Phone', 'DOB', 'Blood Group', 'Active']
        rows = []
        for p in patients:
            rows.append([
                p.id, p.full_name, p.email, p.phone,
                p.date_of_birth.strftime('%Y-%m-%d') if p.date_of_birth else 'N/A',
                p.blood_group or 'N/A',
                'Yes' if p.is_active else 'No'
            ])

        print("\n" + tabulate(rows, headers=headers, tablefmt='grid') + "\n")

    def print_doctors(self, active_only=True):
        """Print all doctors in table format."""
        doctors = self.get_all_doctors(active_only)
        if not doctors:
            print("No doctors found.")
            return

        headers = ['ID', 'Name', 'Email', 'Specialization', 'License', 'Experience', 'Active']
        rows = []
        for d in doctors:
            rows.append([
                d.id, d.full_name, d.email, d.specialization,
                d.license_number, f"{d.years_experience} yrs",
                'Yes' if d.is_active else 'No'
            ])

        print("\n" + tabulate(rows, headers=headers, tablefmt='grid') + "\n")

    def print_appointments(self, status=None):
        """Print all appointments in table format."""
        appointments = self.get_all_appointments(status)
        if not appointments:
            print("No appointments found.")
            return

        headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Reason']
        rows = []
        for a in appointments:
            rows.append([
                a.id,
                a.patient.full_name if a.patient else 'N/A',
                a.doctor.full_name if a.doctor else 'N/A',
                a.appointment_date.strftime('%Y-%m-%d') if a.appointment_date else 'N/A',
                a.appointment_time.strftime('%H:%M') if a.appointment_time else 'N/A',
                a.status,
                a.reason[:30] + '...' if len(a.reason) > 30 else a.reason
            ])

        print("\n" + tabulate(rows, headers=headers, tablefmt='grid') + "\n")

    def reset_database(self, confirm=False):
        """Drop all tables and recreate them."""
        if not confirm:
            print("WARNING: This will delete all data!")
            response = input("Type 'yes' to confirm: ")
            if response.lower() != 'yes':
                print("Operation cancelled.")
                return False

        db.drop_all()
        db.create_all()
        print("Database has been reset.")
        return True

    def create_tables(self):
        """Create all tables if they don't exist."""
        db.create_all()
        print("Database tables created successfully.")

    def seed_sample_data(self):
        """Add sample data for testing."""
        # Create sample doctors
        if Doctor.query.count() == 0:
            doctors = [
                {
                    'first_name': 'John', 'last_name': 'Smith',
                    'email': 'dr.smith@hospital.com', 'phone': '+1234567890',
                    'specialization': 'Cardiology', 'license_number': 'MD12345',
                    'years_experience': 15, 'password': 'Doctor@123'
                },
                {
                    'first_name': 'Sarah', 'last_name': 'Johnson',
                    'email': 'dr.johnson@hospital.com', 'phone': '+1234567891',
                    'specialization': 'Dermatology', 'license_number': 'MD12346',
                    'years_experience': 10, 'password': 'Doctor@123'
                },
                {
                    'first_name': 'Michael', 'last_name': 'Brown',
                    'email': 'dr.brown@hospital.com', 'phone': '+1234567892',
                    'specialization': 'Neurology', 'license_number': 'MD12347',
                    'years_experience': 20, 'password': 'Doctor@123'
                }
            ]
            for doc_data in doctors:
                self.create_doctor(**doc_data)
            print("Sample doctors created.")

        # Create sample patients
        if Patient.query.count() == 0:
            patients = [
                {
                    'first_name': 'Alice', 'last_name': 'Williams',
                    'email': 'alice@email.com', 'phone': '+1987654321',
                    'date_of_birth': date(1990, 5, 15), 'blood_group': 'A+',
                    'password': 'Patient@123'
                },
                {
                    'first_name': 'Bob', 'last_name': 'Davis',
                    'email': 'bob@email.com', 'phone': '+1987654322',
                    'date_of_birth': date(1985, 8, 22), 'blood_group': 'O-',
                    'password': 'Patient@123'
                }
            ]
            for patient_data in patients:
                self.create_patient(**patient_data)
            print("Sample patients created.")

        print("Sample data seeding complete.")

    def run_raw_sql(self, sql_query):
        """Execute raw SQL query (use with caution)."""
        try:
            result = db.session.execute(db.text(sql_query))
            db.session.commit()

            # Try to fetch results for SELECT queries
            try:
                rows = result.fetchall()
                if rows:
                    print(tabulate(rows, headers=result.keys(), tablefmt='grid'))
                return rows
            except:
                print("Query executed successfully.")
                return None
        except Exception as e:
            db.session.rollback()
            print(f"Error executing query: {e}")
            return None


def interactive_shell():
    """Start an interactive database shell."""
    manager = DatabaseManager()

    print("\n" + "="*60)
    print("  SMART HEALTHCARE DATABASE MANAGER")
    print("  Interactive Shell")
    print("="*60)
    print("\nAvailable commands:")
    print("  stats       - Show database statistics")
    print("  patients    - List all patients")
    print("  doctors     - List all doctors")
    print("  appointments- List all appointments")
    print("  sql <query> - Execute raw SQL query")
    print("  seed        - Add sample data")
    print("  reset       - Reset database (WARNING: deletes all data)")
    print("  help        - Show this help message")
    print("  exit        - Exit the shell")
    print("\nYou also have access to 'manager' object for programmatic access.")
    print("Example: manager.get_all_patients()")
    print("="*60 + "\n")

    while True:
        try:
            cmd = input("db> ").strip()

            if not cmd:
                continue
            elif cmd == 'exit' or cmd == 'quit':
                print("Goodbye!")
                break
            elif cmd == 'help':
                print("\nCommands: stats, patients, doctors, appointments, sql, seed, reset, exit\n")
            elif cmd == 'stats':
                manager.print_statistics()
            elif cmd == 'patients':
                manager.print_patients(active_only=False)
            elif cmd == 'doctors':
                manager.print_doctors(active_only=False)
            elif cmd == 'appointments':
                manager.print_appointments()
            elif cmd.startswith('sql '):
                query = cmd[4:].strip()
                manager.run_raw_sql(query)
            elif cmd == 'seed':
                manager.seed_sample_data()
            elif cmd == 'reset':
                manager.reset_database()
            else:
                # Try to evaluate as Python expression
                try:
                    result = eval(cmd)
                    if result is not None:
                        print(result)
                except:
                    print(f"Unknown command: {cmd}. Type 'help' for available commands.")

        except KeyboardInterrupt:
            print("\nUse 'exit' to quit.")
        except Exception as e:
            print(f"Error: {e}")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        # No arguments, start interactive shell
        interactive_shell()
        return

    command = sys.argv[1].lower()
    manager = DatabaseManager()

    if command == 'shell':
        interactive_shell()
    elif command == 'stats':
        manager.print_statistics()
    elif command == 'init':
        manager.create_tables()
    elif command == 'seed':
        manager.seed_sample_data()
    elif command == 'reset':
        manager.reset_database()
    elif command == 'patients':
        manager.print_patients(active_only=False)
    elif command == 'doctors':
        manager.print_doctors(active_only=False)
    elif command == 'appointments':
        manager.print_appointments()
    else:
        print(f"Unknown command: {command}")
        print("Available: shell, stats, init, seed, reset, patients, doctors, appointments")


if __name__ == '__main__':
    main()