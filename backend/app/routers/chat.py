from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from app.models.request import QueryRequest
from app.services.rag_service import RAGService
from app.services.chat_history_service import ChatHistoryService
from app.services.chat_session_service import ChatSessionService

router = APIRouter(prefix="/api/chat", tags=["chat"])

rag_service = RAGService()
chat_history_service = ChatHistoryService()
chat_session_service = ChatSessionService()


class AddDocumentRequest(BaseModel):
    document_id: str
    document_name: str


@router.post("/session")
async def create_session():
    """Create a new chat session"""
    try:
        session_id = chat_session_service.create_session()
        return {
            "success": True,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get a chat session"""
    try:
        session = chat_session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return {
            "success": True,
            "session": session
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting session: {str(e)}")


@router.post("/session/{session_id}/documents")
async def add_document_to_session(session_id: str, request: AddDocumentRequest):
    """Add a document to a session"""
    try:
        chat_session_service.add_document_to_session(session_id, request.document_id, request.document_name)
        return {
            "success": True,
            "message": "Document added to session"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding document: {str(e)}")


@router.get("/sessions")
async def list_sessions():
    """List all chat sessions"""
    try:
        sessions = chat_session_service.list_all_sessions()
        return {
            "success": True,
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing sessions: {str(e)}")


@router.post("/query")
async def query_document(request: QueryRequest):
    """Answer questions based on the uploaded documents"""
    try:
        if not request.document_ids:
            raise HTTPException(status_code=400, detail="At least one document ID is required")
        
        # Save user message to history
        chat_history_service.save_message(
            session_id=request.session_id,
            role="user",
            content=request.query,
            document_ids=request.document_ids
        )
        
        # Get response from all documents
        response = await rag_service.answer_question(
            query=request.query,
            document_ids=request.document_ids,
            language=request.language
        )
        
        # Save assistant response to history
        chat_history_service.save_message(
            session_id=request.session_id,
            role="assistant",
            content=response,
            document_ids=request.document_ids
        )
        
        return {
            "success": True,
            "response": response
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        history = chat_history_service.get_history(session_id)
        return {
            "success": True,
            "messages": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {str(e)}")


@router.get("/histories")
async def list_histories():
    """List all chat histories"""
    try:
        histories = chat_history_service.list_all_histories()
        return {
            "success": True,
            "histories": histories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing histories: {str(e)}")


@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    try:
        chat_history_service.clear_history(session_id)
        return {
            "success": True,
            "message": "Chat history cleared"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")


