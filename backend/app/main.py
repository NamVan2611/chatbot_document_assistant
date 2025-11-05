from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

from app.routers import documents, chat, summarize, notes, quiz, podcast

load_dotenv()

app = FastAPI(
    title="Chatbot Hỗ trợ Học tập",
    description="AI Teaching Assistant cho sinh viên",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(summarize.router, prefix="/api/summarize", tags=["summarize"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(podcast.router, prefix="/api/podcast", tags=["podcast"])

@app.get("/")
async def root():
    return {"message": "Chatbot Hỗ trợ Học tập API", "version": "1.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


