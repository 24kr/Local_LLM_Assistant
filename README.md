# LoLA [Local Large Language Model Assistant]

<div align="center">
<h1>LoLA</h1>
Privacy-Focused AI Assistant with Retrieval-Augmented Generation

[Features](#features) -  [Installation](#installation) -  [Usage](#usage) -  [Desktop App](#desktop-app) -  [Documentation](#documentation)
</div>

## Overview
LoLA (Local Large Language Model Assistant) is a privacy-first desktop application that brings the power of AI to your local machine. Using Retrieval-Augmented Generation (RAG), LoLA allows you to chat with your documents using state-of-the-art language models—completely offline. [mistral](https://mistral.ai/news/mistral-3)

**Why LoLA?**
- ✅ 100% Private - Your data never leaves your machine
- ✅ Offline-First - No internet required after setup
- ✅ Document RAG - Upload and chat with your documents
- ✅ Multi-Format Support - PDF, DOCX, TXT, CSV, XLSX
- ✅ Cross-Platform - Windows, macOS, and Linux
- ✅ Modern UI - Dark mode, chat sessions, intuitive interface
- ✅ Open Source - Apache 2.0 licensed [vladimirgorej](https://vladimirgorej.com/blog/how-to-apply-apache2-license-to-your-open-source-software-project/)

## Features
### Core Functionality
- 🔍 Semantic Search - Vector-based document retrieval [dev](https://dev.to/vivekyadav200988/building-a-retrieval-augmented-generation-rag-api-and-frontend-with-fastapi-and-react-native-2n7k)
- 💬 Chat Interface - Natural conversation with AI
- 📚 Document Management - Upload, view, and delete documents
- 🎯 RAG Toggle - Switch between RAG-powered and direct chat modes
- 💾 Chat Sessions - Multiple conversations with history
- 🌙 Dark Mode - Easy on the eyes

### Technical Features
- Vector Store - In-memory vector database with persistence
- Document Chunking - Smart text splitting with overlap
- Embeddings - Semantic embeddings via Ollama (nomic-embed-text) [github](https://github.com/ollama/ollama/issues/9340)
- Deduplication - Automatic duplicate detection
- Auto-Save - Persistent chat and document storage
- File Validation - Size limits and type checking

### Supported File Formats

| Format | Extension     | Status    |
|--------|---------------|-----------|
| PDF    | .pdf          | ✅ Supported |
| Word   | .docx, .doc   | ✅ Supported |
| Text   | .txt          | ✅ Supported |
| CSV    | .csv          | ✅ Supported |
| Excel  | .xlsx, .xls   | ✅ Supported | [dev](https://dev.to/vivekyadav200988/building-a-retrieval-augmented-generation-rag-api-and-frontend-with-fastapi-and-react-native-2n7k)

## Architecture
```
LoLA/
├── frontend/                 # React + Electron Desktop App
│   ├── electron/            # Electron main/preload scripts
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API integration
│   │   └── styles/          # CSS with dark mode
│   ├── dist/                # Built frontend
│   └── release/             # Packaged desktop apps
│
├── backend/                  # Python FastAPI Server
│   ├── storage/             # Vector store persistence
│   ├── uploads/             # User documents
│   ├── main.py              # FastAPI application
│   ├── rag_engine.py        # RAG implementation
│   ├── config.py            # Configuration
│   └── requirements.txt     # Python dependencies
│
└── docs/                     # Documentation
```

## Prerequisites
### Required Software
- Python 3.8+ (`python --version`)
- Node.js 16+ (`node --version`)
- Ollama (Download: https://ollama.com) [ollama](https://ollama.com/library/)

### Required Models
Pull the required Ollama models: [reddit](https://www.reddit.com/r/ollama/comments/1pcsp6c/ministral3_and_mistrallarge3/)
```
ollama pull ministral:3b         # Main LLM model ( Ministral 3B variant)
ollama pull nomic-embed-text     # Embedding model
```
Verify:
```
ollama list
```

## Installation
### Option 1: Quick Start (Recommended)
**Windows:**
```
git clone https://github.com/yourusername/LoLA.git
cd LoLA
app.bat
```

**Linux/macOS:**
```
git clone https://github.com/yourusername/LoLA.git
cd LoLA
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup
**Backend:**
```
cd backend
python -m venv .venv
# Activate venv
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```
cd frontend
npm install
npm run dev  # or npm run electron:dev
```

## Desktop App
### Development Mode
```
cd frontend
npm run electron:dev
```
Starts Vite, Electron, and backend with hot-reload.

### Build
```
npm run electron:build      # Current platform
npm run electron:build:win  # Windows
npm run electron:build:mac  # macOS
npm run electron:build:linux # Linux
```
Outputs in `frontend/release/` (e.g., `.exe`, `.dmg`, `.AppImage`).

## Usage
1. Start Ollama: `ollama serve`
2. Launch LoLA (app or `npm run electron:dev`)
3. **Upload Documents:** Documents tab → Choose file → Upload (≤50MB)
4. **Chat:** Chat tab → Toggle RAG → Ask questions
5. **Sessions:** New (+), Switch (Chats), Delete (🗑️), Export (📥)

**Settings:** Theme toggle, RAG mode, status, clear KB.

## Configuration
`.env` in `backend/`:
```
APP_NAME=LoLA
HOST=0.0.0.0
PORT=8000
LLM_MODEL=ministral:3b
EMBEDDING_MODEL=nomic-embed-text
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K_RESULTS=3
MAX_FILE_SIZE_MB=50
```
Change models in `config.py`. [ollama](https://ollama.com/library/)

**API Docs:** http://localhost:8000/docs

## Troubleshooting
- **Ollama issues:** `ollama serve`; `ollama list` [cohorte](https://www.cohorte.co/blog/run-llms-locally-with-ollama-privacy-first-ai-for-developers-in-2025)
- **Port conflict:** Edit `PORT` in config
- **Frontend fail:** `rm -rf node_modules`; `npm install`
- Logs: Backend terminal, Electron F12 DevTools

| Endpoint       | Method | Description          |
|----------------|--------|----------------------|
| /health        | GET    | Health check         |
| /chat          | POST   | Send message         |
| /upload        | POST   | Upload document      |
| /documents     | GET    | List documents       |
| /documents/{id}| DELETE | Delete document      |
| /kb/save       | POST   | Save KB              | [dev](https://dev.to/vivekyadav200988/building-a-retrieval-augmented-generation-rag-api-and-frontend-with-fastapi-and-react-native-2n7k)

## Contributing
1. Fork repo
2. `git checkout -b feature/YourFeature`
3. Commit, push, PR

Follow code style, add tests, update docs. [github](https://github.com/hwn123/readme-best-practices)

## Roadmap
**v1.1:**
- Multi-language
- Voice I/O
- Doc preview
- Search filters
- Model UI

**v1.2:** Cloud sync (opt.), mobile app, plugins.

## License
Apache License 2.0. See [LICENSE](LICENSE). [github](https://github.com/IQAndreas/markdown-licenses/blob/master/apache-v2.0.md)

## Acknowledgments
- Ollama [ollama](https://ollama.com/library/)
- FastAPI, React, Electron [github](https://github.com/lorem-ipsumm/electron-gpt)
- Mistral AI (Ministral 3) [mistral](https://mistral.ai/news/mistral-3)

**Support:** GitHub Issues/Discussions [24kr](https://github.com/24kr/Local_App_RAG-Technique)

<div align="center">
Built for privacy-first AI excellence

</div>

