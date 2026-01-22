from typing import List
from app.services.vector_store import VectorStoreService
from app.services.embeddings import EmbeddingService
from app.config import Settings


class RetrieverService:
    """Service for retrieving relevant document chunks"""
    
    def __init__(self, vector_store: VectorStoreService, embeddings: EmbeddingService):
        self.vector_store = vector_store
        self.embeddings = embeddings
    
    def retrieve(self, document_id: str, query: str, k: int = None) -> List[str]:
        """Retrieve relevant chunks for a query"""
        if k is None:
            k = Settings.MAX_RETRIEVAL_CHUNKS
        
        collection = self.vector_store.get_collection(document_id)
        query_embedding = self.embeddings.embed_query(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )
        
        if results['documents'] and len(results['documents'][0]) > 0:
            return results['documents'][0]
        return []


