import os
import chromadb
from chromadb.config import Settings
from langchain_openai import OpenAIEmbeddings
try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict
import uuid

class VectorStore:
    def __init__(self):
        self.persist_directory = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        self._embeddings = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.client = chromadb.PersistentClient(path=self.persist_directory)
    
    @property
    def embeddings(self):
        """Lazy initialization of embeddings"""
        if self._embeddings is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError(
                    "OPENAI_API_KEY not found. Please set it in your .env file. "
                    "Get your API key from: https://platform.openai.com/api-keys"
                )
            self._embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        return self._embeddings
    
    def create_collection_for_document(self, document_id: str) -> Chroma:
        """Tạo collection mới cho một document"""
        collection_name = f"doc_{document_id}"
        
        # Xóa collection cũ nếu tồn tại
        try:
            self.client.delete_collection(collection_name)
        except:
            pass
        
        # Tạo collection mới
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            client=self.client,
            persist_directory=os.path.join(self.persist_directory, collection_name)
        )
        
        return vectorstore
    
    def add_document(self, document_id: str, text: str, metadata: Dict = None):
        """Thêm document vào vector store"""
        # Chia text thành chunks
        chunks = self.text_splitter.split_text(text)
        
        # Tạo metadata cho mỗi chunk
        metadatas = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                "document_id": document_id,
                "chunk_index": i,
            }
            # Merge thêm metadata nếu có
            if metadata:
                chunk_metadata.update(metadata)
            metadatas.append(chunk_metadata)
        
        # Lưu vào vector store
        vectorstore = self.create_collection_for_document(document_id)
        vectorstore.add_texts(
            texts=chunks,
            metadatas=metadatas,
            ids=[f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        )
        
        return vectorstore
    
    def search(self, document_id: str, query: str, k: int = 5) -> List[Dict]:
        """Tìm kiếm trong vector store"""
        collection_name = f"doc_{document_id}"
        
        try:
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                client=self.client,
                persist_directory=os.path.join(self.persist_directory, collection_name)
            )
            
            # Tìm kiếm
            results = vectorstore.similarity_search_with_score(query, k=k)
            
            # Format kết quả
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "text": doc.page_content,
                    "score": float(score),
                    "metadata": doc.metadata
                })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching vector store: {e}")
            return []
    
    def delete_document(self, document_id: str):
        """Xóa document khỏi vector store"""
        collection_name = f"doc_{document_id}"
        try:
            self.client.delete_collection(collection_name)
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False

