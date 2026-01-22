from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import Settings


class LLMGroqService:
    """Service for interacting with Groq LLM"""
    
    def __init__(self):
        if not Settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.llm = ChatGroq(
            groq_api_key=Settings.GROQ_API_KEY,
            model_name=Settings.MODEL_NAME,
            temperature=0.1
        )
    
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate response from LLM"""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = self.llm.invoke(messages)
        return response.content

