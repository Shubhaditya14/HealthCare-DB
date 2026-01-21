import joblib

# Load model
model = joblib.load('diabetes_lr_bundle.joblib')

# Check model type
print(f"Model type: {type(model)}")

# For scikit-learn models, check attributes
if hasattr(model, 'get_params'):
    print(f"Model parameters: {model.get_params()}")

# Check what's inside (if it's a dictionary or other structure)
if isinstance(model, dict):
    print(f"Keys in model: {model.keys()}")