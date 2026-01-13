from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Local LLM Application"
    DEBUG: bool = False
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    
    # Model Settings
    LLM_MODEL: str = "ministral-3"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    
    # RAG Settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 3
    MIN_SIMILARITY: float = 0.3
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = [
        ".txt", ".pdf", ".docx", ".doc", 
        ".xlsx", ".xls", ".csv"
    ]
    
    # Storage Paths
    UPLOAD_DIR: Path = Path("uploads")
    STORAGE_DIR: Path = Path("storage")
    KB_FILE: str = "knowledge_base.pkl"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
        self.STORAGE_DIR.mkdir(exist_ok=True, parents=True)

settings = Settings()