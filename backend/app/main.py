from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import Settings
from app.routers import documents, chat

# Validate settings
Settings.validate()

app = FastAPI(
    title="Smart Learning Support Chatbot API",
    description="API for Smart Learning Support Chatbot with RAG capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    return {"message": "Smart Learning Support Chatbot API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=Settings.HOST, port=Settings.PORT)
