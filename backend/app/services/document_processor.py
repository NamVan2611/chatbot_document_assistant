import os
import uuid
from typing import List, Dict
import PyPDF2
from docx import Document
import aiofiles
from pathlib import Path

class DocumentProcessor:
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    async def save_uploaded_file(self, file: bytes, filename: str) -> str:
        """Lưu file được upload và trả về document_id"""
        document_id = str(uuid.uuid4())
        file_ext = Path(filename).suffix.lower()
        
        # Tạo thư mục cho document
        doc_dir = self.upload_dir / document_id
        doc_dir.mkdir(exist_ok=True)
        
        # Lưu file
        file_path = doc_dir / filename
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file)
        
        return document_id, str(file_path)
    
    async def extract_text(self, file_path: str, file_type: str) -> Dict[str, any]:
        """Trích xuất text từ file"""
        text_content = ""
        metadata = {
            "pages": [],
            "chapters": [],
            "sections": []
        }
        
        if file_type == "pdf":
            text_content, metadata = self._extract_from_pdf(file_path)
        elif file_type == "docx":
            text_content, metadata = self._extract_from_docx(file_path)
        elif file_type == "txt":
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                text_content = await f.read()
        
        return {
            "text": text_content,
            "metadata": metadata,
            "chunks": self._split_into_chunks(text_content)
        }
    
    def _extract_from_pdf(self, file_path: str) -> tuple:
        """Trích xuất text từ PDF"""
        text_content = ""
        pages = []
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                text_content += f"\n\n--- Trang {page_num + 1} ---\n\n{page_text}"
                pages.append({
                    "page_number": page_num + 1,
                    "text": page_text
                })
        
        return text_content, {"pages": pages}
    
    def _extract_from_docx(self, file_path: str) -> tuple:
        """Trích xuất text từ DOCX"""
        doc = Document(file_path)
        text_content = ""
        paragraphs = []
        
        for para in doc.paragraphs:
            if para.text.strip():
                text_content += para.text + "\n"
                paragraphs.append(para.text)
        
        return text_content, {"paragraphs": paragraphs}
    
    def _split_into_chunks(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict]:
        """Chia text thành các chunk nhỏ hơn cho vector database"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            
            chunks.append({
                "text": chunk_text,
                "chunk_index": len(chunks),
                "start_index": i,
                "end_index": min(i + chunk_size, len(words))
            })
        
        return chunks


