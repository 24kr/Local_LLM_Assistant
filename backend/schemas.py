from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    use_rag: bool = True

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class AddDocumentRequest(BaseModel):
    path: str


