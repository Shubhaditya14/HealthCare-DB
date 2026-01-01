# AI Features - Input Examples

This document provides example inputs for testing all AI features in the Smart Healthcare System.

---

## 1. Drug Interaction Checker

Checks for potential drug-drug interactions and allergy conflicts.

### Example Inputs

**Basic Check (2 medications):**
```json
{
  "medications": ["warfarin", "aspirin"],
  "patient_allergies": []
}
```

**With Allergies:**
```json
{
  "medications": ["amoxicillin", "ibuprofen"],
  "patient_allergies": ["penicillin", "sulfa drugs"]
}
```

**Multiple Medications:**
```json
{
  "medications": ["metformin", "lisinopril", "simvastatin", "aspirin"],
  "patient_allergies": ["codeine"]
}
```

**High-Risk Combination:**
```json
{
  "medications": ["warfarin", "ibuprofen", "aspirin"],
  "patient_allergies": []
}
```

**Cardiac Patient:**
```json
{
  "medications": ["digoxin", "amiodarone", "furosemide"],
  "patient_allergies": []
}
```

**Mental Health:**
```json
{
  "medications": ["fluoxetine", "tramadol"],
  "patient_allergies": []
}
```

**Antibiotic Check:**
```json
{
  "medications": ["ciprofloxacin", "antacids", "methotrexate"],
  "patient_allergies": ["erythromycin"]
}
```

---

## 2. Prescription Assistant

Suggests medications based on diagnosis and patient information.

### Example Inputs

**Diabetes:**
```json
{
  "diagnosis": "Type 2 Diabetes",
  "patient_age": 52,
  "patient_allergies": [],
  "current_medications": ["lisinopril"],
  "patient_conditions": ["hypertension"]
}
```

**Hypertension:**
```json
{
  "diagnosis": "Essential Hypertension",
  "patient_age": 45,
  "patient_allergies": ["ACE inhibitors"],
  "current_medications": [],
  "patient_conditions": []
}
```

**Depression:**
```json
{
  "diagnosis": "Major Depressive Disorder",
  "patient_age": 34,
  "patient_allergies": [],
  "current_medications": ["birth control"],
  "patient_conditions": ["anxiety"]
}
```

**Infection:**
```json
{
  "diagnosis": "Bacterial Upper Respiratory Infection",
  "patient_age": 28,
  "patient_allergies": ["penicillin"],
  "current_medications": [],
  "patient_conditions": []
}
```

**Pain Management:**
```json
{
  "diagnosis": "Chronic Lower Back Pain",
  "patient_age": 55,
  "patient_allergies": ["NSAIDs"],
  "current_medications": ["gabapentin"],
  "patient_conditions": ["peptic ulcer history"]
}
```

**Acid Reflux:**
```json
{
  "diagnosis": "Gastroesophageal Reflux Disease (GERD)",
  "patient_age": 40,
  "patient_allergies": [],
  "current_medications": [],
  "patient_conditions": []
}
```

**Anxiety:**
```json
{
  "diagnosis": "Generalized Anxiety Disorder",
  "patient_age": 29,
  "patient_allergies": [],
  "current_medications": [],
  "patient_conditions": []
}
```

**Asthma:**
```json
{
  "diagnosis": "Moderate Persistent Asthma",
  "patient_age": 19,
  "patient_allergies": ["peanuts"],
  "current_medications": ["albuterol inhaler"],
  "patient_conditions": []
}
```

**High Cholesterol:**
```json
{
  "diagnosis": "Hyperlipidemia",
  "patient_age": 58,
  "patient_allergies": [],
  "current_medications": ["metformin", "lisinopril"],
  "patient_conditions": ["type 2 diabetes", "hypertension"]
}
```

**Allergies:**
```json
{
  "diagnosis": "Seasonal Allergic Rhinitis",
  "patient_age": 25,
  "patient_allergies": [],
  "current_medications": [],
  "patient_conditions": []
}
```

---

## 3. Patient History Search (RAG)

Search patient medical records using natural language queries.

### Example Queries

**Cardiac History:**
```json
{
  "patient_id": 3,
  "query": "cardiac history and heart problems"
}
```

**Diabetes Management:**
```json
{
  "patient_id": 1,
  "query": "diabetes treatment and blood sugar control"
}
```

**Allergies:**
```json
{
  "patient_id": 9,
  "query": "allergies and allergic reactions"
}
```

**Mental Health:**
```json
{
  "patient_id": 7,
  "query": "cognitive decline and memory issues"
}
```

**Lab Results:**
```json
{
  "patient_id": 4,
  "query": "thyroid function tests and lab results"
}
```

**Surgical History:**
```json
{
  "patient_id": 3,
  "query": "surgical procedures and interventions"
}
```

**Medication History:**
```json
{
  "patient_id": 1,
  "query": "medication changes and dosage adjustments"
}
```

**Cancer History:**
```json
{
  "patient_id": 10,
  "query": "cancer treatment and oncology follow-up"
}
```

**GI Issues:**
```json
{
  "patient_id": 5,
  "query": "stomach problems and digestive issues"
}
```

**Pregnancy:**
```json
{
  "patient_id": 6,
  "query": "prenatal care and pregnancy progress"
}
```

---

## 4. Ask About Patient

Ask specific questions about a patient's medical history.

### Example Questions

**Last Visit:**
```json
{
  "patient_id": 1,
  "question": "When was the last follow-up appointment?"
}
```

**Current Medications:**
```json
{
  "patient_id": 3,
  "question": "What medications is this patient currently taking?"
}
```

**Diagnosis Date:**
```json
{
  "patient_id": 7,
  "question": "When was the Alzheimer's diagnosis made?"
}
```

**Treatment Response:**
```json
{
  "patient_id": 2,
  "question": "How has the patient responded to anxiety treatment?"
}
```

**Lab Values:**
```json
{
  "patient_id": 1,
  "question": "What was the most recent HbA1c level?"
}
```

**Allergies:**
```json
{
  "patient_id": 5,
  "question": "Does this patient have any drug allergies?"
}
```

**Surgical History:**
```json
{
  "patient_id": 3,
  "question": "Has this patient had any cardiac procedures?"
}
```

**Family History:**
```json
{
  "patient_id": 10,
  "question": "What type of cancer was diagnosed and what stage?"
}
```

**Lifestyle:**
```json
{
  "patient_id": 3,
  "question": "Has the patient made any lifestyle changes?"
}
```

**Prognosis:**
```json
{
  "patient_id": 7,
  "question": "What is the current cognitive status?"
}
```

---

## 5. Generate Instructions

Generate patient-friendly medication instructions.

### Example Inputs

**Diabetes Medication:**
```json
{
  "medication": "Metformin",
  "dosage": "500mg twice daily",
  "diagnosis": "Type 2 Diabetes",
  "patient_age": 52
}
```

**Blood Pressure:**
```json
{
  "medication": "Lisinopril",
  "dosage": "10mg once daily",
  "diagnosis": "Hypertension",
  "patient_age": 45
}
```

**Antidepressant:**
```json
{
  "medication": "Sertraline",
  "dosage": "50mg once daily",
  "diagnosis": "Depression",
  "patient_age": 34
}
```

**Antibiotic:**
```json
{
  "medication": "Azithromycin",
  "dosage": "500mg day 1, then 250mg days 2-5",
  "diagnosis": "Bacterial Infection",
  "patient_age": 28
}
```

**Pain Reliever:**
```json
{
  "medication": "Ibuprofen",
  "dosage": "400mg every 6 hours as needed",
  "diagnosis": "Acute Pain",
  "patient_age": 40
}
```

**Cholesterol:**
```json
{
  "medication": "Atorvastatin",
  "dosage": "20mg once daily at bedtime",
  "diagnosis": "High Cholesterol",
  "patient_age": 55
}
```

---

## Synthetic Patient Reference

| ID | Name | Conditions | Allergies |
|----|------|------------|-----------|
| 1 | Rajesh Kumar | Diabetes, Hypertension | Penicillin |
| 2 | Priya Sharma | Anxiety, Migraine | Sulfa, Shellfish |
| 3 | Amit Patel | CAD, Post-MI | None |
| 4 | Sunita Reddy | Hypothyroidism | Latex, Iodine |
| 5 | Mohammed Khan | Peptic Ulcer | Aspirin, NSAIDs |
| 6 | Ananya Gupta | Pregnancy | None |
| 7 | Vikram Singh | Alzheimer's, Depression | Codeine |
| 8 | Deepa Nair | Rheumatoid Arthritis | Bee stings |
| 9 | Arjun Mehta | Asthma, Peanut Allergy | Peanuts |
| 10 | Kavita Desai | Breast Cancer Survivor | None |
| 11 | Rahul Joshi | Kidney Stones, Gout | Erythromycin |
| 12 | Neha Agarwal | Ulcerative Colitis | None |
| 13 | Sanjay Verma | Type 1 Diabetes, Nephropathy | Sulfonamides |
| 14 | Pooja Saxena | Depression, Insomnia | Amoxicillin |
| 15 | Anil Kapoor | Parkinson's Disease | None |
| 16 | Meera Iyer | Chronic Migraine | Ibuprofen |
| 17 | Ravi Krishnan | Hypertension, Sleep Apnea | Contrast dye |
| 18 | Lakshmi Rao | Diabetes, Heart Failure | Morphine |
| 19 | Suresh Menon | Chronic Pain, Neuropathy | None |
| 20 | Geeta Bhatt | Osteoporosis, GERD | Tetracycline |

---

## Using in Frontend

1. Login as doctor (doctor@example.com / demo123)
2. Click "AI Assistant" in navbar
3. Select a tab:
   - **Drug Interactions**: Enter medications one by one
   - **Prescription Assistant**: Fill in the diagnosis form
   - **Patient History**: Select patient ID and enter query

---

## Using with curl

First get a token:
```bash
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"demo123","user_type":"doctor"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
```

Then use any endpoint:
```bash
curl -X POST http://localhost:5001/api/ai/check-interactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"medications": ["warfarin", "aspirin"]}'
```
