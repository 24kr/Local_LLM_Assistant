<div align="center">

# 🚀 LoLA - Local LLM Assistant

### Privacy-First AI Desktop Application with Advanced RAG Capabilities

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()
[![Version](https://img.shields.io/badge/Version-1.0.24-green)]()
[![Powered by](https://img.shields.io/badge/Powered%20by-Ollama-ff6b6b)]()

**🔒 100% Private • 💾 Offline-First • 📚 Document RAG • 🎨 Modern UI**

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

---

</div>

## 📖 Overview

**LoLA (Local Large Language Model Assistant)** is a cutting-edge, privacy-focused desktop application that brings enterprise-grade AI capabilities directly to your local machine. Built with modern technologies and powered by [Mistral AI](https://mistral.ai/news/mistral-3), LoLA enables you to interact with your documents using state-of-the-art language models—completely offline and secure.

### Why Choose LoLA?

| Feature | Description |
|---------|-------------|
| 🔒 **100% Private** | Your data never leaves your machine. No cloud, no tracking, no compromises. |
| 💾 **Offline-First** | Work anywhere, anytime. No internet required after initial setup. |
| 📚 **Advanced RAG** | Retrieval-Augmented Generation for context-aware, accurate responses. |
| 🤖 **Model Switching** | Seamlessly switch between models for optimal performance. |
| 👁️ **Vision AI** | Analyze images with built-in vision model support. |
| 💻 **Code Understanding** | Process and query 40+ programming file formats. |
| 🌍 **Multi-Format** | PDF, DOCX, XLSX, images, code files, and more. |
| 🎨 **Modern UI** | Sleek dark mode, chat sessions, and intuitive design. |
| ⚡ **High Performance** | Optimized for speed and efficiency. |

---

## ✨ Features

### 🎯 Core Capabilities

#### **Intelligent Chat System**
- 💬 Natural conversation with advanced language models
- 🔄 Multiple chat sessions with auto-save
- 📝 Export conversations to text files
- 🎭 Context-aware responses using RAG

#### **Document Intelligence**
- 📄 Upload and process multiple document formats
- 🔍 Semantic search with vector embeddings
- 📊 Smart chunking with configurable overlap
- 🗑️ Easy document management (upload, view, delete)

#### **Vision Capabilities** 🆕
- 👁️ Image analysis using vision-capable models (Ministral-3, LLaVA)
- 🖼️ Extract text and describe content from images
- 📸 On-demand processing for optimal performance
- 🎨 Support for PNG, JPG, SVG, GIF, WebP, and more

#### **Code Understanding** 🆕
- 💻 Process 40+ programming languages
- 📝 Read HTML, CSS, JavaScript, Python, Java, C++, Go, Rust, and more
- 🔧 Configuration files (JSON, YAML, XML, ENV)
- 📋 Markdown and documentation files

#### **Dynamic Model Management** 🆕
- 🤖 Switch models on-the-fly without restart
- 🏷️ Auto-detect model capabilities (Vision, Coding, Chat, Embedding)
- 📊 View model details (size, capabilities, status)
- ⚡ Quick model selector in chat interface

### 🎨 User Experience

- **Dark Mode** - Eye-friendly interface with modern design
- **Chat History** - Browse and manage multiple conversation threads
- **Drag & Drop** - Easy file uploads
- **Real-time Status** - Live backend connection monitoring
- **Responsive Design** - Optimized for all screen sizes

### 🔧 Technical Excellence

- **Vector Store** - In-memory database with persistent storage
- **Smart Deduplication** - Automatic duplicate content detection
- **Optimized Processing** - Efficient chunking and embedding
- **Auto-Save** - Never lose your work
- **Error Handling** - Robust error recovery and logging
- **API Documentation** - Interactive Swagger/ReDoc docs

---

## 📦 Supported File Formats

### Documents
| Format | Extensions | Status | Use Case |
|--------|-----------|--------|----------|
| PDF | `.pdf` | ✅ | Reports, books, articles |
| Word | `.docx`, `.doc` | ✅ | Documents, contracts |
| Text | `.txt`, `.md` | ✅ | Notes, README files |
| Excel | `.xlsx`, `.xls` | ✅ | Data analysis, spreadsheets |
| CSV | `.csv` | ✅ | Datasets, exports |

### Images 🆕
| Format | Extensions | Status | Features |
|--------|-----------|--------|----------|
| PNG | `.png` | ✅ | Screenshots, diagrams |
| JPEG | `.jpg`, `.jpeg` | ✅ | Photos, images |
| SVG | `.svg` | ✅ | Vector graphics |
| GIF | `.gif` | ✅ | Animations, icons |
| WebP | `.webp`, `.bmp` | ✅ | Modern formats |

### Code Files 🆕
| Category | Extensions | Count |
|----------|-----------|-------|
| Web | `.html`, `.css`, `.js`, `.jsx`, `.ts`, `.tsx` | 6 |
| Python | `.py` | 1 |
| Compiled | `.cpp`, `.c`, `.h`, `.java`, `.cs`, `.go`, `.rs` | 7 |
| Scripting | `.php`, `.rb`, `.sh`, `.bat` | 4 |
| Config | `.json`, `.yaml`, `.yml`, `.xml`, `.env` | 5 |
| Data | `.sql` | 1 |

**Total: 50+ File Formats Supported**

---

## 🏗️ Architecture

```
LoLA/
├── client_side/                # React + Electron Frontend
│   ├── electron/              # Electron main & preload
│   │   ├── main.cjs          # Main process
│   │   └── preload.cjs       # Context bridge
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatBox.jsx           # Main chat interface
│   │   │   ├── ChatHistory.jsx       # Session management
│   │   │   ├── DocumentManager.jsx   # File uploads
│   │   │   ├── ModelSelector.jsx     # Model switching 🆕
│   │   │   ├── Settings.jsx          # Configuration
│   │   │   ├── Sidebar.jsx           # Navigation
│   │   │   ├── StatusBar.jsx         # Status display
│   │   │   └── Message.jsx           # Chat messages
│   │   ├── services/         # API integration
│   │   │   └── api.js        # Backend communication
│   │   ├── styles/           # CSS with theming
│   │   │   └── app.css       # Main styles
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Entry point
│   ├── dist/                 # Production build
│   ├── release/              # Packaged apps
│   ├── package.json          # Dependencies
│   └── vite.config.js        # Build config
│
├── server_side/               # Python FastAPI Backend
│   ├── storage/              # Data persistence
│   │   ├── chats/           # Chat sessions
│   │   └── knowledge_base.pkl # Vector store
│   ├── uploads/              # User documents
│   ├── main.py               # FastAPI server
│   ├── rag_engine.py         # RAG implementation
│   ├── config.py             # Configuration
│   ├── schemas.py            # Pydantic models
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── app.bat                    # Windows launcher
├── start.sh                   # Linux/Mac launcher
├── LICENSE                    # Apache 2.0
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

**Required Software:**
- [Python 3.8+](https://www.python.org/downloads/) - Backend runtime
- [Node.js 16+](https://nodejs.org/) - Frontend build tool
- [Ollama](https://ollama.com/) - LLM runtime engine

**Required Models:**
```bash
# Install core models
ollama pull ministral-3        # Main LLM with vision
ollama pull nomic-embed-text   # Embeddings

# Optional models for specific tasks
ollama pull llava              # Alternative vision model
ollama pull codellama          # Code-specialized model
ollama pull llama3             # Fast general-purpose model
```

**Verify Installation:**
```bash
python --version   # Should show 3.8+
node --version     # Should show 16+
ollama list        # Should show installed models
```

### One-Click Launch 🎯

**Windows:**
```bash
git clone https://github.com/24kr/Local_App_RAG-Technique.git
cd Local_App_RAG-Technique
app.bat
```

**Linux/macOS:**
```bash
git clone https://github.com/24kr/Local_App_RAG-Technique.git
cd Local_App_RAG-Technique
chmod +x start.sh
./start.sh
```

The launcher will:
1. ✅ Check dependencies
2. ✅ Set up virtual environment
3. ✅ Install packages
4. ✅ Start backend server
5. ✅ Launch Electron app

---

## 📥 Installation

### Option 1: Automated Setup (Recommended)

Use the provided launch scripts (see [Quick Start](#-quick-start)).

### Option 2: Manual Installation

**Backend Setup:**
```bash
cd server_side

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd client_side

# Install dependencies
npm install

# Development mode (web)
npm run dev

# Development mode (desktop)
npm run electron:dev
```

---

## 📱 Desktop Application

### Development Mode
```bash
cd client_side
npm run electron:dev
```
Launches Vite dev server + Electron with hot-reload + backend auto-start.

### Production Build

**Build for Current Platform:**
```bash
npm run electron:build
```

**Platform-Specific Builds:**
```bash
npm run electron:build:win     # Windows (NSIS + Portable)
npm run electron:build:mac     # macOS (DMG + ZIP)
npm run electron:build:linux   # Linux (AppImage + DEB + RPM)
npm run electron:build:all     # All platforms
```

**Output:** `client_side/release/`
- Windows: `RAG-Assistant-1.0.24-win-x64.exe`, `.zip`
- macOS: `RAG-Assistant-1.0.24-mac-x64.dmg`, `.zip`
- Linux: `RAG-Assistant-1.0.24-linux-x64.AppImage`, `.deb`, `.rpm`

---

## 💡 Usage Guide

### Getting Started

1. **Start Ollama:** 
   ```bash
   ollama serve
   ```

2. **Launch LoLA:**
   - Run `app.bat` (Windows) or `./start.sh` (Linux/Mac)
   - Or use `npm run electron:dev` for development

3. **Check Status:**
   - Green "Server: Connected" in status bar = Ready! ✅

### Core Workflows

#### **📚 Document Upload**
1. Navigate to **Documents** tab
2. Click **"Choose a file"** or drag & drop
3. Select file (max 50MB)
4. Click **"📤 Upload Document"**
5. Wait for processing (chunks created)
6. Document appears in library

**Supported:** PDF, DOCX, TXT, CSV, XLSX, Images, Code files

#### **💬 Chat with Documents**
1. Navigate to **Chat** tab
2. Ensure **RAG Enabled** (toggle in sidebar)
3. Type your question about uploaded documents
4. Press **Enter** or click **➤ Send**
5. AI responds using document context

**Tips:**
- Ask specific questions about document content
- Reference filenames: "What's in FSI-2023.xlsx?"
- Use vision models for image questions

#### **🤖 Switch Models** 🆕
1. Click **🤖 Model Dropdown** in chat header
2. Browse available models with capabilities:
   - 👁️ Vision - Can analyze images
   - 💻 Coding - Optimized for code
   - 💬 Chat - General conversation
3. Click model to switch instantly
4. Current model shown with ✓ checkmark

**Model Recommendations:**
- **ministral-3** - Best for images + general chat
- **llava** - Specialized image analysis
- **codellama** - Superior code generation
- **llama3** - Fast, lightweight responses

#### **👁️ Image Analysis** 🆕
1. Upload an image (PNG, JPG, etc.)
2. Switch to vision model (ministral-3 or llava)
3. Ask: "What's in the image?", "Describe this picture"
4. AI analyzes and describes content

#### **💾 Manage Chat Sessions**
1. Click **💬 Chats** to view history
2. Click session to load
3. Click **➕ New** for fresh conversation
4. Click **🗑️** on session to delete
5. Click **📥 Export** to save as text

#### **⚙️ Settings & Configuration**
1. Navigate to **Settings** tab
2. Toggle **Dark Mode** for theme
3. Toggle **RAG Mode** for document context
4. View **Available Models** with capabilities
5. Check **System Status** (health, version)
6. Manage **Data** (save KB, clear all)

---

## ⚙️ Configuration

### Environment Variables

Edit `server_side/.env`:

```bash
# Application
APP_NAME=LoLA
DEBUG=False

# Server
HOST=0.0.0.0
PORT=8000

# Models
LLM_MODEL=ministral-3              # Default chat model
EMBEDDING_MODEL=nomic-embed-text   # Embedding model

# RAG Configuration
CHUNK_SIZE=500          # Text chunk size in words
CHUNK_OVERLAP=50        # Overlap between chunks
TOP_K_RESULTS=3         # Number of chunks to retrieve
MIN_SIMILARITY=0.3      # Minimum similarity threshold

# File Upload
MAX_FILE_SIZE_MB=50     # Maximum file size

# Logging
LOG_LEVEL=INFO          # DEBUG, INFO, WARNING, ERROR
```

### Advanced Configuration

Edit `server_side/config.py` for:
- Allowed file extensions
- Storage paths
- CORS origins
- Custom model settings

### Model Management

**List Installed Models:**
```bash
ollama list
```

**Install New Model:**
```bash
ollama pull <model-name>
```

**Remove Model:**
```bash
ollama rm <model-name>
```

**Popular Models:**
- `ministral-3` - 6GB, Vision + Chat
- `llama3` - 4.7GB, Fast general-purpose
- `codellama` - 3.8GB, Code specialist
- `llava` - 4.5GB, Vision specialist
- `mistral` - 4.1GB, High quality
- `phi` - 1.6GB, Lightweight

---

## 🔌 API Reference

### Base URL
```
http://localhost:8000
```

### Interactive Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Endpoints

#### **Health & Status**
```http
GET /health
GET /
GET /kb/stats
```

#### **Chat**
```http
POST /chat
Body: {
  "message": "string",
  "use_rag": true,
  "top_k": 3,
  "model": "ministral-3"  // Optional
}
```

#### **Models** 🆕
```http
GET  /models/list       # List available models
POST /models/switch     # Switch active model
GET  /models/current    # Get current model
```

#### **Documents**
```http
POST   /upload                # Upload file
GET    /documents             # List all documents
DELETE /documents/delete      # Delete document
POST   /documents/clear       # Clear all documents
```

#### **Knowledge Base**
```http
POST /kb/save      # Save to disk
POST /kb/load      # Load from disk
```

#### **Chat History**
```http
GET    /chats/list              # List sessions
POST   /chats/save              # Save session
GET    /chats/load/{id}         # Load session
DELETE /chats/delete/{id}       # Delete session
POST   /chats/clear             # Clear all sessions
POST   /chats/export/{id}       # Export as text
```

---

## 🐛 Troubleshooting

### Common Issues

**❌ "Failed to connect to backend"**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Restart backend
cd server_side
python -m uvicorn main:app --reload
```

**❌ "Ollama not responding"**
```bash
# Start Ollama service
ollama serve

# Verify models
ollama list

# Re-pull if needed
ollama pull ministral-3
```

**❌ "Model not found"**
```bash
# Check available models in app
Settings → Available Models → Refresh

# Install missing model
ollama pull <model-name>
```

**❌ "Image processing failed"**
- Ensure using vision-capable model (ministral-3, llava)
- Check image size (<10MB recommended)
- Verify file format is supported
- Check available system memory

**❌ "Frontend won't start"**
```bash
# Clear cache and reinstall
cd client_side
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**❌ "Port already in use"**
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 8000 (Linux/Mac)
lsof -ti:8000 | xargs kill -9

# Or change port in .env
PORT=8001
```

### Debug Mode

**Enable Backend Logging:**
```bash
# Edit .env
DEBUG=True
LOG_LEVEL=DEBUG
```

**Frontend DevTools:**
- Press `F12` in Electron app
- Check Console for errors
- Network tab for API calls

### Getting Help

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/24kr/Local_App_RAG-Technique/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/24kr/Local_App_RAG-Technique/discussions)
- 📖 **Documentation:** [Wiki](https://github.com/24kr/Local_App_RAG-Technique/wiki)

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2025)
- [ ] Multi-language UI (i18n)
- [ ] Voice input/output
- [ ] In-app document preview
- [ ] Advanced search filters
- [ ] Custom model training
- [ ] Browser extension

### Version 1.2 (Q3 2025)
- [ ] Optional cloud sync
- [ ] Mobile companion app
- [ ] Plugin system
- [ ] Collaborative features
- [ ] API webhooks

### Version 2.0 (Q4 2025)
- [ ] Distributed RAG
- [ ] Multi-modal chat
- [ ] Advanced analytics
- [ ] Enterprise features

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/AmazingFeature`
4. Make your changes
5. Commit: `git commit -m 'Add some AmazingFeature'`
6. Push: `git push origin feature/AmazingFeature`
7. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive
- Ensure all tests pass

### Code of Conduct
Be respectful, inclusive, and professional. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is licensed under the **Apache License 2.0**.

```
Copyright 2024 LoLA Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

See [LICENSE](LICENSE) for full text.

---

## 🙏 Acknowledgments

### Technologies
- **[Ollama](https://ollama.com/)** - Local LLM runtime
- **[Mistral AI](https://mistral.ai/)** - Ministral-3 model
- **[FastAPI](https://fastapi.tiangolo.com/)** - Backend framework
- **[React](https://react.dev/)** - Frontend library
- **[Electron](https://www.electronjs.org/)** - Desktop framework
- **[Vite](https://vitejs.dev/)** - Build tool

### Inspiration
- Retrieval-Augmented Generation research
- Privacy-first AI movement
- Open-source community

### Special Thanks
- All contributors and testers
- Ollama community for model support
- FastAPI and React communities

---

## 📊 Project Stats

- **Lines of Code:** 10,000+
- **Components:** 15+
- **API Endpoints:** 20+
- **Supported Formats:** 50+
- **Models Supported:** 10+
- **Platforms:** 3 (Windows, macOS, Linux)

---

## 🔗 Links

- **Repository:** [github.com/24kr/Local_App_RAG-Technique](https://github.com/24kr/Local_App_RAG-Technique)
- **Issues:** [Report a bug](https://github.com/24kr/Local_App_RAG-Technique/issues)
- **Discussions:** [Join the community](https://github.com/24kr/Local_App_RAG-Technique/discussions)
- **Documentation:** [Full docs](https://github.com/24kr/Local_App_RAG-Technique/wiki)

---

<div align="center">

### 🌟 Star this project if you find it useful!

**Built with ❤️ for Privacy-First AI**

[⬆ Back to Top](#-lola---local-llm-assistant)

</div>