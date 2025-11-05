from fastapi import APIRouter, HTTPException
from app.models.schemas import QuizRequest, QuizResponse
from app.services.llm_service import LLMService
from app.services.document_processor import DocumentProcessor
from pathlib import Path

router = APIRouter()
llm_service = LLMService()

@router.post("/", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """Tạo bộ câu hỏi quiz"""
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
        
        # Tạo quiz
        questions = llm_service.generate_quiz(
            text=text,
            num_questions=request.num_questions,
            question_type=request.question_type
        )
        
        return QuizResponse(
            questions=questions,
            document_id=request.document_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo quiz: {str(e)}")


