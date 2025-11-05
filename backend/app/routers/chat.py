from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatMessage, ChatResponse
from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
import uuid

router = APIRouter()
vector_store = VectorStore()
llm_service = LLMService()

# Lưu trữ conversation (trong production nên dùng database)
conversations = {}

@router.post("/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Chat với chatbot về nội dung tài liệu"""
    if not message.document_id:
        raise HTTPException(status_code=400, detail="document_id là bắt buộc")
    
    try:
        # Tìm kiếm trong vector store
        search_results = vector_store.search(
            document_id=message.document_id,
            query=message.message,
            k=5
        )
        
        if not search_results:
            return ChatResponse(
                response="Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu này.",
                sources=[],
                conversation_id=message.conversation_id or str(uuid.uuid4())
            )
        
        # Tạo câu trả lời với RAG
        rag_response = llm_service.generate_rag_response(
            query=message.message,
            context_chunks=search_results,
            document_id=message.document_id
        )
        
        # Tạo hoặc lấy conversation_id
        conversation_id = message.conversation_id or str(uuid.uuid4())
        
        # Lưu conversation
        if conversation_id not in conversations:
            conversations[conversation_id] = []
        
        conversations[conversation_id].append({
            "role": "user",
            "message": message.message
        })
        conversations[conversation_id].append({
            "role": "assistant",
            "message": rag_response["response"]
        })
        
        return ChatResponse(
            response=rag_response["response"],
            sources=rag_response["sources"],
            conversation_id=conversation_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý chat: {str(e)}")

@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """Lấy lịch sử hội thoại"""
    if conversation_id not in conversations:
        return {"messages": []}
    
    return {"messages": conversations[conversation_id]}

@router.delete("/history/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Xóa lịch sử hội thoại"""
    if conversation_id in conversations:
        del conversations[conversation_id]
    return {"message": "Đã xóa lịch sử hội thoại"}


