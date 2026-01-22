from pydantic import BaseModel
from typing import Optional, Dict, List


class QueryRequest(BaseModel):
    query: str
    session_id: str
    document_ids: List[str]
    language: Optional[str] = "en"


class TaskRequest(BaseModel):
    document_id: str
    task_type: str  # "summarize", "study_notes", "faq", "podcast"
    language: Optional[str] = "en"
    additional_params: Optional[Dict] = {}


