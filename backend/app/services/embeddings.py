from langchain_huggingface import HuggingFaceEmbeddings
from app.config import Settings


class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=Settings.EMBEDDING_MODEL
        )
    
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a list of documents"""
        return self.embeddings.embed_documents(texts)
    
    def embed_query(self, text: str) -> list[float]:
        """Generate embedding for a single query"""
        return self.embeddings.embed_query(text)

