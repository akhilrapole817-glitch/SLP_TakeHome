"""
Semantic search service using sentence-transformers.
Uses the lightweight 'all-MiniLM-L6-v2' model which is fast and runs fully locally.
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Tuple

# Load the model once at module import time (cached after first load)
_model = None

def get_model() -> SentenceTransformer:
    """Lazily load and cache the embedding model."""
    global _model
    if _model is None:
        print("Loading semantic search model (first time only)...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded.")
    return _model


def encode_text(text: str) -> List[float]:
    """Encode a single text string into an embedding vector."""
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    # Since vectors are L2-normalized, dot product = cosine similarity
    return float(np.dot(a, b))


def rank_by_similarity(query: str, candidates: List[Tuple[int, str]], top_k: int = 50) -> List[int]:
    """
    Given a query and a list of (id, text) tuples, returns the ids 
    of the top_k most semantically similar candidates.
    """
    if not candidates:
        return []
    
    model = get_model()
    query_embedding = model.encode(query, normalize_embeddings=True)
    
    texts = [text for _, text in candidates]
    candidate_embeddings = model.encode(texts, normalize_embeddings=True, batch_size=64, show_progress_bar=False)
    
    # Cosine similarities (dot product of normalized vectors)
    similarities = np.dot(candidate_embeddings, query_embedding)
    
    # Sort by similarity descending, take top_k
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    return [candidates[i][0] for i in top_indices]
