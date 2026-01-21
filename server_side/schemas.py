from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime

# ============ Request Schemas ============

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    use_rag: bool = True
    session_id: Optional[str] = None
    top_k: Optional[int] = Field(default=3, ge=1, le=10)
    model: Optional[str] = None  # Allow per-request model override
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class AddDocumentRequest(BaseModel):
    path: str
    metadata: Optional[Dict] = None

class ModelSwitchRequest(BaseModel):
    model_name: str = Field(..., min_length=1)
    
    @validator('model_name')
    def validate_model_name(cls, v):
        if not v.strip():
            raise ValueError('Model name cannot be empty')
        return v.strip()

# ============ Response Schemas ============

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    context_used: bool = True
    model_used: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class MessageModel(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    text: str
    sources: List[str] = []
    context_used: Optional[bool] = None
    timestamp: str

class ChatSessionModel(BaseModel):
    id: str
    title: str
    messages: List[MessageModel]
    created_at: datetime
    updated_at: datetime

class SaveChatRequest(BaseModel):
    session: ChatSessionModel

class LoadChatRequest(BaseModel):
    session_id: str

class ListChatsResponse(BaseModel):
    sessions: List[ChatSessionModel]
    total: int

class DeleteChatRequest(BaseModel):
    session_id: str

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

class ModelInfo(BaseModel):
    name: str
    size: int
    modified: str
    digest: str
    capabilities: List[str] = []

class ModelListResponse(BaseModel):
    models: List[ModelInfo]
    current_llm: str
    current_embedding: str
    
class DeleteDocumentRequest(BaseModel):
    filename: str
    
    @validator('filename')
    def validate_filename(cls, v):
        if not v.strip():
            raise ValueError('Filename cannot be empty')
        return v.strip()