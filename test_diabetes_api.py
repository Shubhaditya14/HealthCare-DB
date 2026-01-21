#!/usr/bin/env python3
"""
Test script for Diabetes Prediction API endpoint
"""

import requests
import json

# API Configuration
API_URL = "http://localhost:5001/api"

def get_auth_token():
    """Login and get authentication token"""
    print("Logging in as doctor...")
    response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": "doctor@example.com",
            "password": "demo123",
            "user_type": "doctor"
        }
    )
    
    if response.status_code == 200:
        token = response.json()['access_token']
        print("✓ Login successful")
        return token
    else:
        print(f"✗ Login failed: {response.text}")
        return None

def test_diabetes_prediction(token):
    """Test diabetes prediction endpoint"""
    print("\nTesting Diabetes Prediction API...")
    
    # Test case 1: High risk patient
    print("\n[Test 1] High Risk Patient:")
    test_data_1 = {
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
    
    response = requests.post(
        f"{API_URL}/ai/predict-diabetes",
        json=test_data_1,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        result = response.json()
        if result['success']:
            prediction = result['prediction']
            print(f"  ✓ Risk Level: {prediction['risk_level']}")
            print(f"  ✓ Probability: {prediction['probability_percentage']}%")
            print(f"  ✓ Has Diabetes: {prediction['has_diabetes']}")
            print(f"  ✓ Recommendations: {len(prediction['recommendations'])} items")
        else:
            print(f"  ✗ Prediction failed: {result}")
    else:
        print(f"  ✗ Request failed: {response.status_code} - {response.text}")
    
    # Test case 2: Low risk patient
    print("\n[Test 2] Low Risk Patient:")
    test_data_2 = {
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
    
    response = requests.post(
        f"{API_URL}/ai/predict-diabetes",
        json=test_data_2,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        result = response.json()
        if result['success']:
            prediction = result['prediction']
            print(f"  ✓ Risk Level: {prediction['risk_level']}")
            print(f"  ✓ Probability: {prediction['probability_percentage']}%")
            print(f"  ✓ Has Diabetes: {prediction['has_diabetes']}")
            print(f"  ✓ Recommendations: {len(prediction['recommendations'])} items")
        else:
            print(f"  ✗ Prediction failed: {result}")
    else:
        print(f"  ✗ Request failed: {response.status_code} - {response.text}")
    
    # Test case 3: Invalid data (should fail validation)
    print("\n[Test 3] Invalid Data (should fail):")
    test_data_3 = {
        "age": 52,
        "gender": 1,
        "pulse_rate": 300,  # Invalid: too high
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
    
    response = requests.post(
        f"{API_URL}/ai/predict-diabetes",
        json=test_data_3,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 400:
        print(f"  ✓ Validation correctly rejected invalid data: {response.json()['message']}")
    else:
        print(f"  ✗ Expected validation error, got: {response.status_code}")

def main():
    print("=" * 60)
    print("  Diabetes Prediction API Test")
    print("=" * 60)
    print("\nMake sure the backend server is running on http://localhost:5001")
    print("and you have created demo users (doctor@example.com/demo123)")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("\n✗ Cannot proceed without authentication")
        return
    
    # Test diabetes prediction
    test_diabetes_prediction(token)
    
    print("\n" + "=" * 60)
    print("  All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Cannot connect to backend server.")
        print("  Please make sure the backend is running on http://localhost:5001")
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
