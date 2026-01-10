from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime

# ============ Request Schemas ============

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    use_rag: bool = True
    session_id: Optional[str] = None
    top_k: Optional[int] = Field(default=3, ge=1, le=10)
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class AddDocumentRequest(BaseModel):
    path: str
    metadata: Optional[Dict] = None

# ============ Response Schemas ============

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    context_used: bool = True
    timestamp: datetime = Field(default_factory=datetime.now)

class DocumentResponse(BaseModel):
    id: str
    filename: str
    source: str
    chunks: int
    upload_date: datetime

class UploadResponse(BaseModel):
    status: str
    filename: str
    chunks_created: int
    message: Optional[str] = None

class DocumentListResponse(BaseModel):
    documents: List[Dict]
    total_documents: int
    total_chunks: int

class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
    models: Dict[str, str]
    vector_store_size: int
    
class DeleteDocumentRequest(BaseModel):
    filename: str
    
    @validator('filename')
    def validate_filename(cls, v):
        if not v.strip():
            raise ValueError('Filename cannot be empty')
        return v.strip()