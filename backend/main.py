from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rag_engine import RAGChatbot
from schemas import ChatRequest, ChatResponse, AddDocumentRequest

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
