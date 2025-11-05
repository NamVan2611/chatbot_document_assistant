from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import VectorStore
from app.models.schemas import DocumentUploadResponse
import os

router = APIRouter()
doc_processor = DocumentProcessor()
vector_store = VectorStore()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload và xử lý tài liệu"""
    # Kiểm tra định dạng file
    allowed_extensions = [".pdf", ".docx", ".txt"]
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng file không được hỗ trợ. Chỉ chấp nhận: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Đọc file
        contents = await file.read()
        
        # Lưu file
        document_id, file_path = await doc_processor.save_uploaded_file(
            contents, file.filename
        )
        
        # Trích xuất text
        file_type = file_ext[1:]  # Bỏ dấu chấm
        extracted_data = await doc_processor.extract_text(file_path, file_type)
        
        # Lưu vào vector store
        metadata = {
            "filename": file.filename,
            "file_type": file_type,
            **extracted_data["metadata"]
        }
        vector_store.add_document(
            document_id=document_id,
            text=extracted_data["text"],
            metadata=metadata
        )
        
        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename,
            status="success",
            message="Tài liệu đã được tải lên và xử lý thành công"
        )
    
    except ValueError as e:
        # Lỗi về API key
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_str = str(e)
        
        # Xử lý lỗi OpenAI API cụ thể
        if "429" in error_str or "quota" in error_str.lower() or "insufficient_quota" in error_str.lower():
            raise HTTPException(
                status_code=402,  # Payment Required
                detail={
                    "error": "OpenAI API quota đã hết",
                    "message": "API key của bạn đã hết quota hoặc không đủ credit. Vui lòng:",
                    "solutions": [
                        "Kiểm tra quota trên OpenAI Dashboard: https://platform.openai.com/account/billing",
                        "Nạp thêm credit vào tài khoản OpenAI",
                        "Hoặc sử dụng API key khác có quota",
                        "Nếu đang dùng free tier, có thể đã đạt giới hạn sử dụng"
                    ]
                }
            )
        elif "401" in error_str or "invalid" in error_str.lower() or "unauthorized" in error_str.lower():
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "OpenAI API key không hợp lệ",
                    "message": "API key không đúng hoặc đã bị vô hiệu hóa. Vui lòng kiểm tra lại trong file .env"
                }
            )
        else:
            error_detail = f"Lỗi xử lý file: {error_str}"
            print(f"Error traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=error_detail)

@router.get("/list")
async def list_documents():
    """Liệt kê tất cả documents đã upload"""
    upload_dir = Path("./uploads")
    if not upload_dir.exists():
        return {"documents": []}
    
    documents = []
    for doc_dir in upload_dir.iterdir():
        if doc_dir.is_dir():
            # Tìm file trong thư mục
            files = list(doc_dir.glob("*"))
            if files:
                documents.append({
                    "document_id": doc_dir.name,
                    "filename": files[0].name,
                    "uploaded_at": files[0].stat().st_mtime
                })
    
    return {"documents": documents}

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Xóa document"""
    try:
        # Xóa khỏi vector store
        vector_store.delete_document(document_id)
        
        # Xóa file
        doc_dir = Path("./uploads") / document_id
        if doc_dir.exists():
            import shutil
            shutil.rmtree(doc_dir)
        
        return {"message": "Document đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa document: {str(e)}")

