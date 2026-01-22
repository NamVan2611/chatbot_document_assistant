import json
import hashlib
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta
from app.config import Settings


class CacheService:
    """Service for caching generated content"""
    
    def __init__(self):
        self.cache_dir = Settings.VECTOR_STORE_DIR.parent / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.default_ttl = timedelta(days=7)  # Cache for 7 days
    
    def _get_cache_key(self, document_id: str, task_type: str, language: str) -> str:
        """Generate cache key from document_id, task_type, and language"""
        key_string = f"{document_id}_{task_type}_{language}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_cache_file(self, cache_key: str) -> Path:
        """Get cache file path"""
        return self.cache_dir / f"{cache_key}.json"
    
    def get(self, document_id: str, task_type: str, language: str) -> Optional[str]:
        """Get cached content if available and not expired"""
        cache_key = self._get_cache_key(document_id, task_type, language)
        cache_file = self._get_cache_file(cache_key)
        
        if not cache_file.exists():
            return None
        
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # Check if cache is expired
            cached_at = datetime.fromisoformat(cache_data.get('cached_at', ''))
            if datetime.now() - cached_at > self.default_ttl:
                cache_file.unlink()  # Delete expired cache
                return None
            
            return cache_data.get('content')
        except Exception:
            return None
    
    def set(self, document_id: str, task_type: str, language: str, content: str):
        """Store content in cache"""
        cache_key = self._get_cache_key(document_id, task_type, language)
        cache_file = self._get_cache_file(cache_key)
        
        cache_data = {
            'document_id': document_id,
            'task_type': task_type,
            'language': language,
            'content': content,
            'cached_at': datetime.now().isoformat()
        }
        
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
    
    def clear(self, document_id: str):
        """Clear all cache for a document"""
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                    if cache_data.get('document_id') == document_id:
                        cache_file.unlink()
            except Exception:
                continue

