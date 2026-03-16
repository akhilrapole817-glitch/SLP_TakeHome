"""
Lightweight semantic search using scikit-learn TF-IDF + cosine similarity.
This replaces the heavy sentence-transformers/torch dependency with a
lightweight approach that installs in seconds and works great on free-tier servers.

TF-IDF still provides dramatically better search than plain ILIKE:
- Handles word frequency weighting (rare problem terms rank higher)
- Scores all documents against the query simultaneously
- No GPU or large model downloads required
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple


def rank_by_similarity(query: str, candidates: List[Tuple[int, str]], top_k: int = 50) -> List[int]:
    """
    Given a query and a list of (id, text) tuples, returns the ids of the
    top_k most relevant candidates ranked by TF-IDF cosine similarity.
    """
    if not candidates:
        return []

    texts = [text for _, text in candidates]
    ids = [cid for cid, _ in candidates]

    # Fit TF-IDF on the complaint corpus + the query together
    corpus = texts + [query]
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),      # unigrams + bigrams for better matching
        min_df=1,
        stop_words='english',
        sublinear_tf=True        # log normalization to reduce impact of very frequent terms
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Last row is the query vector
    query_vec = tfidf_matrix[-1]
    doc_vecs = tfidf_matrix[:-1]

    # Compute cosine similarities
    similarities = cosine_similarity(query_vec, doc_vecs).flatten()

    # Sort by similarity descending and take top_k
    top_indices = np.argsort(similarities)[::-1][:top_k]

    return [ids[i] for i in top_indices]
