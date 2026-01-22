# Project Structure

This document outlines the reorganized project structure.

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI entry point with router registration
│   ├── config.py               # Environment variables and settings
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── documents.py        # Upload & list documents
│   │   ├── chat.py             # Chat endpoint (Q&A)
│   │   ├── summarize.py        # Document summarization
│   │   ├── notes.py            # Study notes generation
│   │   ├── faq.py              # FAQ generation
│   │   └── podcast.py          # Podcast script generation
│   │
│   ├── services/               # Business logic services
│   │   ├── __init__.py
│   │   ├── pdf_loader.py       # PDF text extraction
│   │   ├── text_splitter.py    # Text chunking
│   │   ├── embeddings.py       # Embedding generation
│   │   ├── vector_store.py     # ChromaDB vector storage
│   │   ├── retriever.py        # Semantic search/retrieval
│   │   ├── llm_groq.py         # Groq LLM integration
│   │   ├── rag_service.py      # RAG orchestration
│   │   └── document_service.py # Document processing orchestration
│   │
│   ├── prompts/                # Prompt templates
│   │   ├── system.txt          # System prompt
│   │   ├── qa.txt              # Question answering prompt
│   │   ├── summary.txt         # Summarization prompt
│   │   ├── notes.txt           # Study notes prompt
│   │   ├── faq.txt             # FAQ generation prompt
│   │   └── podcast.txt         # Podcast script prompt
│   │
│   └── models/                 # Pydantic schemas
│       ├── __init__.py
│       └── request.py          # Request models
│
├── requirements.txt
├── run.py                      # Server startup script
├── env.template                # Environment variables template
└── README.md
```

## Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   │
│   ├── components/             # React components
│   │   ├── PdfUpload.tsx       # PDF upload component
│   │   ├── ChatBox.tsx         # Chat interface
│   │   ├── MessageBubble.tsx   # Message display component
│   │   └── TaskSelector.tsx    # Study tools selector
│   │
│   ├── services/               # API services
│   │   └── api.ts              # Axios API client
│   │
│   └── types/                  # TypeScript types
│       └── chat.ts             # Chat-related types
│
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Changes

### Backend
- **Separated concerns**: Each service now has a single responsibility
- **Router-based architecture**: API endpoints organized by feature
- **Externalized prompts**: Prompts stored in text files for easy editing
- **Centralized configuration**: All settings in `config.py`
- **Type safety**: Pydantic models for request validation

### Frontend
- **Component reorganization**: Components moved to `app/components/`
- **API service layer**: Centralized API calls in `services/api.ts`
- **Type definitions**: TypeScript types in `types/chat.ts`
- **Better naming**: Components renamed for clarity (PdfUpload, ChatBox, TaskSelector)

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload and process PDF
- `GET /api/documents/` - List all documents

### Chat
- `POST /api/chat/query` - Ask questions about document

### Tasks
- `POST /api/summarize/` - Summarize document
- `POST /api/notes/` - Generate study notes
- `POST /api/faq/` - Generate FAQ
- `POST /api/podcast/` - Generate podcast script

## Service Dependencies

```
document_service
  ├── pdf_loader
  ├── text_splitter
  ├── embeddings
  └── vector_store

rag_service
  ├── retriever (uses vector_store + embeddings)
  ├── llm_groq
  └── prompt_loader
```


