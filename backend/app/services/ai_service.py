import requests
import json
from typing import Optional, List, Dict, Any

class OllamaService:
    """Wrapper for Ollama API calls."""

    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.chat_model = "llama3.2:latest"  # Using available model (faster, 3.2B)
        self.embedding_model = "nomic-embed-text"

    def is_available(self) -> bool:
        """Check if Ollama server is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def list_models(self) -> List[str]:
        """List available models."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except requests.exceptions.RequestException:
            return []

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate text completion from Ollama."""
        model = model or self.chat_model

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "response": data.get("response", ""),
                    "model": model,
                    "done": data.get("done", True)
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama returned status {response.status_code}",
                    "response": None
                }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timed out. Model might be loading.",
                "response": None
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Connection error: {str(e)}",
                "response": None
            }

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Chat completion with message history."""
        model = model or self.chat_model

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "response": data.get("message", {}).get("content", ""),
                    "model": model
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama returned status {response.status_code}",
                    "response": None
                }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "response": None
            }

    def embed(self, text: str, model: Optional[str] = None) -> Dict[str, Any]:
        """Generate embeddings for text."""
        model = model or self.embedding_model

        payload = {
            "model": model,
            "prompt": text
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json=payload,
                timeout=60
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "embedding": data.get("embedding", []),
                    "model": model
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama returned status {response.status_code}",
                    "embedding": None
                }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "embedding": None
            }

    def embed_batch(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = []
        for text in texts:
            result = self.embed(text, model)
            if result["success"]:
                embeddings.append(result["embedding"])
            else:
                embeddings.append([])
        return embeddings


# Singleton instance
ollama = OllamaService()
