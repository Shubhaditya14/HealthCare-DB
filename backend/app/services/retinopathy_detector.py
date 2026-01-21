import io
from pathlib import Path
from typing import Dict, List

import numpy as np
from PIL import Image


class RetinopathyDetector:
    """Load and run the diabetic retinopathy CNN."""

    def __init__(self):
        self.model = None
        self.load_error = None
        self.input_size = (128, 128)
        self.class_labels = [
            "No Diabetic Retinopathy",
            "Mild Non-Proliferative DR",
            "Moderate Non-Proliferative DR",
            "Severe Non-Proliferative DR",
            "Proliferative DR"
        ]
        self.model_dir = Path(__file__).resolve().parents[3] / "model"
        self.model_path = self.model_dir / "final_dr_model.keras"
        self.model_config_path = self.model_dir / "config.json"
        self.model_weights_path = self.model_dir / "model.weights.h5"
        self.weight_health = None

    def _load_model(self) -> None:
        """Load model architecture and weights if available."""
        if self.model is not None or self.load_error:
            return

        keras = None
        keras_source = None
        try:
            import keras as standalone_keras  # Prefer standalone Keras 3
            keras = standalone_keras
            keras_source = "keras"
        except Exception:
            try:
                from tensorflow import keras as tf_keras  # pragma: no cover - fallback
                keras = tf_keras
                keras_source = "tf.keras"
            except Exception as exc:  # pragma: no cover - environment dependent
                import sys
                py_ver = f"{sys.version_info.major}.{sys.version_info.minor}"
                self.load_error = (
                    f"Keras import failed: {exc}. "
                    "Install TensorFlow>=2.16 and keras>=3 (Python 3.10/3.11 recommended) to enable DR screening."
                )
                return

        try:
            model = None
            if self.model_path.exists():
                model = keras.models.load_model(self.model_path, compile=False)
            elif self.model_config_path.exists() and self.model_weights_path.exists():
                import json
                # Deserialize architecture from Keras 3 JSON config
                with self.model_config_path.open("r") as f:
                    config = json.load(f)

                if hasattr(keras, "saving") and hasattr(keras.saving, "deserialize_keras_object"):
                    model = keras.saving.deserialize_keras_object(config)
                elif hasattr(keras.models, "model_from_json"):
                    import json as json_lib
                    model = keras.models.model_from_json(json_lib.dumps(config))
                else:  # pragma: no cover - unexpected API drift
                    raise RuntimeError("No available deserializer for Keras model config.")

                model.load_weights(self.model_weights_path)
            else:
                available = [
                    str(p.name)
                    for p in [
                        self.model_path,
                        self.model_config_path,
                        self.model_weights_path,
                    ]
                    if p and p.exists()
                ]
                missing_msg = " / ".join(str(p.name) for p in [self.model_path, self.model_config_path, self.model_weights_path])
                self.load_error = (
                    f"DR model files missing ({missing_msg}). "
                    "Place `final_dr_model.keras` or both `config.json` and `model.weights.h5` in the top-level `model/` directory."
                )
                if available:
                    self.load_error += f" Found: {', '.join(available)}"
                return

            # Guard: verify weights look non-zero to avoid flat predictions
            self.weight_health = self._check_weight_health(model)
            if not self.weight_health["ok"]:
                raise ValueError(self.weight_health["message"])

            # Sync expected input size from model
            if getattr(model, "input_shape", None) and len(model.input_shape) >= 3:
                if model.input_shape[1] and model.input_shape[2]:
                    self.input_size = (int(model.input_shape[1]), int(model.input_shape[2]))

            self.model = model
            self.load_error = None
        except Exception as exc:  # pragma: no cover - relies on local ML stack
            self.model = None
            self.load_error = f"Failed to load DR model: {exc}"

    def is_ready(self) -> bool:
        """Return True when the model is loaded and usable."""
        return self.model is not None and self.load_error is None

    def _prepare_image(self, file_obj) -> np.ndarray:
        """Convert uploaded file to normalized tensor."""
        try:
            file_obj.stream.seek(0)
            image = Image.open(io.BytesIO(file_obj.read())).convert("RGB")
        except Exception as exc:
            raise ValueError(f"Invalid image file: {exc}") from exc

        image = image.resize(self.input_size)
        array = np.asarray(image, dtype="float32")

        # Optional CLAHE for contrast normalization if training used it.
        # Enable via DR_APPLY_CLAHE=1.
        import os
        if os.getenv("DR_APPLY_CLAHE", "0") == "1":
            try:
                import cv2
                lab = cv2.cvtColor(array.astype("uint8"), cv2.COLOR_RGB2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                cl = clahe.apply(l)
                merged = cv2.merge((cl, a, b))
                array = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB).astype("float32")
            except Exception:
                pass

        array = array / 255.0
        return np.expand_dims(array, axis=0)

    def predict_image(self, file_obj) -> Dict:
        """Run inference on an uploaded retinal image."""
        if not self.is_ready():
            self._load_model()

        if not self.is_ready():
            raise ValueError(self.load_error or "Retinopathy model not available")

        image_array = self._prepare_image(file_obj)
        probabilities = self.model.predict(image_array, verbose=0)[0]

        # Sanity: flag obviously uniform predictions
        if np.isclose(probabilities, probabilities[0], atol=1e-4).all():
            raise ValueError("Model returned nearly uniform probabilities; weights may not be loaded correctly.")
        top_index = int(np.argmax(probabilities))

        return {
            "label": self.class_labels[top_index],
            "confidence": float(probabilities[top_index]),
            "probabilities": [
                {"label": label, "confidence": float(probabilities[idx])}
                for idx, label in enumerate(self.class_labels)
            ]
        }

    def status(self) -> Dict:
        """Summarize model health for status endpoint."""
        # Attempt lazy load so status reflects current availability.
        if self.model is None and self.load_error is None:
            self._load_model()
        return {
            "loaded": self.is_ready(),
            "error": self.load_error,
            "input_size": self.input_size,
            "weight_health": self.weight_health,
            "classes": self.class_labels
        }

    @staticmethod
    def _check_weight_health(model) -> Dict[str, object]:
        """Quick heuristic to verify weights were loaded."""
        try:
            if not model.weights:
                return {"ok": False, "message": "Model has no weights after load."}
            sample = model.weights[0].numpy()
            mean_abs = float(np.abs(sample).mean())
            finite = np.isfinite(sample).all()
            ok = finite and mean_abs > 1e-6
            return {
                "ok": ok,
                "mean_abs_w0": mean_abs,
                "finite": bool(finite),
                "message": "" if ok else f"Weights look uninitialized (mean|w0|={mean_abs})"
            }
        except Exception as exc:  # pragma: no cover
            return {"ok": False, "message": f"Weight check failed: {exc}"}


# Singleton instance
retinopathy_detector = RetinopathyDetector()
