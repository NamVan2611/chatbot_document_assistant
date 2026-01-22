import uuid
from typing import List, Dict
import chromadb
from chromadb.config import Settings as ChromaSettings
from pathlib import Path
from app.config import Settings


class VectorStoreService:
    """Service for managing vector store (ChromaDB)"""
    
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=str(Settings.VECTOR_STORE_DIR),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
    
    def create_collection(self, document_id: str, filename: str):
        """Create a new collection for a document"""
        return self.client.get_or_create_collection(
            name=f"document_{document_id}",
            metadata={"document_id": document_id, "filename": filename}
        )
    
    def get_collection(self, document_id: str):
        """Get collection for a document"""
        try:
            return self.client.get_collection(name=f"document_{document_id}")
        except Exception:
            raise ValueError(f"Document {document_id} not found")
    
    def add_documents(
        self,
        collection,
        documents: List[str],
        embeddings: List[List[float]],
        document_id: str
    ):
        """Add documents to a collection"""
        collection.add(
            embeddings=embeddings,
            documents=documents,
            ids=[f"{document_id}_chunk_{i}" for i in range(len(documents))],
            metadatas=[{"chunk_index": i, "document_id": document_id} for i in range(len(documents))]
        )
    
    def list_documents(self) -> List[Dict]:
        """List all processed documents"""
        collections = self.client.list_collections()
        documents = []
        
        for collection in collections:
            metadata = collection.metadata or {}
            documents.append({
                "document_id": metadata.get("document_id", collection.name),
                "filename": metadata.get("filename", "Unknown"),
                "name": collection.name
            })
        
        return documents
    
    def get_all_chunks(self, document_id: str) -> List[str]:
        """Get all chunks from a document"""
        collection = self.get_collection(document_id)
        results = collection.get()
        
        if results['documents']:
            # Sort by chunk_index in metadata
            chunks_with_metadata = list(zip(
                results['documents'],
                results['metadatas']
            ))
            chunks_with_metadata.sort(key=lambda x: x[1].get('chunk_index', 0))
            return [chunk for chunk, _ in chunks_with_metadata]
        return []


