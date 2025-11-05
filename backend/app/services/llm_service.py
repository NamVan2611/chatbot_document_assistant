import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict

class LLMService:
    def __init__(self):
        self._llm = None
        self.embeddings = None
    
    @property
    def llm(self):
        """Lazy initialization of LLM"""
        if self._llm is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError(
                    "OPENAI_API_KEY not found. Please set it in your .env file. "
                    "Get your API key from: https://platform.openai.com/api-keys"
                )
            self._llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.7,
                openai_api_key=api_key
            )
        return self._llm
    
    def generate_rag_response(self, query: str, context_chunks: List[Dict], document_id: str) -> Dict:
        """Tạo câu trả lời dựa trên RAG"""
        # Tạo context từ các chunks
        context = "\n\n".join([
            f"[Đoạn {i+1}, điểm số: {chunk['score']:.2f}]\n{chunk['text']}"
            for i, chunk in enumerate(context_chunks)
        ])
        
        # Tạo prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", """Bạn là một trợ giảng AI thông minh, giúp sinh viên hiểu rõ nội dung tài liệu học tập.
            
Hãy trả lời câu hỏi dựa trên ngữ cảnh được cung cấp từ tài liệu. Nếu thông tin không có trong tài liệu, hãy nói rõ.
Luôn trích dẫn nguồn (ví dụ: "Theo đoạn văn X trong tài liệu...").
Trả lời bằng tiếng Việt, tự nhiên và dễ hiểu."""),
            ("human", """Dựa trên nội dung tài liệu sau, hãy trả lời câu hỏi:

NỘI DUNG TÀI LIỆU:
{context}

CÂU HỎI: {query}

Hãy trả lời chi tiết và có trích dẫn nguồn.""")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"context": context, "query": query})
        if hasattr(response, 'content'):
            response = response.content
        
        # Tạo sources
        sources = []
        for chunk in context_chunks[:3]:  # Top 3 chunks
            sources.append({
                "text": chunk['text'][:200] + "...",
                "score": chunk['score'],
                "chunk_index": chunk.get('metadata', {}).get('chunk_index', 0)
            })
        
        return {
            "response": response,
            "sources": sources
        }
    
    def generate_summary(self, text: str, summary_type: str = "full") -> str:
        """Tạo tóm tắt tài liệu"""
        if summary_type == "full":
            prompt_text = """Hãy tóm tắt toàn bộ nội dung tài liệu sau một cách ngắn gọn, súc tích, bao gồm các ý chính:

{text}

Tóm tắt:"""
        else:
            prompt_text = """Hãy tóm tắt phần/chương sau của tài liệu:

{text}

Tóm tắt:"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Bạn là một trợ giảng AI, chuyên tạo tóm tắt tài liệu học tập rõ ràng, dễ hiểu."),
            ("human", prompt_text)
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"text": text[:8000]})
        if hasattr(response, 'content'):
            return response.content
        return str(response)  # Giới hạn độ dài
    
    def generate_study_notes(self, text: str, format: str = "bullet") -> str:
        """Tạo ghi chú học tập"""
        format_instructions = {
            "bullet": "dạng bullet points (gạch đầu dòng)",
            "mindmap": "dạng mindmap (sơ đồ tư duy) với cấu trúc phân cấp",
            "outline": "dạng outline (dàn ý) với các tiêu đề và mục con"
        }
        
        prompt_text = f"""Hãy tạo ghi chú học tập từ nội dung sau, theo định dạng {format_instructions.get(format, 'bullet points')}:

{text}

Bao gồm:
- Khái niệm chính
- Ví dụ minh họa (nếu có)
- Công thức hoặc công thức quan trọng (nếu có)
- Ý chính và điểm quan trọng

Ghi chú:"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Bạn là một trợ giảng AI, chuyên tạo ghi chú học tập hiệu quả cho sinh viên."),
            ("human", prompt_text)
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"text": text[:8000]})
        if hasattr(response, 'content'):
            return response.content
        return str(response)
    
    def generate_quiz(self, text: str, num_questions: int = 5, question_type: str = "mixed") -> List[Dict]:
        """Tạo bộ câu hỏi quiz"""
        prompt_text = f"""Hãy tạo {num_questions} câu hỏi từ nội dung tài liệu sau:

{text}

Yêu cầu:
- Loại câu hỏi: {question_type}
- Câu hỏi phải rõ ràng, có đáp án đúng
- Nếu là trắc nghiệm, có 4 lựa chọn A, B, C, D
- Nếu là tự luận, có đáp án mẫu
- Nếu là flashcard, có câu hỏi ngắn và đáp án ngắn

Trả về định dạng JSON với cấu trúc:
[
  {{
    "question": "Câu hỏi",
    "type": "multiple_choice|essay|flashcard",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."] (nếu multiple_choice),
    "correct_answer": "Đáp án đúng",
    "explanation": "Giải thích"
  }}
]"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Bạn là một trợ giảng AI, chuyên tạo câu hỏi ôn tập hiệu quả."),
            ("human", prompt_text)
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"text": text[:8000]})
        if hasattr(response, 'content'):
            response = response.content
        response = str(response)
        
        # Parse JSON response (có thể cần xử lý thêm)
        import json
        try:
            # Tìm JSON trong response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            questions = json.loads(json_str)
            return questions
        except:
            # Fallback: trả về dạng text
            return [{"question": response, "type": "essay", "answer": "Xem trong tài liệu"}]
    
    def generate_podcast_transcript(self, text: str, topic: str = None, duration_minutes: int = 5) -> str:
        """Tạo transcript cho podcast dạng đối thoại"""
        topic_context = f"về chủ đề: {topic}" if topic else "từ nội dung tài liệu"
        
        prompt_text = f"""Hãy tạo một đoạn hội thoại podcast giáo dục {topic_context}, dài khoảng {duration_minutes} phút (khoảng {duration_minutes * 150} từ).

Nội dung tài liệu:
{text}

Yêu cầu:
- Dạng đối thoại giữa hai người: Giảng viên (GV) và Sinh viên (SV)
- SV đặt câu hỏi về các khái niệm khó, GV giải thích dễ hiểu
- Có ví dụ minh họa cụ thể
- Tự nhiên, gần gũi như một cuộc trò chuyện thật
- Giúp người nghe hiểu sâu về chủ đề

Format:
GV: [lời nói của giảng viên]
SV: [lời nói của sinh viên]

Transcript:"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Bạn là một nhà sản xuất podcast giáo dục chuyên nghiệp."),
            ("human", prompt_text)
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"text": text[:8000]})
        if hasattr(response, 'content'):
            return response.content
        return str(response)

