from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str

class ChatMessage(BaseModel):
    message: str
    document_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, str]]
    conversation_id: str

class SummarizeRequest(BaseModel):
    document_id: str
    summary_type: str = "full"  # full, chapter, section
    chapter_number: Optional[int] = None

class SummarizeResponse(BaseModel):
    summary: str
    document_id: str

class NotesRequest(BaseModel):
    document_id: str
    format: str = "bullet"  # bullet, mindmap, outline

class NotesResponse(BaseModel):
    notes: str
    format: str
    document_id: str

class QuizRequest(BaseModel):
    document_id: str
    num_questions: int = 5
    question_type: str = "mixed"  # multiple_choice, essay, flashcard, mixed

class QuizResponse(BaseModel):
    questions: List[Dict]
    document_id: str

class PodcastRequest(BaseModel):
    document_id: str
    topic: Optional[str] = None
    duration_minutes: int = 5

class PodcastResponse(BaseModel):
    transcript: str
    audio_url: Optional[str] = None
    document_id: str


