import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
from app.config import Settings


class ChatHistoryService:
    """Service for managing chat history"""
    
    def __init__(self):
        self.history_dir = Settings.VECTOR_STORE_DIR.parent / "chat_history"
        self.history_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_history_file(self, session_id: str) -> Path:
        """Get history file path for a session"""
        return self.history_dir / f"{session_id}.json"
    
    def save_message(self, session_id: str, role: str, content: str, document_ids: List[str] = None):
        """Save a chat message to history (by session_id now)"""
        history_file = self._get_history_file(session_id)
        
        # Load existing history
        if history_file.exists():
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = {
                "session_id": session_id,
                "document_ids": document_ids or [],
                "messages": [],
                "created_at": datetime.now().isoformat(),
            }
        
        # Add new message
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        history["messages"].append(message)
        history["updated_at"] = datetime.now().isoformat()
        if document_ids:
            history["document_ids"] = document_ids
        
        # Save history
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    
    def get_history(self, session_id: str) -> List[Dict]:
        """Get chat history for a session"""
        history_file = self._get_history_file(session_id)
        
        if not history_file.exists():
            return []
        
        with open(history_file, 'r', encoding='utf-8') as f:
            history = json.load(f)
        
        return history.get("messages", [])
    
    def clear_history(self, session_id: str):
        """Clear chat history for a session"""
        history_file = self._get_history_file(session_id)
        if history_file.exists():
            history_file.unlink()
    
    def list_all_histories(self) -> List[Dict]:
        """List all chat histories"""
        histories = []
        for history_file in self.history_dir.glob("*.json"):
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
                histories.append({
                    "session_id": history.get("session_id"),
                    "document_ids": history.get("document_ids", []),
                    "message_count": len(history.get("messages", [])),
                    "created_at": history.get("created_at"),
                    "updated_at": history.get("updated_at"),
                })
        
        # Sort by updated_at descending
        histories.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return histories

