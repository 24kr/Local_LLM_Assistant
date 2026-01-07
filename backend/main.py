from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rag_engine import RAGChatbot
from schemas import ChatRequest, ChatResponse, AddDocumentRequest
from fastapi import UploadFile, File
from pathlib import Path
import shutil

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True) 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = RAGChatbot(
    model="ministral-3",
    embedding_model="nomic-embed-text"
)

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    result = chatbot.chat(req.message, use_rag=req.use_rag)
    return result

@app.post("/documents/add")
def add_document(req: AddDocumentRequest):
    success = chatbot.add_document(req.path)
    return {"success": success}

@app.get("/documents")
def list_documents():
    return chatbot.vector_store.get()

@app.post("/kb/save")
def save_kb():
    chatbot.save_knowledge_base("storage/knowledge_base.pkl")
    return {"status": "saved"}

@app.post("/kb/load")
def load_kb():
    chatbot.load_knowledge_base("storage/knowledge_base.pkl")
    return {"status": "loaded"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Add document to RAG
    chatbot.add_document(str(file_path))

    return {
        "status": "success",
        "filename": file.filename
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    success = chatbot.add_document(str(file_path))

    print("📚 VECTOR STORE SIZE:", len(chatbot.vector_store.documents))

    return {
        "status": "success" if success else "failed",
        "filename": file.filename
    }
