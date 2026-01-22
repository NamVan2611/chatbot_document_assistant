import uuid
import aiofiles
from pathlib import Path
from app.services.pdf_loader import PDFLoader
from app.services.text_splitter import TextSplitterService
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.config import Settings


class DocumentService:
    """Service for managing document upload and processing"""
    
    def __init__(self):
        self.upload_dir = Settings.UPLOAD_DIR
        self.pdf_loader = PDFLoader()
        self.text_splitter = TextSplitterService()
        self.embeddings = EmbeddingService()
        self.vector_store = VectorStoreService()
    
    async def upload_and_process(self, file) -> str:
        """Upload PDF file and process it into vector store"""
        document_id = str(uuid.uuid4())
        filename = getattr(file, 'filename', 'unknown.pdf') or 'unknown.pdf'
        
        # Save file
        file_path = self.upload_dir / f"{document_id}.pdf"
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text from PDF
        text = self.pdf_loader.extract_text(file_path)
        
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")
        
        # Split text into chunks
        chunks = self.text_splitter.split_text(text)
        
        # Create collection
        collection = self.vector_store.create_collection(document_id, filename)
        
        # Generate embeddings
        embeddings_list = self.embeddings.embed_documents(chunks)
        
        # Store in vector store
        self.vector_store.add_documents(collection, chunks, embeddings_list, document_id)
        
        return document_id
    
    async def list_documents(self):
        """List all processed documents"""
        return self.vector_store.list_documents()
