import json
import uuid
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
from app.config import Settings


class ChatSessionService:
    """Service for managing chat sessions with multiple documents"""
    
    def __init__(self):
        self.sessions_dir = Settings.VECTOR_STORE_DIR.parent / "chat_sessions"
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_session_file(self, session_id: str) -> Path:
        """Get session file path"""
        return self.sessions_dir / f"{session_id}.json"
    
    def create_session(self) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        session = {
            "session_id": session_id,
            "document_ids": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        
        session_file = self._get_session_file(session_id)
        with open(session_file, 'w', encoding='utf-8') as f:
            json.dump(session, f, ensure_ascii=False, indent=2)
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        session_file = self._get_session_file(session_id)
        
        if not session_file.exists():
            return None
        
        with open(session_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def add_document_to_session(self, session_id: str, document_id: str, document_name: str):
        """Add a document to a session"""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Check if document already exists
        if document_id not in [doc.get('document_id') for doc in session.get('documents', [])]:
            if 'documents' not in session:
                session['documents'] = []
            
            session['documents'].append({
                "document_id": document_id,
                "document_name": document_name,
                "added_at": datetime.now().isoformat()
            })
            session['updated_at'] = datetime.now().isoformat()
            
            session_file = self._get_session_file(session_id)
            with open(session_file, 'w', encoding='utf-8') as f:
                json.dump(session, f, ensure_ascii=False, indent=2)
    
    def list_all_sessions(self) -> List[Dict]:
        """List all chat sessions"""
        sessions = []
        for session_file in self.sessions_dir.glob("*.json"):
            with open(session_file, 'r', encoding='utf-8') as f:
                session = json.load(f)
                sessions.append({
                    "session_id": session.get("session_id"),
                    "document_count": len(session.get("documents", [])),
                    "created_at": session.get("created_at"),
                    "updated_at": session.get("updated_at"),
                })
        
        # Sort by updated_at descending
        sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return sessions
    
    def delete_session(self, session_id: str):
        """Delete a session"""
        session_file = self._get_session_file(session_id)
        if session_file.exists():
            session_file.unlink()
