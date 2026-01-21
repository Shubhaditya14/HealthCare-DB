"""
Diabetes Prediction Service
Uses the diabetes_lr_bundle.joblib model to predict diabetes risk
"""
import os
import joblib
import numpy as np
from pathlib import Path

class DiabetesPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = [
            'age', 'gender', 'pulse_rate', 'systolic_bp', 'diastolic_bp',
            'glucose', 'bmi', 'family_diabetes', 'hypertensive',
            'family_hypertension', 'cardiovascular_disease', 'stroke'
        ]
        self._load_model()
    
    def _load_model(self):
        """Load the diabetes prediction model"""
        try:
            # Get the project root directory
            current_dir = Path(__file__).resolve()
            project_root = current_dir.parent.parent.parent.parent
            model_path = project_root / 'diabetes_lr_bundle.joblib'
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found at {model_path}")
            
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            print(f"✓ Diabetes prediction model loaded successfully from {model_path}")
        except Exception as e:
            print(f"✗ Error loading diabetes model: {str(e)}")
            raise
    
    def validate_input(self, data: dict) -> tuple[bool, str]:
        """
        Validate input data
        Returns: (is_valid, error_message)
        """
        # Check all required features are present
        missing_features = [f for f in self.feature_names if f not in data]
        if missing_features:
            return False, f"Missing required features: {', '.join(missing_features)}"
        
        # Validate ranges
        validations = {
            'age': (0, 120, 'Age must be between 0 and 120'),
            'gender': (0, 1, 'Gender must be 0 (female) or 1 (male)'),
            'pulse_rate': (40, 200, 'Pulse rate must be between 40 and 200'),
            'systolic_bp': (70, 250, 'Systolic BP must be between 70 and 250'),
            'diastolic_bp': (40, 150, 'Diastolic BP must be between 40 and 150'),
            'glucose': (50, 500, 'Glucose must be between 50 and 500'),
            'bmi': (10, 70, 'BMI must be between 10 and 70'),
            'family_diabetes': (0, 1, 'Family diabetes must be 0 or 1'),
            'hypertensive': (0, 1, 'Hypertensive must be 0 or 1'),
            'family_hypertension': (0, 1, 'Family hypertension must be 0 or 1'),
            'cardiovascular_disease': (0, 1, 'Cardiovascular disease must be 0 or 1'),
            'stroke': (0, 1, 'Stroke must be 0 or 1')
        }
        
        for feature, (min_val, max_val, error_msg) in validations.items():
            try:
                value = float(data[feature])
                if not min_val <= value <= max_val:
                    return False, error_msg
            except (ValueError, TypeError):
                return False, f"{feature} must be a valid number"
        
        return True, ""
    
    def _normalize_features(self, patient_data: dict) -> np.ndarray:
        """
        Normalize input features to 0-1 range as expected by the model.
        The model was trained on normalized data.
        """
        # Feature normalization ranges based on validation ranges
        normalization_params = {
            'age': (0, 120),
            'gender': (0, 1),  # already normalized
            'pulse_rate': (40, 200),
            'systolic_bp': (70, 250),
            'diastolic_bp': (40, 150),
            'glucose': (50, 500),
            'bmi': (10, 70),
            'family_diabetes': (0, 1),  # already normalized
            'hypertensive': (0, 1),  # already normalized
            'family_hypertension': (0, 1),  # already normalized
            'cardiovascular_disease': (0, 1),  # already normalized
            'stroke': (0, 1)  # already normalized
        }
        
        normalized_features = []
        for feature in self.feature_names:
            value = float(patient_data[feature])
            min_val, max_val = normalization_params[feature]
            
            # Normalize to 0-1 range
            if max_val > min_val:
                normalized_value = (value - min_val) / (max_val - min_val)
                # Clip to [0, 1] range
                normalized_value = max(0.0, min(1.0, normalized_value))
            else:
                normalized_value = value
            
            normalized_features.append(normalized_value)
        
        return np.array([normalized_features])
    
    def predict(self, patient_data: dict) -> dict:
        """
        Predict diabetes risk for a patient
        
        Args:
            patient_data: Dictionary containing patient features
            
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Validate input
        is_valid, error_msg = self.validate_input(patient_data)
        if not is_valid:
            raise ValueError(error_msg)
        
        # Normalize features (model expects normalized data)
        features = self._normalize_features(patient_data)
        
        # Make prediction
        prediction = self.model.predict(features)[0]
        probability = self.model.predict_proba(features)[0]
        
        # Get probability for positive class (diabetes)
        diabetes_probability = probability[1] if len(probability) > 1 else probability[0]
        
        # Determine risk level
        risk_level = self._get_risk_level(diabetes_probability)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            patient_data, 
            diabetes_probability,
            risk_level
        )
        
        return {
            'prediction': int(prediction),
            'has_diabetes': bool(prediction == 1),
            'probability': float(diabetes_probability),
            'probability_percentage': round(float(diabetes_probability) * 100, 2),
            'risk_level': risk_level,
            'recommendations': recommendations,
            'input_data': patient_data
        }
    
    def _get_risk_level(self, probability: float) -> str:
        """Determine risk level based on probability"""
        if probability < 0.3:
            return 'Low'
        elif probability < 0.6:
            return 'Moderate'
        elif probability < 0.8:
            return 'High'
        else:
            return 'Very High'
    
    def _generate_recommendations(self, data: dict, probability: float, risk_level: str) -> list:
        """Generate personalized recommendations based on patient data"""
        recommendations = []
        
        # Glucose recommendations
        if float(data['glucose']) > 125:
            recommendations.append("Your fasting glucose level is elevated. Regular monitoring is recommended.")
        
        # BMI recommendations
        bmi = float(data['bmi'])
        if bmi > 25:
            recommendations.append("Consider lifestyle modifications including diet and exercise to achieve healthy BMI.")
        elif bmi > 30:
            recommendations.append("BMI indicates obesity. Consult with a healthcare provider about weight management.")
        
        # Blood pressure recommendations
        systolic = float(data['systolic_bp'])
        diastolic = float(data['diastolic_bp'])
        if systolic > 140 or diastolic > 90:
            recommendations.append("Blood pressure is elevated. Monitor regularly and consult your doctor.")
        
        # Family history
        if int(data['family_diabetes']) == 1:
            recommendations.append("Family history of diabetes increases risk. Regular screening is important.")
        
        # Risk-based recommendations
        if risk_level in ['High', 'Very High']:
            recommendations.append("Schedule an appointment with a healthcare provider for comprehensive evaluation.")
            recommendations.append("Consider HbA1c test for accurate diabetes diagnosis.")
        
        if risk_level == 'Moderate':
            recommendations.append("Adopt preventive measures including regular exercise and balanced diet.")
        
        # General recommendations
        recommendations.append("Maintain regular physical activity (at least 150 minutes per week).")
        recommendations.append("Follow a balanced diet rich in fiber and low in refined sugars.")
        
        return recommendations

# Create singleton instance
diabetes_predictor = DiabetesPredictor()
