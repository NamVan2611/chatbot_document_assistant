from fastapi import APIRouter, HTTPException
from app.models.schemas import NotesRequest, NotesResponse
from app.services.llm_service import LLMService
from app.services.document_processor import DocumentProcessor
from pathlib import Path

router = APIRouter()
llm_service = LLMService()

@router.post("/", response_model=NotesResponse)
async def generate_notes(request: NotesRequest):
    """Tạo ghi chú học tập"""
    try:
        # Lấy text từ document
        doc_dir = Path("./uploads") / request.document_id
        if not doc_dir.exists():
            raise HTTPException(status_code=404, detail="Không tìm thấy document")
        
        files = list(doc_dir.glob("*"))
        if not files:
            raise HTTPException(status_code=404, detail="Không tìm thấy file")
        
        processor = DocumentProcessor()
        file_ext = files[0].suffix.lower()
        file_type = file_ext[1:] if file_ext.startswith('.') else file_ext
        
        extracted_data = await processor.extract_text(str(files[0]), file_type)
        text = extracted_data["text"]
        
        # Tạo ghi chú
        notes = llm_service.generate_study_notes(
            text=text,
            format=request.format
        )
        
        return NotesResponse(
            notes=notes,
            format=request.format,
            document_id=request.document_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo ghi chú: {str(e)}")


