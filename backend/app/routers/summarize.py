from fastapi import APIRouter, HTTPException
from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
from pathlib import Path

router = APIRouter()
vector_store = VectorStore()
llm_service = LLMService()

@router.post("/", response_model=SummarizeResponse)
async def summarize_document(request: SummarizeRequest):
    """Tạo tóm tắt tài liệu"""
    try:
        # Lấy text từ document
        doc_dir = Path("./uploads") / request.document_id
        if not doc_dir.exists():
            raise HTTPException(status_code=404, detail="Không tìm thấy document")
        
        # Tìm file trong thư mục
        files = list(doc_dir.glob("*"))
        if not files:
            raise HTTPException(status_code=404, detail="Không tìm thấy file")
        
        # Đọc file và trích xuất text
        from app.services.document_processor import DocumentProcessor
        processor = DocumentProcessor()
        file_ext = files[0].suffix.lower()
        file_type = file_ext[1:] if file_ext.startswith('.') else file_ext
        
        extracted_data = await processor.extract_text(str(files[0]), file_type)
        text = extracted_data["text"]
        
        # Tạo tóm tắt
        summary = llm_service.generate_summary(
            text=text,
            summary_type=request.summary_type
        )
        
        return SummarizeResponse(
            summary=summary,
            document_id=request.document_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo tóm tắt: {str(e)}")


