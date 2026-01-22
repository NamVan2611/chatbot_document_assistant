from pathlib import Path
from pypdf import PdfReader


class PDFLoader:
    """Extract text content from PDF files"""
    
    @staticmethod
    def extract_text(file_path: Path) -> str:
        """Extract text content from PDF file"""
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        return text.strip()

