# Quick Setup Guide

## Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- Groq API Key ([Get one here](https://console.groq.com/))

## Step 1: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `env.template`):
```bash
# Windows
copy env.template .env

# macOS/Linux
cp env.template .env
```

5. Edit `.env` file and add your Groq API key:
```env
GROQ_API_KEY=your_actual_api_key_here
UPLOAD_DIR=./uploads
VECTOR_STORE_DIR=./vectorstore
MODEL_NAME=llama-3.1-8b-instant
```

6. Start the backend server:
```bash
python run.py
```

The backend will run on `http://localhost:8000`

## Step 2: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env.local` file if you need to change the API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Step 3: Usage

1. Open your browser and go to `http://localhost:3000`
2. Upload a PDF document
3. Wait for processing (this may take a moment)
4. Start asking questions or use the Study Tools tab

## Troubleshooting

### Backend Issues

- **Import errors**: Make sure your virtual environment is activated
- **GROQ_API_KEY error**: Check that your `.env` file exists and contains a valid API key
- **Port 8000 already in use**: Change the port in `run.py` or stop the existing process

### Frontend Issues

- **Cannot connect to backend**: Make sure the backend is running on port 8000
- **Build errors**: Delete `node_modules` and `.next` folders, then run `npm install` again

### Common Issues

- **PDF extraction fails**: Make sure the PDF contains extractable text (not scanned images)
- **Slow responses**: First-time embedding generation may take time; subsequent queries will be faster
- **Memory issues**: For large documents, consider increasing system memory or using a smaller chunk size

