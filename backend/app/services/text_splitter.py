from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import Settings


class TextSplitterService:
    """Service for splitting text into chunks"""
    
    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=Settings.CHUNK_SIZE,
            chunk_overlap=Settings.CHUNK_OVERLAP,
            length_function=len,
        )
    
    def split_text(self, text: str) -> list[str]:
        """Split text into chunks"""
        return self.splitter.split_text(text)

