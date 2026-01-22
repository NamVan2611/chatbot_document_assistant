from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import Settings


class OptimizedTextSplitter:
    """Optimized text splitter for summary and FAQ with 1200 char chunks"""
    
    def __init__(self, chunk_size: int = 1200, chunk_overlap: int = 200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def split_text(self, text: str) -> list[str]:
        """Split text into optimized chunks"""
        return self.splitter.split_text(text)

