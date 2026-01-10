from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from rag_engine import RAGChatbot
from schemas import (
    ChatRequest, ChatResponse, AddDocumentRequest,
    UploadResponse, DocumentListResponse, StatusResponse,
    ErrorResponse, HealthResponse, DeleteDocumentRequest
)
from config import settings
from pathlib import Path
import shutil
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="RAG-powered chatbot with document processing",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot
try:
    chatbot = RAGChatbot(
        model=settings.LLM_MODEL,
        embedding_model=settings.EMBEDDING_MODEL
    )
    
    # Try to load existing knowledge base
    kb_path = settings.STORAGE_DIR / settings.KB_FILE
    if kb_path.exists():
        chatbot.load_knowledge_base(str(kb_path))
        logger.info(f"Loaded existing knowledge base from {kb_path}")
    
except Exception as e:
    logger.error(f"Failed to initialize chatbot: {e}")
    raise

# ============ Exception Handlers ============

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc)
        ).dict()
    )

# ============ Health & Status Endpoints ============

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and status"""
    stats = chatbot.get_stats()
    return HealthResponse(
        status="healthy",
        models={
            "llm": settings.LLM_MODEL,
            "embedding": settings.EMBEDDING_MODEL
        },
        vector_store_size=stats["total_chunks"]
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RAG Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "upload": "/upload",
            "documents": "/documents",
            "docs": "/docs"
        }
    }

# ============ Chat Endpoints ============

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Chat with the RAG-powered chatbot
    
    - **message**: User's question or message
    - **use_rag**: Whether to use RAG (retrieve context from documents)
    - **top_k**: Number of relevant chunks to retrieve (1-10)
    """
    try:
        logger.info(f"Chat request: {req.message[:50]}... (RAG: {req.use_rag})")
        
        result = chatbot.chat(
            message=req.message,
            use_rag=req.use_rag,
            top_k=req.top_k or settings.TOP_K_RESULTS
        )
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            context_used=result["context_used"]
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )

# ============ File Upload Endpoints ============

def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        return False, f"File type {file_ext} not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
    
    # Note: File size validation should be done during reading
    return True, "Valid"

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a document to the knowledge base
    
    Supported formats: TXT, PDF, DOCX, DOC, XLSX, XLS, CSV
    Max file size: 50MB
    """
    try:
        # Validate file
        is_valid, message = validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Sanitize filename
        safe_filename = Path(file.filename).name
        file_path = settings.UPLOAD_DIR / safe_filename
        
        # Check file size while reading
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
        file_size = 0
        
        # Save file with size check
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)
                if file_size > max_size:
                    # Clean up partial file
                    buffer.close()
                    file_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
                    )
                buffer.write(chunk)
        
        logger.info(f"Saved file: {safe_filename} ({file_size} bytes)")
        
        # Add document to RAG
        success, chunks_created = chatbot.add_document(str(file_path))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process document. The file may be empty or corrupted."
            )
        
        # Auto-save knowledge base
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        chatbot.save_knowledge_base(str(kb_path))
        
        logger.info(f"Added document: {safe_filename} ({chunks_created} chunks)")
        
        return UploadResponse(
            status="success",
            filename=safe_filename,
            chunks_created=chunks_created,
            message=f"Document processed successfully. Created {chunks_created} chunks."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        # Clean up file if it exists
        if file_path.exists():
            file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing upload: {str(e)}"
        )

# ============ Document Management Endpoints ============

@app.post("/documents/add")
async def add_document(req: AddDocumentRequest):
    """Add a document from a file path (for internal use)"""
    try:
        if not Path(req.path).exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {req.path}"
            )
        
        success, chunks_created = chatbot.add_document(req.path, req.metadata)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process document"
            )
        
        return {
            "success": success,
            "chunks_created": chunks_created
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """List all documents in the knowledge base"""
    try:
        data = chatbot.vector_store.get()
        stats = chatbot.get_stats()
        
        # Group documents by filename
        documents = []
        seen_files = set()
        
        for meta in data["metadatas"]:
            filename = meta.get("filename", "Unknown")
            if filename not in seen_files:
                seen_files.add(filename)
                documents.append({
                    "filename": filename,
                    "source": meta.get("source", ""),
                    "chunks": stats["documents"].get(filename, 0),
                    "upload_date": meta.get("upload_date", "")
                })
        
        return DocumentListResponse(
            documents=documents,
            total_documents=stats["total_documents"],
            total_chunks=stats["total_chunks"]
        )
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/documents/delete", response_model=StatusResponse)
async def delete_document(req: DeleteDocumentRequest):
    """Delete a document from the knowledge base"""
    try:
        chunks_removed = chatbot.delete_document(req.filename)
        
        if chunks_removed == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {req.filename}"
            )
        
        # Auto-save knowledge base
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        chatbot.save_knowledge_base(str(kb_path))
        
        # Try to delete physical file
        file_path = settings.UPLOAD_DIR / req.filename
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted file: {req.filename}")
        
        logger.info(f"Deleted document: {req.filename} ({chunks_removed} chunks)")
        
        return StatusResponse(
            status="success",
            message=f"Deleted {chunks_removed} chunks from '{req.filename}'"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/documents/clear", response_model=StatusResponse)
async def clear_all_documents():
    """Clear all documents from the knowledge base"""
    try:
        chatbot.clear_knowledge_base()
        
        # Save empty knowledge base
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        chatbot.save_knowledge_base(str(kb_path))
        
        logger.info("Cleared all documents from knowledge base")
        
        return StatusResponse(
            status="success",
            message="All documents cleared from knowledge base"
        )
        
    except Exception as e:
        logger.error(f"Error clearing documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ Knowledge Base Persistence ============

@app.post("/kb/save", response_model=StatusResponse)
async def save_kb():
    """Manually save knowledge base to disk"""
    try:
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        chatbot.save_knowledge_base(str(kb_path))
        logger.info(f"Saved knowledge base to {kb_path}")
        
        return StatusResponse(
            status="success",
            message="Knowledge base saved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error saving knowledge base: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/kb/load", response_model=StatusResponse)
async def load_kb():
    """Manually load knowledge base from disk"""
    try:
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        
        if not kb_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge base file not found"
            )
        
        chatbot.load_knowledge_base(str(kb_path))
        stats = chatbot.get_stats()
        
        logger.info(f"Loaded knowledge base from {kb_path}")
        
        return StatusResponse(
            status="success",
            message=f"Loaded {stats['total_chunks']} chunks from {stats['total_documents']} documents"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading knowledge base: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/kb/stats")
async def get_kb_stats():
    """Get knowledge base statistics"""
    try:
        stats = chatbot.get_stats()
        return {
            "status": "success",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ Startup Event ============

@app.on_event("startup")
async def startup_event():
    """Actions to perform on startup"""
    logger.info(f"Starting {settings.APP_NAME}...")
    logger.info(f"LLM Model: {settings.LLM_MODEL}")
    logger.info(f"Embedding Model: {settings.EMBEDDING_MODEL}")
    
    stats = chatbot.get_stats()
    logger.info(f"Loaded {stats['total_chunks']} chunks from {stats['total_documents']} documents")

@app.on_event("shutdown")
async def shutdown_event():
    """Actions to perform on shutdown"""
    logger.info("Shutting down...")
    
    # Auto-save knowledge base
    try:
        kb_path = settings.STORAGE_DIR / settings.KB_FILE
        chatbot.save_knowledge_base(str(kb_path))
        logger.info("Knowledge base saved on shutdown")
    except Exception as e:
        logger.error(f"Error saving knowledge base on shutdown: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )