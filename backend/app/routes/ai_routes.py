from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

from app.services.ai_service import ollama
from app.services.drug_checker import drug_checker
from app.services.prescription_ai import prescription_ai
from app.services.rag_service import rag_service
from app.models import Patient, MedicalRecord
from app import db

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/status', methods=['GET'])
def ai_status():
    """Check if AI services are available."""
    available = ollama.is_available()
    models = ollama.list_models() if available else []

    return jsonify({
        "ai_available": available,
        "ollama_url": ollama.base_url,
        "models_loaded": models,
        "required_models": {
            "chat": ollama.chat_model,
            "embedding": ollama.embedding_model
        },
        "features": {
            "drug_interaction_check": True,
            "prescription_suggestion": True,
            "patient_history_search": available
        }
    })


@ai_bp.route('/check-interactions', methods=['POST'])
@jwt_required()
def check_drug_interactions():
    """
    Check for drug interactions.

    Request body:
    {
        "medications": ["drug1", "drug2"],
        "patient_allergies": ["allergy1"],  // optional
        "use_llm": true  // optional, default true
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "validation_error", "message": "Request body required"}), 400

    medications = data.get('medications', [])
    if not medications:
        return jsonify({"error": "validation_error", "message": "At least one medication required"}), 400

    patient_allergies = data.get('patient_allergies', [])
    use_llm = data.get('use_llm', True)

    result = drug_checker.check_interactions(
        medications=medications,
        patient_allergies=patient_allergies,
        use_llm=use_llm
    )

    return jsonify(result)


@ai_bp.route('/suggest-prescription', methods=['POST'])
@jwt_required()
def suggest_prescription():
    """
    Get AI-powered prescription suggestion.

    Request body:
    {
        "diagnosis": "condition name",
        "patient_id": 123,  // optional, to fetch patient context
        "patient_age": 45,  // optional if patient_id provided
        "patient_allergies": [],  // optional if patient_id provided
        "current_medications": [],  // optional
        "patient_conditions": []  // optional
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "validation_error", "message": "Request body required"}), 400

    diagnosis = data.get('diagnosis')
    if not diagnosis:
        return jsonify({"error": "validation_error", "message": "Diagnosis required"}), 400

    # Get patient context if patient_id provided
    patient_id = data.get('patient_id')
    patient_age = data.get('patient_age')
    patient_allergies = data.get('patient_allergies', [])
    current_medications = data.get('current_medications', [])
    patient_conditions = data.get('patient_conditions', [])

    if patient_id:
        patient = Patient.query.get(patient_id)
        if patient:
            # Calculate age from DOB
            if patient.date_of_birth and not patient_age:
                from datetime import date
                today = date.today()
                patient_age = today.year - patient.date_of_birth.year - (
                    (today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day)
                )

    result = prescription_ai.suggest_prescription(
        diagnosis=diagnosis,
        patient_age=patient_age,
        patient_allergies=patient_allergies,
        current_medications=current_medications,
        patient_conditions=patient_conditions
    )

    # Add interaction check for suggested medication
    if result.get('success') and result.get('suggestion'):
        suggested_med = result['suggestion'].get('medication', '')
        if suggested_med and current_medications:
            meds_to_check = current_medications + [suggested_med]
            interaction_check = drug_checker.check_interactions(
                medications=meds_to_check,
                patient_allergies=patient_allergies,
                use_llm=False  # Quick check only
            )
            result['interaction_check'] = interaction_check

    return jsonify(result)


@ai_bp.route('/generate-instructions', methods=['POST'])
@jwt_required()
def generate_instructions():
    """
    Generate patient-friendly medication instructions.

    Request body:
    {
        "medication": "drug name",
        "dosage": "dosage info",
        "diagnosis": "condition",
        "patient_age": 45  // optional
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "validation_error", "message": "Request body required"}), 400

    medication = data.get('medication')
    dosage = data.get('dosage')
    diagnosis = data.get('diagnosis')

    if not all([medication, dosage, diagnosis]):
        return jsonify({
            "error": "validation_error",
            "message": "medication, dosage, and diagnosis are required"
        }), 400

    result = prescription_ai.generate_instructions(
        medication=medication,
        dosage=dosage,
        diagnosis=diagnosis,
        patient_age=data.get('patient_age')
    )

    return jsonify(result)


@ai_bp.route('/search-history', methods=['POST'])
@jwt_required()
def search_patient_history():
    """
    Search patient medical history using RAG.

    Request body:
    {
        "patient_id": 123,
        "query": "cardiac history"
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "validation_error", "message": "Request body required"}), 400

    patient_id = data.get('patient_id')
    query = data.get('query')

    if not patient_id or not query:
        return jsonify({
            "error": "validation_error",
            "message": "patient_id and query are required"
        }), 400

    # Get patient
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "not_found", "message": "Patient not found"}), 404

    # Get patient's medical records
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    records_data = [r.to_dict() for r in records]

    # Add embeddings if not present
    for record in records_data:
        if not record.get('embedding'):
            db_record = MedicalRecord.query.get(record['id'])
            if db_record and not db_record.embedding:
                # Generate and store embedding
                embedding = rag_service.embed_text(
                    f"{record.get('title', '')} {record.get('content', '')}"
                )
                if embedding:
                    db_record.embedding = json.dumps(embedding)
                    db.session.commit()
                    record['embedding'] = embedding

    # Search and summarize
    result = rag_service.search_and_summarize(
        query=query,
        records=records_data,
        patient_name=patient.full_name
    )

    return jsonify(result)


@ai_bp.route('/ask-about-patient', methods=['POST'])
@jwt_required()
def ask_about_patient():
    """
    Ask a question about a patient's medical history.

    Request body:
    {
        "patient_id": 123,
        "question": "When was the last cardiac checkup?"
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "validation_error", "message": "Request body required"}), 400

    patient_id = data.get('patient_id')
    question = data.get('question')

    if not patient_id or not question:
        return jsonify({
            "error": "validation_error",
            "message": "patient_id and question are required"
        }), 400

    # Get patient
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "not_found", "message": "Patient not found"}), 404

    # Get patient's medical records
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    records_data = [r.to_dict() for r in records]

    # Answer question
    result = rag_service.answer_question(
        question=question,
        records=records_data,
        patient_name=patient.full_name
    )

    return jsonify(result)


@ai_bp.route('/load-synthetic-data', methods=['POST'])
def load_synthetic_data():
    """
    Load synthetic patient data for demo purposes.
    Only works if no patients exist or force=true.
    """
    data = request.get_json() or {}
    force = data.get('force', False)

    # Check if data already exists
    existing_patients = Patient.query.count()
    if existing_patients > 0 and not force:
        return jsonify({
            "message": f"Database already has {existing_patients} patients. Use force=true to reload.",
            "loaded": False
        })

    try:
        # Load synthetic data file
        import os
        data_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'data',
            'synthetic_patients.json'
        )

        with open(data_path, 'r') as f:
            synthetic_data = json.load(f)

        patients_created = 0
        records_created = 0

        for patient_data in synthetic_data.get('patients', []):
            # Check if patient with this email exists
            existing = Patient.query.filter_by(email=patient_data['email']).first()
            if existing:
                patient = existing
            else:
                # Create patient
                from datetime import date
                patient = Patient(
                    first_name=patient_data['first_name'],
                    last_name=patient_data['last_name'],
                    email=patient_data['email'],
                    phone='9876543210',  # Default phone
                    date_of_birth=date.today().replace(year=date.today().year - patient_data['age']),
                    blood_group=patient_data.get('blood_group'),
                    password='demo123'  # Default password for demo
                )
                db.session.add(patient)
                db.session.flush()  # Get the ID
                patients_created += 1

            # Add medical records
            for record_data in patient_data.get('medical_records', []):
                from datetime import datetime
                record = MedicalRecord(
                    patient_id=patient.id,
                    record_type=record_data['record_type'],
                    title=record_data['title'],
                    content=record_data['content'],
                    record_date=datetime.strptime(record_data['record_date'], '%Y-%m-%d').date()
                )
                db.session.add(record)
                records_created += 1

        db.session.commit()

        return jsonify({
            "message": "Synthetic data loaded successfully",
            "loaded": True,
            "patients_created": patients_created,
            "records_created": records_created
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "load_error",
            "message": str(e),
            "loaded": False
        }), 500


@ai_bp.route('/embed-all-records', methods=['POST'])
@jwt_required()
def embed_all_records():
    """
    Generate embeddings for all medical records that don't have them.
    This can take a while for large datasets.
    """
    if not ollama.is_available():
        return jsonify({
            "error": "service_unavailable",
            "message": "Ollama is not running. Start Ollama to generate embeddings."
        }), 503

    records_without_embeddings = MedicalRecord.query.filter(
        MedicalRecord.embedding.is_(None)
    ).all()

    if not records_without_embeddings:
        return jsonify({
            "message": "All records already have embeddings",
            "processed": 0
        })

    processed = 0
    errors = 0

    for record in records_without_embeddings:
        text = f"{record.title} {record.content} {record.record_type}"
        embedding = rag_service.embed_text(text)

        if embedding:
            record.embedding = json.dumps(embedding)
            processed += 1
        else:
            errors += 1

    db.session.commit()

    return jsonify({
        "message": f"Processed {processed} records",
        "processed": processed,
        "errors": errors,
        "remaining": errors
    })
