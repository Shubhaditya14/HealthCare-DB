import json
import numpy as np
from typing import List, Dict, Any, Optional
from .ai_service import ollama


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if not a or not b:
        return 0.0
    a_np = np.array(a)
    b_np = np.array(b)

    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a_np, b_np) / (norm_a * norm_b))


class RAGService:
    """Retrieval-Augmented Generation for patient history search."""

    def __init__(self):
        self.ollama = ollama

    def embed_text(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a text string."""
        result = self.ollama.embed(text)
        if result["success"]:
            return result["embedding"]
        return None

    def embed_records(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate embeddings for a list of medical records.

        Args:
            records: List of records with 'content' field

        Returns:
            Records with 'embedding' field added
        """
        for record in records:
            # Create searchable text from record
            searchable_text = f"{record.get('title', '')} {record.get('content', '')} {record.get('record_type', '')}"
            embedding = self.embed_text(searchable_text)
            record['embedding'] = embedding
        return records

    def search_records(
        self,
        query: str,
        records: List[Dict[str, Any]],
        top_k: int = 5,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Search records using semantic similarity.

        Args:
            query: Search query
            records: List of records with embeddings
            top_k: Number of results to return
            min_similarity: Minimum similarity threshold

        Returns:
            Top matching records with similarity scores
        """
        # Get query embedding
        query_embedding = self.embed_text(query)
        if not query_embedding:
            # Fall back to keyword search
            return self._keyword_search(query, records, top_k)

        # Calculate similarities
        results = []
        for record in records:
            record_embedding = record.get('embedding')
            if record_embedding:
                # Parse embedding if stored as JSON string
                if isinstance(record_embedding, str):
                    try:
                        record_embedding = json.loads(record_embedding)
                    except json.JSONDecodeError:
                        continue

                similarity = cosine_similarity(query_embedding, record_embedding)
                if similarity >= min_similarity:
                    results.append({
                        **record,
                        'similarity': similarity
                    })

        # Sort by similarity
        results.sort(key=lambda x: x['similarity'], reverse=True)

        return results[:top_k]

    def _keyword_search(
        self,
        query: str,
        records: List[Dict[str, Any]],
        top_k: int
    ) -> List[Dict[str, Any]]:
        """Fallback keyword-based search."""
        query_terms = query.lower().split()
        results = []

        for record in records:
            content = f"{record.get('title', '')} {record.get('content', '')}".lower()
            # Count matching terms
            matches = sum(1 for term in query_terms if term in content)
            if matches > 0:
                results.append({
                    **record,
                    'similarity': matches / len(query_terms)
                })

        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]

    def search_and_summarize(
        self,
        query: str,
        records: List[Dict[str, Any]],
        patient_name: str = "the patient",
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Search records and generate a summary of relevant findings.

        Args:
            query: Search query (e.g., "cardiac history")
            records: Patient's medical records
            patient_name: Patient's name for context
            top_k: Number of records to consider

        Returns:
            Search results with AI-generated summary
        """
        # Find relevant records
        relevant_records = self.search_records(query, records, top_k)

        if not relevant_records:
            return {
                "success": True,
                "query": query,
                "records_found": 0,
                "records": [],
                "summary": f"No records found related to '{query}' in {patient_name}'s medical history."
            }

        # Build context for summarization
        context_parts = []
        for i, record in enumerate(relevant_records, 1):
            context_parts.append(
                f"{i}. [{record.get('record_type', 'record')}] {record.get('title', 'Untitled')} "
                f"({record.get('record_date', 'Unknown date')}): {record.get('content', '')}"
            )

        context = "\n".join(context_parts)

        system_prompt = """You are a medical records assistant. Summarize relevant medical history clearly and concisely.
Focus on clinically relevant information. Use professional medical language."""

        prompt = f"""Based on the search query "{query}", summarize the relevant medical history for {patient_name}.

Relevant records:
{context}

Provide a concise summary highlighting:
1. Key findings related to the query
2. Timeline of relevant events
3. Any ongoing concerns or follow-up needs"""

        result = self.ollama.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.5
        )

        # Remove embeddings from response (too large)
        clean_records = []
        for record in relevant_records:
            clean_record = {k: v for k, v in record.items() if k != 'embedding'}
            clean_records.append(clean_record)

        if result["success"]:
            return {
                "success": True,
                "query": query,
                "records_found": len(relevant_records),
                "records": clean_records,
                "summary": result["response"]
            }
        else:
            # Return records without summary
            return {
                "success": True,
                "query": query,
                "records_found": len(relevant_records),
                "records": clean_records,
                "summary": f"Found {len(relevant_records)} relevant records. AI summary unavailable.",
                "ai_error": result.get("error")
            }

    def answer_question(
        self,
        question: str,
        records: List[Dict[str, Any]],
        patient_name: str = "the patient"
    ) -> Dict[str, Any]:
        """
        Answer a specific question about patient history.

        Args:
            question: Question to answer (e.g., "When was the last cardiac checkup?")
            records: Patient's medical records
            patient_name: Patient's name

        Returns:
            Answer with supporting records
        """
        # Find relevant records
        relevant_records = self.search_records(question, records, top_k=5)

        if not relevant_records:
            return {
                "success": True,
                "question": question,
                "answer": f"I couldn't find relevant information to answer this question in {patient_name}'s records.",
                "confidence": "low",
                "supporting_records": []
            }

        # Build context
        context_parts = []
        for record in relevant_records:
            context_parts.append(
                f"[{record.get('record_date', 'Unknown')}] {record.get('title', '')}: {record.get('content', '')}"
            )
        context = "\n".join(context_parts)

        system_prompt = """You are a medical records assistant. Answer questions based only on the provided records.
If the information is not in the records, say so. Be precise and factual."""

        prompt = f"""Question about {patient_name}: {question}

Available records:
{context}

Answer the question based on these records. If you cannot find the answer, say so clearly."""

        result = self.ollama.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3
        )

        # Clean records for response
        clean_records = [{k: v for k, v in r.items() if k != 'embedding'} for r in relevant_records[:3]]

        if result["success"]:
            return {
                "success": True,
                "question": question,
                "answer": result["response"],
                "confidence": "high" if len(relevant_records) >= 2 else "medium",
                "supporting_records": clean_records
            }
        else:
            return {
                "success": False,
                "question": question,
                "answer": "Unable to process question at this time.",
                "error": result.get("error"),
                "supporting_records": clean_records
            }


# Singleton instance
rag_service = RAGService()
