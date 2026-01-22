from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatHistory(BaseModel):
    document_id: str
    messages: List[ChatMessage]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

