import json
import re
from typing import Dict, Any, Optional, List
from .ai_service import ollama

# Common treatment guidelines (simplified for demo)
TREATMENT_GUIDELINES = {
    "hypertension": {
        "first_line": ["lisinopril", "amlodipine", "hydrochlorothiazide"],
        "typical_dosage": {
            "lisinopril": "10-40mg once daily",
            "amlodipine": "5-10mg once daily",
            "hydrochlorothiazide": "12.5-25mg once daily"
        }
    },
    "type 2 diabetes": {
        "first_line": ["metformin"],
        "typical_dosage": {
            "metformin": "500-1000mg twice daily with meals"
        }
    },
    "hyperlipidemia": {
        "first_line": ["atorvastatin", "rosuvastatin"],
        "typical_dosage": {
            "atorvastatin": "10-80mg once daily",
            "rosuvastatin": "5-40mg once daily"
        }
    },
    "depression": {
        "first_line": ["sertraline", "escitalopram"],
        "typical_dosage": {
            "sertraline": "50-200mg once daily",
            "escitalopram": "10-20mg once daily"
        }
    },
    "anxiety": {
        "first_line": ["sertraline", "escitalopram", "buspirone"],
        "typical_dosage": {
            "sertraline": "50-200mg once daily",
            "buspirone": "5-10mg twice daily"
        }
    },
    "pain": {
        "first_line": ["acetaminophen", "ibuprofen"],
        "typical_dosage": {
            "acetaminophen": "500-1000mg every 6 hours as needed",
            "ibuprofen": "400-800mg every 6-8 hours as needed"
        }
    },
    "infection": {
        "first_line": ["amoxicillin", "azithromycin"],
        "typical_dosage": {
            "amoxicillin": "500mg three times daily for 7-10 days",
            "azithromycin": "500mg day 1, then 250mg days 2-5"
        }
    },
    "acid reflux": {
        "first_line": ["omeprazole", "pantoprazole"],
        "typical_dosage": {
            "omeprazole": "20-40mg once daily before breakfast",
            "pantoprazole": "40mg once daily"
        }
    },
    "asthma": {
        "first_line": ["albuterol", "fluticasone"],
        "typical_dosage": {
            "albuterol": "2 puffs every 4-6 hours as needed",
            "fluticasone": "1-2 puffs twice daily"
        }
    },
    "allergies": {
        "first_line": ["cetirizine", "loratadine", "fexofenadine"],
        "typical_dosage": {
            "cetirizine": "10mg once daily",
            "loratadine": "10mg once daily",
            "fexofenadine": "180mg once daily"
        }
    }
}


class PrescriptionAI:
    """AI-powered prescription suggestion system."""

    def __init__(self):
        self.ollama = ollama

    def _get_guideline_suggestion(
        self,
        diagnosis: str
    ) -> Optional[Dict[str, Any]]:
        """Get suggestion from treatment guidelines."""
        diagnosis_lower = diagnosis.lower()

        for condition, guidelines in TREATMENT_GUIDELINES.items():
            if condition in diagnosis_lower or diagnosis_lower in condition:
                first_med = guidelines["first_line"][0]
                return {
                    "medication": first_med,
                    "dosage": guidelines["typical_dosage"].get(first_med, "As directed"),
                    "alternatives": guidelines["first_line"][1:],
                    "source": "guidelines"
                }
        return None

    def suggest_prescription(
        self,
        diagnosis: str,
        patient_age: Optional[int] = None,
        patient_allergies: Optional[List[str]] = None,
        current_medications: Optional[List[str]] = None,
        patient_conditions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate prescription suggestions based on diagnosis and patient info.

        Args:
            diagnosis: Primary diagnosis
            patient_age: Patient's age
            patient_allergies: Known drug allergies
            current_medications: Current medications
            patient_conditions: Other medical conditions

        Returns:
            Prescription suggestion with medication, dosage, and instructions
        """

        # First check guidelines
        guideline_suggestion = self._get_guideline_suggestion(diagnosis)

        # Build context for LLM
        context_parts = [f"Diagnosis: {diagnosis}"]
        if patient_age:
            context_parts.append(f"Patient age: {patient_age}")
        if patient_allergies:
            context_parts.append(f"Allergies: {', '.join(patient_allergies)}")
        if current_medications:
            context_parts.append(f"Current medications: {', '.join(current_medications)}")
        if patient_conditions:
            context_parts.append(f"Other conditions: {', '.join(patient_conditions)}")

        context = "\n".join(context_parts)

        system_prompt = """You are a clinical decision support assistant helping doctors with prescription suggestions.
Provide evidence-based medication recommendations. Always consider patient safety.
Your suggestions are for review by a licensed physician - they will make the final decision.
Respond in valid JSON format only."""

        prompt = f"""Based on the following patient information, suggest an appropriate prescription:

{context}

Respond in this exact JSON format:
{{
    "medication": "drug name",
    "dosage": "specific dosage",
    "frequency": "how often to take",
    "duration": "length of treatment",
    "instructions": "patient instructions",
    "warnings": ["list of warnings or precautions"],
    "alternatives": ["alternative medications if first choice not suitable"],
    "reasoning": "brief clinical reasoning"
}}"""

        result = self.ollama.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3
        )

        if not result["success"]:
            # Fall back to guidelines if available
            if guideline_suggestion:
                return {
                    "success": True,
                    "suggestion": {
                        "medication": guideline_suggestion["medication"],
                        "dosage": guideline_suggestion["dosage"],
                        "frequency": "As directed by physician",
                        "duration": "As prescribed",
                        "instructions": "Take as directed. Contact doctor if symptoms persist.",
                        "warnings": ["Review for drug interactions", "Monitor for side effects"],
                        "alternatives": guideline_suggestion.get("alternatives", []),
                        "reasoning": "Based on standard treatment guidelines"
                    },
                    "source": "guidelines",
                    "ai_available": False
                }
            return {
                "success": False,
                "error": result.get("error", "AI service unavailable"),
                "suggestion": None
            }

        # Parse LLM response
        try:
            response_text = result["response"]
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                suggestion = json.loads(json_match.group())

                # Validate required fields
                required_fields = ["medication", "dosage"]
                for field in required_fields:
                    if field not in suggestion:
                        suggestion[field] = "Consult physician"

                return {
                    "success": True,
                    "suggestion": suggestion,
                    "source": "ai",
                    "ai_available": True,
                    "guideline_match": guideline_suggestion is not None
                }
            else:
                raise ValueError("No JSON found in response")

        except (json.JSONDecodeError, ValueError):
            # Fall back to guidelines
            if guideline_suggestion:
                return {
                    "success": True,
                    "suggestion": {
                        "medication": guideline_suggestion["medication"],
                        "dosage": guideline_suggestion["dosage"],
                        "frequency": "As directed",
                        "duration": "As prescribed",
                        "instructions": "Take as directed by your physician.",
                        "warnings": [],
                        "alternatives": guideline_suggestion.get("alternatives", []),
                        "reasoning": "Based on treatment guidelines"
                    },
                    "source": "guidelines",
                    "ai_available": True,
                    "parse_error": True
                }
            return {
                "success": False,
                "error": "Failed to parse AI response",
                "suggestion": None
            }

    def generate_instructions(
        self,
        medication: str,
        dosage: str,
        diagnosis: str,
        patient_age: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate detailed patient instructions for a prescription."""

        age_context = f" for a {patient_age}-year-old patient" if patient_age else ""

        system_prompt = """You are a helpful pharmacist assistant. Generate clear, patient-friendly medication instructions.
Use simple language. Include important safety information."""

        prompt = f"""Generate patient instructions for:
Medication: {medication}
Dosage: {dosage}
Condition: {diagnosis}{age_context}

Include:
1. How to take the medication
2. When to take it
3. What to avoid
4. Side effects to watch for
5. When to contact the doctor

Keep it concise and easy to understand."""

        result = self.ollama.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.5
        )

        if result["success"]:
            return {
                "success": True,
                "instructions": result["response"]
            }
        return {
            "success": False,
            "error": result.get("error", "Failed to generate instructions"),
            "instructions": f"Take {medication} {dosage} as directed by your physician. Contact your doctor if you experience any adverse effects."
        }


# Singleton instance
prescription_ai = PrescriptionAI()
