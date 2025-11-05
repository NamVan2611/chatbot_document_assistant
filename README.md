# Chatbot Hỗ trợ Học tập cho Sinh viên

Hệ thống chatbot AI trợ giảng ảo giúp sinh viên tương tác với tài liệu học tập, đặt câu hỏi, tạo tóm tắt, ghi chú và quiz.

## Công nghệ sử dụng

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Python FastAPI
- **LLM**: OpenAI GPT-4 (có thể thay bằng Claude/Gemini/Llama)
- **RAG**: LangChain
- **Vector Database**: ChromaDB
- **Document Processing**: PyPDF2, python-docx
- **Audio**: OpenAI TTS (hoặc ElevenLabs)

## Tính năng chính

1. 💬 Tương tác Q&A và tìm kiếm nội dung từ tài liệu
2. 📚 Tạo tóm tắt tài liệu
3. 🗒️ Tạo ghi chú học tập
4. ❓ Tạo bộ câu hỏi FAQ/Quiz
5. 🎙️ Tạo podcast dạng đối thoại

## Cài đặt

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Tạo file `.env` trong thư mục `backend`:
```
OPENAI_API_KEY=your_openai_api_key
```

Chạy server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Chạy development server:
```bash
npm run dev
```

## Cấu trúc dự án

```
chatbot_assitstant/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── services/
│   │   ├── routers/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
└── README.md
```
