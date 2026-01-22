import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # Model Configuration
    # Common Groq models: llama-3.1-8b-instant, llama-3.2-90b-versatile, llama-3.3-70b-versatile
    # Check https://console.groq.com/docs/models for current available models
    MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.1-8b-instant")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    
    # Directories
    UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
    VECTOR_STORE_DIR = Path(os.getenv("VECTOR_STORE_DIR", "./vectorstore"))
    CHAT_HISTORY_DIR = Path(os.getenv("CHAT_HISTORY_DIR", "./chat_history"))
    
    # Text Processing
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    # Retrieval
    MAX_RETRIEVAL_CHUNKS = int(os.getenv("MAX_RETRIEVAL_CHUNKS", "5"))
    
    # Map-Reduce Summarization
    MAX_CHUNKS_PER_BATCH = int(os.getenv("MAX_CHUNKS_PER_BATCH", "3"))  # Chunks per summary batch
    MAX_TOKENS_PER_CHUNK = int(os.getenv("MAX_TOKENS_PER_CHUNK", "1500"))  # Estimated tokens per chunk
    
    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    
    # CORS
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist"""
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        cls.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def validate(cls):
        """Validate required settings"""
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize directories
Settings.ensure_directories()

