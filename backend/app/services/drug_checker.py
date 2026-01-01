import json
import re
from typing import List, Dict, Any, Optional
from .ai_service import ollama

# Common drug interactions database (simplified for demo)
KNOWN_INTERACTIONS = {
    ("warfarin", "aspirin"): {
        "severity": "high",
        "warning": "Increased risk of bleeding. Both drugs affect blood clotting."
    },
    ("warfarin", "ibuprofen"): {
        "severity": "high",
        "warning": "NSAIDs increase bleeding risk with warfarin."
    },
    ("metformin", "alcohol"): {
        "severity": "moderate",
        "warning": "Alcohol can increase risk of lactic acidosis with metformin."
    },
    ("lisinopril", "potassium"): {
        "severity": "moderate",
        "warning": "ACE inhibitors can increase potassium levels. Monitor closely."
    },
    ("simvastatin", "grapefruit"): {
        "severity": "moderate",
        "warning": "Grapefruit can increase statin levels, raising risk of side effects."
    },
    ("methotrexate", "ibuprofen"): {
        "severity": "high",
        "warning": "NSAIDs can increase methotrexate toxicity."
    },
    ("ssri", "maoi"): {
        "severity": "critical",
        "warning": "Serotonin syndrome risk. Never combine SSRIs with MAOIs."
    },
    ("fluoxetine", "tramadol"): {
        "severity": "high",
        "warning": "Risk of serotonin syndrome and seizures."
    },
    ("ciprofloxacin", "antacids"): {
        "severity": "moderate",
        "warning": "Antacids reduce ciprofloxacin absorption. Take 2 hours apart."
    },
    ("digoxin", "amiodarone"): {
        "severity": "high",
        "warning": "Amiodarone increases digoxin levels. Reduce digoxin dose."
    }
}

# Drug class mappings for broader matching
DRUG_CLASSES = {
    "ssri": ["fluoxetine", "sertraline", "paroxetine", "citalopram", "escitalopram"],
    "maoi": ["phenelzine", "tranylcypromine", "selegiline"],
    "nsaid": ["ibuprofen", "naproxen", "diclofenac", "celecoxib", "aspirin"],
    "statin": ["simvastatin", "atorvastatin", "rosuvastatin", "pravastatin"],
    "ace_inhibitor": ["lisinopril", "enalapril", "ramipril", "captopril"],
    "blood_thinner": ["warfarin", "heparin", "rivaroxaban", "apixaban"]
}


class DrugInteractionChecker:
    """Check for drug-drug interactions using rules + LLM."""

    def __init__(self):
        self.ollama = ollama

    def _normalize_drug_name(self, drug: str) -> str:
        """Normalize drug name for matching."""
        return drug.lower().strip()

    def _get_drug_class(self, drug: str) -> Optional[str]:
        """Get the drug class for a given drug."""
        drug_lower = self._normalize_drug_name(drug)
        for drug_class, drugs in DRUG_CLASSES.items():
            if drug_lower in drugs:
                return drug_class
        return None

    def _check_known_interactions(
        self,
        medications: List[str]
    ) -> List[Dict[str, Any]]:
        """Check against known interaction database."""
        interactions = []
        normalized = [self._normalize_drug_name(m) for m in medications]

        # Also add drug classes
        with_classes = normalized.copy()
        for drug in normalized:
            drug_class = self._get_drug_class(drug)
            if drug_class:
                with_classes.append(drug_class)

        # Check all pairs
        for i, drug1 in enumerate(with_classes):
            for drug2 in with_classes[i+1:]:
                # Check both orderings
                key1 = (drug1, drug2)
                key2 = (drug2, drug1)

                if key1 in KNOWN_INTERACTIONS:
                    interaction = KNOWN_INTERACTIONS[key1]
                    interactions.append({
                        "drugs": [drug1, drug2],
                        "severity": interaction["severity"],
                        "warning": interaction["warning"],
                        "source": "database"
                    })
                elif key2 in KNOWN_INTERACTIONS:
                    interaction = KNOWN_INTERACTIONS[key2]
                    interactions.append({
                        "drugs": [drug1, drug2],
                        "severity": interaction["severity"],
                        "warning": interaction["warning"],
                        "source": "database"
                    })

        return interactions

    def _check_with_llm(
        self,
        medications: List[str],
        patient_allergies: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Use LLM for additional interaction analysis."""

        allergies_text = ""
        if patient_allergies:
            allergies_text = f"\nPatient allergies: {', '.join(patient_allergies)}"

        system_prompt = """You are a clinical pharmacist assistant. Analyze drug interactions and provide safety information.
Be concise and factual. Focus on clinically significant interactions.
Always respond in valid JSON format."""

        prompt = f"""Analyze these medications for potential interactions:
Medications: {', '.join(medications)}{allergies_text}

Respond in this exact JSON format:
{{
    "interactions_found": true/false,
    "interactions": [
        {{
            "drugs": ["drug1", "drug2"],
            "severity": "low/moderate/high/critical",
            "warning": "brief explanation"
        }}
    ],
    "allergy_concerns": ["list any allergy-related concerns"],
    "general_advice": "brief general advice"
}}"""

        result = self.ollama.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3  # Lower temperature for more consistent output
        )

        if not result["success"]:
            return {"success": False, "error": result["error"]}

        # Parse JSON from response
        try:
            response_text = result["response"]
            # Try to extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                parsed = json.loads(json_match.group())
                return {"success": True, "data": parsed}
            else:
                return {"success": False, "error": "Could not parse LLM response"}
        except json.JSONDecodeError:
            return {"success": False, "error": "Invalid JSON in LLM response"}

    def check_interactions(
        self,
        medications: List[str],
        patient_allergies: Optional[List[str]] = None,
        use_llm: bool = True
    ) -> Dict[str, Any]:
        """
        Main method to check drug interactions.

        Args:
            medications: List of medication names
            patient_allergies: Optional list of known allergies
            use_llm: Whether to use LLM for additional analysis

        Returns:
            Dict with interaction results
        """
        if not medications or len(medications) < 1:
            return {
                "safe": True,
                "warnings": [],
                "severity": "none",
                "medications_checked": []
            }

        result = {
            "medications_checked": medications,
            "patient_allergies": patient_allergies or [],
            "warnings": [],
            "severity": "none"
        }

        # Check known interactions first (fast)
        known = self._check_known_interactions(medications)
        result["warnings"].extend(known)

        # Check allergies against medications
        if patient_allergies:
            for allergy in patient_allergies:
                allergy_lower = allergy.lower()
                for med in medications:
                    if allergy_lower in med.lower() or med.lower() in allergy_lower:
                        result["warnings"].append({
                            "drugs": [med],
                            "severity": "critical",
                            "warning": f"Patient has documented allergy to {allergy}!",
                            "source": "allergy_check"
                        })

        # Use LLM for additional analysis if requested
        if use_llm and self.ollama.is_available():
            llm_result = self._check_with_llm(medications, patient_allergies)
            if llm_result.get("success") and llm_result.get("data"):
                llm_data = llm_result["data"]

                # Add LLM-found interactions (avoid duplicates)
                existing_pairs = set()
                for w in result["warnings"]:
                    if len(w.get("drugs", [])) == 2:
                        existing_pairs.add(tuple(sorted(w["drugs"])))

                for interaction in llm_data.get("interactions", []):
                    pair = tuple(sorted(interaction.get("drugs", [])))
                    if pair not in existing_pairs and len(pair) == 2:
                        interaction["source"] = "ai_analysis"
                        result["warnings"].append(interaction)

                # Add allergy concerns from LLM
                for concern in llm_data.get("allergy_concerns", []):
                    if concern:
                        result["warnings"].append({
                            "drugs": [],
                            "severity": "moderate",
                            "warning": concern,
                            "source": "ai_analysis"
                        })

                result["general_advice"] = llm_data.get("general_advice", "")

        # Determine overall severity
        severities = {"none": 0, "low": 1, "moderate": 2, "high": 3, "critical": 4}
        max_severity = "none"
        for warning in result["warnings"]:
            sev = warning.get("severity", "none")
            if severities.get(sev, 0) > severities.get(max_severity, 0):
                max_severity = sev

        result["severity"] = max_severity
        result["safe"] = max_severity in ["none", "low"]

        return result


# Singleton instance
drug_checker = DrugInteractionChecker()
