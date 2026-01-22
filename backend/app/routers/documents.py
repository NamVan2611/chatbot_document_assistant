from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["documents"])

document_service = DocumentService()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document"""
    if not file.filename or not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        document_id = await document_service.upload_and_process(file)
        return {
            "success": True,
            "document_id": document_id,
            "message": "Document uploaded and processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("/")
async def list_documents():
    """List all uploaded documents"""
    try:
        documents = await document_service.list_documents()
        return {
            "success": True,
            "documents": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


