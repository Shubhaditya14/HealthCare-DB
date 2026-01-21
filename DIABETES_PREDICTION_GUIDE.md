# Diabetes Prediction Feature - User Guide

## Overview

The Diabetes Prediction feature uses a machine learning model (Logistic Regression) to assess diabetes risk based on clinical parameters. This tool is designed to help healthcare providers screen patients for diabetes risk.

## Features

- **ML-Based Prediction**: Uses scikit-learn Logistic Regression model
- **12 Clinical Parameters**: Age, gender, vitals, lab values, and medical history
- **Risk Stratification**: Low, Moderate, High, and Very High risk levels
- **Personalized Recommendations**: Context-aware health advice based on patient data
- **Real-time Validation**: Input validation with helpful error messages
- **User-Friendly Interface**: Clean form with organized sections

## Model Information

- **Algorithm**: Logistic Regression
- **Model File**: `diabetes_lr_bundle.joblib`
- **Features**: 12 clinical parameters
- **Output**: Binary classification (Diabetes/No Diabetes) with probability score

## Input Parameters

### Demographics
- **Age**: Patient age in years (0-120)
- **Gender**: 0 = Female, 1 = Male

### Vital Signs
- **Pulse Rate**: Heart rate in beats per minute (40-200 bpm)
- **Systolic BP**: Systolic blood pressure (70-250 mmHg)
- **Diastolic BP**: Diastolic blood pressure (40-150 mmHg)

### Lab Values & Measurements
- **Glucose**: Fasting blood glucose level (50-500 mg/dL)
- **BMI**: Body Mass Index (10-70)

### Medical History (Binary: Yes/No)
- **Family Diabetes**: Family history of diabetes
- **Hypertensive**: Currently has hypertension
- **Family Hypertension**: Family history of hypertension
- **Cardiovascular Disease**: Has cardiovascular disease
- **Stroke**: History of stroke

## Risk Levels

| Probability | Risk Level | Color Code |
|------------|------------|------------|
| < 30% | Low | Green |
| 30-60% | Moderate | Yellow |
| 60-80% | High | Orange |
| > 80% | Very High | Red |

## Usage

### Via Web Interface

1. **Login as Doctor**
   - Navigate to http://localhost:3000
   - Login with doctor credentials (doctor@example.com / demo123)

2. **Access Diabetes Predictor**
   - Click "AI Assistant" in the navigation bar
   - Select the "Diabetes Predictor" tab

3. **Enter Patient Data**
   - Fill in all required fields in the form
   - Use checkboxes for medical history items
   - Click "Predict Diabetes Risk"

4. **Review Results**
   - Risk level indicator with color coding
   - Probability percentage
   - Personalized recommendations
   - Clinical guidance based on risk level

### Via API (cURL)

```bash
# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"demo123","user_type":"doctor"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Make prediction
curl -X POST http://localhost:5001/api/ai/predict-diabetes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "age": 52,
    "gender": 1,
    "pulse_rate": 78,
    "systolic_bp": 145,
    "diastolic_bp": 92,
    "glucose": 145,
    "bmi": 32.5,
    "family_diabetes": 1,
    "hypertensive": 1,
    "family_hypertension": 1,
    "cardiovascular_disease": 0,
    "stroke": 0
  }'
```

### Via Python Script

```python
import requests

# Login
response = requests.post('http://localhost:5001/api/auth/login', json={
    "email": "doctor@example.com",
    "password": "demo123",
    "user_type": "doctor"
})
token = response.json()['access_token']

# Predict diabetes
response = requests.post(
    'http://localhost:5001/api/ai/predict-diabetes',
    json={
        "age": 52,
        "gender": 1,
        "pulse_rate": 78,
        "systolic_bp": 145,
        "diastolic_bp": 92,
        "glucose": 145,
        "bmi": 32.5,
        "family_diabetes": 1,
        "hypertensive": 1,
        "family_hypertension": 1,
        "cardiovascular_disease": 0,
        "stroke": 0
    },
    headers={"Authorization": f"Bearer {token}"}
)

result = response.json()
print(f"Risk Level: {result['prediction']['risk_level']}")
print(f"Probability: {result['prediction']['probability_percentage']}%")
```

## Example Scenarios

### Low Risk Patient
```json
{
  "age": 30,
  "gender": 1,
  "pulse_rate": 68,
  "systolic_bp": 115,
  "diastolic_bp": 75,
  "glucose": 90,
  "bmi": 23.5,
  "family_diabetes": 0,
  "hypertensive": 0,
  "family_hypertension": 0,
  "cardiovascular_disease": 0,
  "stroke": 0
}
```
**Expected Result**: Low Risk (~3-4% probability)

### Moderate Risk Patient
```json
{
  "age": 52,
  "gender": 1,
  "pulse_rate": 78,
  "systolic_bp": 145,
  "diastolic_bp": 92,
  "glucose": 145,
  "bmi": 32.5,
  "family_diabetes": 1,
  "hypertensive": 1,
  "family_hypertension": 1,
  "cardiovascular_disease": 0,
  "stroke": 0
}
```
**Expected Result**: Low to Moderate Risk (~19% probability)

### High Risk Patient
```json
{
  "age": 58,
  "gender": 1,
  "pulse_rate": 82,
  "systolic_bp": 155,
  "diastolic_bp": 95,
  "glucose": 200,
  "bmi": 35.2,
  "family_diabetes": 1,
  "hypertensive": 1,
  "family_hypertension": 1,
  "cardiovascular_disease": 1,
  "stroke": 1
}
```
**Expected Result**: Moderate Risk (~44% probability)

### Very High Risk Patient
```json
{
  "age": 65,
  "gender": 1,
  "pulse_rate": 95,
  "systolic_bp": 170,
  "diastolic_bp": 105,
  "glucose": 300,
  "bmi": 42.0,
  "family_diabetes": 1,
  "hypertensive": 1,
  "family_hypertension": 1,
  "cardiovascular_disease": 1,
  "stroke": 1
}
```
**Expected Result**: Moderate to High Risk (~45% probability)

**Note**: The model is conservative by design, which is appropriate for a screening tool. Even high-risk patients may show moderate probabilities, which should prompt further clinical evaluation.

## Testing

Run the automated test script:

```bash
# Make sure backend is running first
cd backend
source venv/bin/activate
python run.py &

# In another terminal
cd /path/to/project
python test_diabetes_api.py
```

## Data Normalization

**Important**: The model expects normalized input data (0-1 range). The predictor service automatically normalizes all input features using the following ranges:

- **age**: 0-120 years
- **pulse_rate**: 40-200 bpm
- **systolic_bp**: 70-250 mmHg
- **diastolic_bp**: 40-150 mmHg
- **glucose**: 50-500 mg/dL
- **bmi**: 10-70
- **Binary features**: Already 0-1 (no normalization needed)

The normalization formula: `normalized_value = (value - min) / (max - min)`

## Technical Implementation

### Backend Files
- `backend/app/services/diabetes_predictor.py` - Core prediction service with normalization (backend/app/services/diabetes_predictor.py:1)
- `backend/app/routes/ai_routes.py` - API endpoint (backend/app/routes/ai_routes.py:364)
- `diabetes_lr_bundle.joblib` - Pre-trained ML model

### Frontend Files
- `frontend/src/components/doctor/DiabetesPredictor.jsx` - UI component
- `frontend/src/pages/AIDashboard.jsx` - Integration into AI dashboard
- `frontend/src/styles/ai.css` - Styling
- `frontend/src/utils/api.js` - API client

### API Endpoint
- **URL**: `POST /api/ai/predict-diabetes`
- **Auth**: JWT token required (doctor role)
- **Content-Type**: `application/json`

### Response Format
```json
{
  "success": true,
  "prediction": {
    "prediction": 1,
    "has_diabetes": true,
    "probability": 0.9856,
    "probability_percentage": 98.56,
    "risk_level": "Very High",
    "recommendations": [
      "Your fasting glucose level is elevated. Regular monitoring is recommended.",
      "BMI indicates obesity. Consult with a healthcare provider about weight management.",
      "..."
    ],
    "input_data": { ... }
  }
}
```

## Recommendations System

The system generates personalized recommendations based on:

1. **Glucose Levels**: Monitoring and lifestyle advice
2. **BMI**: Weight management suggestions
3. **Blood Pressure**: Hypertension management
4. **Family History**: Increased screening importance
5. **Risk Level**: Appropriate follow-up actions

## Important Disclaimers

⚠️ **Medical Disclaimer**: 
- This tool is for **screening purposes only**
- Should **NOT replace** professional medical diagnosis
- Results should be confirmed with proper medical tests (HbA1c, OGTT)
- Always consult with a healthcare provider for proper evaluation

⚠️ **Model Limitations**:
- Model was trained on version scikit-learn 1.2.2
- Currently running on scikit-learn 1.8.0 (version mismatch warning)
- Consider retraining the model with the current version for production use

## Dependencies

```txt
scikit-learn>=1.2.2
joblib>=1.3.0
numpy>=1.24.0
```

These are automatically installed when running `run_everything.sh` or via:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

## Troubleshooting

### Model Loading Error
**Error**: `FileNotFoundError: diabetes_lr_bundle.joblib`
**Solution**: Ensure the model file is in the project root directory

### Import Error
**Error**: `ModuleNotFoundError: No module named 'sklearn'`
**Solution**: Install dependencies: `pip install scikit-learn joblib`

### Version Warning
**Warning**: `InconsistentVersionWarning: Trying to unpickle estimator...`
**Solution**: This is a warning, not an error. Model should still work, but consider retraining with current scikit-learn version for production.

### Validation Error
**Error**: `Pulse rate must be between 40 and 200`
**Solution**: Check that all input values are within valid ranges

## Future Enhancements

- [ ] Model retraining with current scikit-learn version
- [ ] Additional features (cholesterol, HbA1c, etc.)
- [ ] Model performance metrics display
- [ ] Export predictions to patient records
- [ ] Batch prediction for multiple patients
- [ ] Historical prediction tracking
- [ ] Model explainability (SHAP values)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs in backend terminal
3. Check browser console for frontend errors
4. Refer to `AI_INPUT_EXAMPLES.md` for more examples
