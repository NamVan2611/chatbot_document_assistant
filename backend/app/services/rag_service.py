from typing import List
from pathlib import Path
from app.services.pdf_loader import PDFLoader
from app.services.text_splitter import TextSplitterService
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.services.retriever import RetrieverService
from app.services.llm_groq import LLMGroqService
from app.config import Settings


class PromptLoader:
    """Load prompts from files"""
    
    @staticmethod
    def load_prompt(prompt_name: str, language: str = "en") -> tuple[str, str]:
        """Load system and user prompts from file"""
        prompt_file = Path(__file__).parent.parent / "prompts" / f"{prompt_name}.txt"
        
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split by language (separated by ---)
        parts = content.split("---")
        if language == "vi" and len(parts) > 1:
            # Get Vietnamese part, skip the "VIETNAMESE:" label if present
            prompt_text = parts[1].strip()
            if prompt_text.startswith("VIETNAMESE:"):
                prompt_text = prompt_text.split("VIETNAMESE:", 1)[1].strip()
        else:
            # Get English part, skip the "ENGLISH:" label if present
            prompt_text = parts[0].strip()
            if prompt_text.startswith("ENGLISH:"):
                prompt_text = prompt_text.split("ENGLISH:", 1)[1].strip()
        
        # System prompt comes from system.txt
        system_file = Path(__file__).parent.parent / "prompts" / "system.txt"
        with open(system_file, 'r', encoding='utf-8') as f:
            system_content = f.read()
        system_prompt = system_content.split("---")[0].strip()
        
        return system_prompt, prompt_text


class RAGService:
    """Main RAG service that orchestrates all components"""
    
    def __init__(self):
        self.pdf_loader = PDFLoader()
        self.text_splitter = TextSplitterService()
        self.embeddings = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.retriever = RetrieverService(self.vector_store, self.embeddings)
        self.llm = LLMGroqService()
        self.prompt_loader = PromptLoader()
    
    def _format_prompt(self, template: str, **kwargs) -> str:
        """Format prompt template with variables"""
        return template.format(**kwargs)
    
    def _get_system_prompt(self, language: str = "en") -> str:
        """Get system prompt"""
        system_file = Path(__file__).parent.parent / "prompts" / "system.txt"
        with open(system_file, 'r', encoding='utf-8') as f:
            content = f.read()
        # Return first part (before any --- separator)
        return content.split("---")[0].strip()
    
    async def answer_question(self, query: str, document_ids: List[str], language: str = "en") -> str:
        """Answer a question based on retrieved document content from multiple documents"""
        all_chunks = []
        
        # Retrieve chunks from all documents
        for document_id in document_ids:
            chunks = self.retriever.retrieve(document_id, query, k=Settings.MAX_RETRIEVAL_CHUNKS)
            # Add document_id metadata to each chunk
            for chunk in chunks:
                all_chunks.append((chunk, document_id))
        
        if not all_chunks:
            return "The requested information is not available in the uploaded documents." if language == "en" else "Thông tin được yêu cầu không có trong các tài liệu đã tải lên."
        
        # Sort chunks and take top k
        # For now, just use first k chunks (can be improved with better ranking)
        selected_chunks = [chunk for chunk, _ in all_chunks[:Settings.MAX_RETRIEVAL_CHUNKS]]
        context = "\n\n".join(selected_chunks)
        
        # Load prompt
        system_prompt, user_template = self.prompt_loader.load_prompt("qa", language)
        user_prompt = self._format_prompt(user_template, context=context, query=query)
        
        return self.llm.generate(system_prompt, user_prompt)
    
    def _summarize_chunk_batch(self, chunks: List[str], language: str = "en") -> str:
        """Summarize a batch of chunks (Map phase)"""
        context = "\n\n".join(chunks)
        system_prompt, user_template = self.prompt_loader.load_prompt("summary", language)
        user_prompt = self._format_prompt(user_template, context=context)
        return self.llm.generate(system_prompt, user_prompt)
    
    def _combine_summaries(self, summaries: List[str], language: str = "en") -> str:
        """Combine multiple summaries into a final summary (Reduce phase)"""
        combined_context = "\n\n---\n\n".join(summaries)
        
        if language == "vi":
            system_prompt = """Bạn là trợ lý học tập. Nhiệm vụ của bạn là kết hợp các tóm tắt từng phần thành một tóm tắt tổng hợp duy nhất.

Yêu cầu:
- Kết hợp thông tin từ tất cả các phần tóm tắt
- Loại bỏ thông tin trùng lặp
- Tạo một tóm tắt mạch lạc và toàn diện
- Giữ các ý tưởng cốt lõi và khái niệm chính"""
            user_prompt = f"""Các phần tóm tắt từ tài liệu:

{combined_context}

Hãy kết hợp các phần tóm tắt này thành một tóm tắt tổng hợp duy nhất."""
        else:
            system_prompt = """You are a learning assistant. Your task is to combine partial summaries into a single comprehensive summary.

Requirements:
- Combine information from all partial summaries
- Remove duplicate information
- Create a coherent and comprehensive summary
- Preserve core ideas and key concepts"""
            user_prompt = f"""Partial summaries from the document:

{combined_context}

Please combine these summaries into a single comprehensive summary."""
        
        return self.llm.generate(system_prompt, user_prompt)
    
    async def summarize_document(self, document_id: str, language: str = "en") -> str:
        """Summarize the entire document using Map-Reduce approach"""
        all_chunks = self.vector_store.get_all_chunks(document_id)
        
        if not all_chunks:
            return "The requested information is not available in the uploaded document." if language == "en" else "Thông tin được yêu cầu không có trong tài liệu đã tải lên."
        
        # Map-Reduce: If document is small, use single pass
        # Estimate tokens: ~1 token per character (rough estimate)
        total_estimated_tokens = sum(len(chunk) for chunk in all_chunks)
        max_tokens_per_request = 4000  # Conservative limit to stay under 6000 TPM
        
        if total_estimated_tokens <= max_tokens_per_request:
            # Small document - single pass summarization
            context = "\n\n".join(all_chunks)
            system_prompt, user_template = self.prompt_loader.load_prompt("summary", language)
            user_prompt = self._format_prompt(user_template, context=context)
            return self.llm.generate(system_prompt, user_prompt)
        
        # Large document - Map-Reduce approach
        # Step 1: Map - Summarize chunks in batches
        batch_size = Settings.MAX_CHUNKS_PER_BATCH
        summaries = []
        
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            batch_summary = self._summarize_chunk_batch(batch, language)
            summaries.append(batch_summary)
        
        # Step 2: Reduce - Combine summaries
        # If we have too many summaries, combine them recursively
        while len(summaries) > 1:
            combined_summaries = []
            for i in range(0, len(summaries), batch_size):
                batch = summaries[i:i + batch_size]
                if len(batch) == 1:
                    combined_summaries.append(batch[0])
                else:
                    combined = self._combine_summaries(batch, language)
                    combined_summaries.append(combined)
            summaries = combined_summaries
        
        return summaries[0] if summaries else "Error: Could not generate summary."
    
    async def generate_study_notes(self, document_id: str, language: str = "en") -> str:
        """Generate concise study notes"""
        all_chunks = self.vector_store.get_all_chunks(document_id)
        
        if not all_chunks:
            return "The requested information is not available in the uploaded document." if language == "en" else "Thông tin được yêu cầu không có trong tài liệu đã tải lên."
        
        max_chunks = 25
        if len(all_chunks) > max_chunks:
            step = len(all_chunks) // max_chunks
            chunks = all_chunks[::step][:max_chunks]
        else:
            chunks = all_chunks
        
        context = "\n\n".join(chunks)
        
        system_prompt, user_template = self.prompt_loader.load_prompt("notes", language)
        user_prompt = self._format_prompt(user_template, context=context)
        
        return self.llm.generate(system_prompt, user_prompt)
    
    async def generate_faq(self, document_id: str, language: str = "en") -> str:
        """Generate Frequently Asked Questions"""
        all_chunks = self.vector_store.get_all_chunks(document_id)
        
        if not all_chunks:
            return "The requested information is not available in the uploaded document." if language == "en" else "Thông tin được yêu cầu không có trong tài liệu đã tải lên."
        
        max_chunks = 25
        if len(all_chunks) > max_chunks:
            step = len(all_chunks) // max_chunks
            chunks = all_chunks[::step][:max_chunks]
        else:
            chunks = all_chunks
        
        context = "\n\n".join(chunks)
        
        system_prompt, user_template = self.prompt_loader.load_prompt("faq", language)
        user_prompt = self._format_prompt(user_template, context=context)
        
        return self.llm.generate(system_prompt, user_prompt)
    
    async def generate_podcast_script(self, document_id: str, language: str = "en") -> str:
        """Generate an educational podcast script"""
        all_chunks = self.vector_store.get_all_chunks(document_id)
        
        if not all_chunks:
            return "The requested information is not available in the uploaded document." if language == "en" else "Thông tin được yêu cầu không có trong tài liệu đã tải lên."
        
        max_chunks = 30
        if len(all_chunks) > max_chunks:
            step = len(all_chunks) // max_chunks
            chunks = all_chunks[::step][:max_chunks]
        else:
            chunks = all_chunks
        
        context = "\n\n".join(chunks)
        
        system_prompt, user_template = self.prompt_loader.load_prompt("podcast", language)
        user_prompt = self._format_prompt(user_template, context=context)
        
        return self.llm.generate(system_prompt, user_prompt)
