# Backend - Smart Learning Support Chatbot

Python FastAPI backend with RAG (Retrieval-Augmented Generation) pipeline.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
UPLOAD_DIR=./uploads
VECTOR_STORE_DIR=./vectorstore
MODEL_NAME=llama-3.1-8b-instant
```

5. Run the server:
```bash
python run.py
# or
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

