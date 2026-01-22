# Smart Learning Support Chatbot

A smart learning support platform (chatbot) that functions as a virtual teaching assistant, enabling students to interact deeply with their academic materials through natural language conversation.

## 🎯 Features

- **Document Upload**: Upload PDF files (textbooks, lecture notes, slides)
- **Question Answering**: Ask questions and get answers based on your uploaded documents
- **Document Summarization**: Get concise summaries of entire documents
- **Study Notes Generation**: Generate structured learning notes (Chú học tập)
- **FAQ Generator**: Create frequently asked questions with answers
- **Podcast Script Generator**: Generate educational podcast scripts
- **Multi-language Support**: English and Vietnamese (Tiếng Việt)
- **RAG-based**: Uses Retrieval-Augmented Generation to ensure all responses are grounded in document content

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI (Python) with RAG pipeline
- **LLM**: Groq API (Mixtral 8x7b)
- **Vector Store**: ChromaDB
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- Groq API Key ([Get one here](https://console.groq.com/))

## 🚀 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
UPLOAD_DIR=./uploads
VECTOR_STORE_DIR=./vectorstore
MODEL_NAME=llama-3.1-8b-instant
```

6. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `frontend` directory (optional, defaults to localhost:8000):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Cloudy/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── document_service.py  # PDF processing & vectorization
│   │       └── rag_service.py       # RAG pipeline & LLM integration
│   ├── requirements.txt
│   └── .env (create this)
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── DocumentUpload.tsx
│   │   └── TaskPanel.tsx
│   ├── package.json
│   └── .env.local (optional)
└── README.md
```

## 🔧 API Endpoints

### POST `/api/upload`
Upload a PDF document for processing.

**Request**: Multipart form data with `file` field
**Response**: `{ "success": true, "document_id": "...", "message": "..." }`

### POST `/api/query`
Ask a question about the document.

**Request Body**:
```json
{
  "query": "What is the main topic?",
  "document_id": "...",
  "language": "en"
}
```

**Response**: `{ "success": true, "response": "..." }`

### POST `/api/task`
Perform a specialized task (summarize, study_notes, faq, podcast).

**Request Body**:
```json
{
  "document_id": "...",
  "task_type": "summarize",
  "language": "en"
}
```

**Response**: `{ "success": true, "task_type": "...", "response": "..." }`

### GET `/api/documents`
List all uploaded documents.

**Response**: `{ "success": true, "documents": [...] }`

## 🎨 Usage

1. **Upload a Document**: Click "Choose PDF File" or drag and drop a PDF
2. **Ask Questions**: Use the Chat tab to ask questions about your document
3. **Generate Study Materials**: Use the Study Tools tab to:
   - Summarize the document
   - Generate study notes
   - Create FAQs
   - Generate podcast scripts

## ⚠️ Important Notes

- The system operates strictly under the RAG paradigm
- All responses are based only on the uploaded document content
- If information is not available in the document, the system will respond: "The requested information is not available in the uploaded document."
- The system does not use external knowledge or make assumptions beyond the document

## 🔐 Environment Variables

### Backend (.env)
- `GROQ_API_KEY`: Your Groq API key (required)
- `UPLOAD_DIR`: Directory for uploaded PDFs (default: ./uploads)
- `VECTOR_STORE_DIR`: Directory for vector store (default: ./vectorstore)
- `MODEL_NAME`: Groq model name (default: llama-3.1-8b-instant). Check https://console.groq.com/docs/models for current available models

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

