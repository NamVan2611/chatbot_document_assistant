from fastapi import APIRouter, HTTPException
from app.models.schemas import PodcastRequest, PodcastResponse
from app.services.llm_service import LLMService
from app.services.document_processor import DocumentProcessor
from pathlib import Path
import os

router = APIRouter()
llm_service = LLMService()

@router.post("/", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest):
    """Tạo podcast dạng đối thoại"""
    try:
        # Lấy text từ document
        doc_dir = Path("./uploads") / request.document_id
        if not doc_dir.exists():
            raise HTTPException(status_code=404, detail="Không tìm thấy document")
        
        files = list(doc_dir.glob("*"))
        if not files:
            raise HTTPException(status_code=404, detail="Không tìm thấy file")
        
        processor = DocumentProcessor()
        file_ext = files[0].suffix.lower()
        file_type = file_ext[1:] if file_ext.startswith('.') else file_ext
        
        extracted_data = await processor.extract_text(str(files[0]), file_type)
        text = extracted_data["text"]
        
        # Tạo transcript
        transcript = llm_service.generate_podcast_transcript(
            text=text,
            topic=request.topic,
            duration_minutes=request.duration_minutes
        )
        
        # Tạo audio (nếu có API key)
        audio_url = None
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        
        if elevenlabs_key:
            try:
                from elevenlabs import generate, save
                audio = generate(
                    text=transcript,
                    voice="Rachel",  # Có thể thay đổi
                    model="eleven_multilingual_v2"
                )
                
                # Lưu audio file
                audio_path = doc_dir / "podcast.mp3"
                save(audio, str(audio_path))
                audio_url = f"/api/podcast/audio/{request.document_id}"
            except Exception as e:
                print(f"Lỗi tạo audio: {e}")
        
        return PodcastResponse(
            transcript=transcript,
            audio_url=audio_url,
            document_id=request.document_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo podcast: {str(e)}")

@router.get("/audio/{document_id}")
async def get_podcast_audio(document_id: str):
    """Lấy file audio podcast"""
    audio_path = Path("./uploads") / document_id / "podcast.mp3"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Không tìm thấy file audio")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename="podcast.mp3"
    )


