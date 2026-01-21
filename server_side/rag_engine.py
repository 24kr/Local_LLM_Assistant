import ollama
import numpy as np
from pathlib import Path
import PyPDF2
from docx import Document
import pandas as pd
from typing import List, Dict, Tuple, Optional
import pickle
import logging
from datetime import datetime
import hashlib
import base64

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================
# Vector Store
# =========================

class SimpleVectorStore:
    """Enhanced in-memory vector store with deduplication"""

    def __init__(self):
        self.documents: List[str] = []
        self.embeddings: List[np.ndarray] = []
        self.metadatas: List[Dict] = []
        self.ids: List[str] = []
        self.document_hashes: set = set()

    def _compute_hash(self, text: str) -> str:
        """Compute hash for deduplication"""
        return hashlib.md5(text.encode()).hexdigest()

    def add(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict]
    ):
        """Add documents with deduplication"""
        for id_, emb, doc, meta in zip(ids, embeddings, documents, metadatas):
            doc_hash = self._compute_hash(doc)
            
            # Skip if duplicate
            if doc_hash in self.document_hashes:
                logger.debug(f"Skipping duplicate document: {id_}")
                continue
            
            self.ids.append(id_)
            self.embeddings.append(np.array(emb, dtype=np.float32))
            self.documents.append(doc)
            self.metadatas.append(meta)
            self.document_hashes.add(doc_hash)

    @staticmethod
    def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return float(np.dot(a, b) / (norm_a * norm_b))

    def query(
        self,
        query_embedding: List[float],
        n_results: int = 3
    ) -> Dict:
        """Query vector store for similar documents"""
        if not self.embeddings:
            return {
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]],
                "ids": [[]]
            }

        query_vec = np.array(query_embedding, dtype=np.float32)
        # Calculate similarity with every stored embedding
        similarities = [
            self.cosine_similarity(query_vec, emb)
            for emb in self.embeddings
        ]

        top_indices = np.argsort(similarities)[-n_results:][::-1]

        return {
            "documents": [[self.documents[i] for i in top_indices]],
            "metadatas": [[self.metadatas[i] for i in top_indices]],
            "distances": [[1 - similarities[i] for i in top_indices]],
            "ids": [[self.ids[i] for i in top_indices]]
        }

    def get(self) -> Dict:
        """Get all documents"""
        return {
            "ids": self.ids,
            "documents": self.documents,
            "metadatas": self.metadatas
        }

    def delete_by_source(self, source: str) -> int:
        """Delete all documents from a specific source"""
        indices_to_remove = []
        
        for i, meta in enumerate(self.metadatas):
            if meta.get("source") == source:
                indices_to_remove.append(i)
        
        # Remove in reverse order to maintain indices
        for i in sorted(indices_to_remove, reverse=True):
            doc_hash = self._compute_hash(self.documents[i])
            self.document_hashes.discard(doc_hash)
            
            del self.ids[i]
            del self.embeddings[i]
            del self.documents[i]
            del self.metadatas[i]
        
        logger.info(f"Removed {len(indices_to_remove)} chunks from {source}")
        return len(indices_to_remove)

    def clear(self):
        """Clear all data"""
        self.documents.clear()
        self.embeddings.clear()
        self.metadatas.clear()
        self.ids.clear()
        self.document_hashes.clear()

    def save(self, filepath: str):
        """Save vector store to disk"""
        try:
            data = {
                "ids": self.ids,
                "embeddings": [emb.tolist() for emb in self.embeddings],
                "documents": self.documents,
                "metadatas": self.metadatas,
                "document_hashes": list(self.document_hashes)
            }
            with open(filepath, "wb") as f:
                pickle.dump(data, f)
            logger.info(f"Saved vector store to {filepath}")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}")
            raise

    def load(self, filepath: str):
        """Load vector store from disk"""
        try:
            with open(filepath, "rb") as f:
                data = pickle.load(f)

            self.ids = data["ids"]
            self.embeddings = [np.array(e, dtype=np.float32) for e in data["embeddings"]]
            self.documents = data["documents"]
            self.metadatas = data["metadatas"]
            self.document_hashes = set(data.get("document_hashes", []))
            
            logger.info(f"Loaded vector store from {filepath}")
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            raise


# =========================
# Document Processing
# =========================

class DocumentProcessor:
    """Extract text from supported document formats"""

    @staticmethod
    def read_txt(path: str) -> str:
        """Read plain text file"""
        try:
            return Path(path).read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error reading TXT file {path}: {e}")
            raise

    @staticmethod
    def read_pdf(path: str) -> str:
        """Extract text from PDF"""
        try:
            text = ""
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    text += page_text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading PDF file {path}: {e}")
            raise

    @staticmethod
    def read_docx(path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = Document(path)
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            return text
        except Exception as e:
            logger.error(f"Error reading DOCX file {path}: {e}")
            raise

    @staticmethod
    def read_excel(path: str) -> str:
        """Convert Excel to text"""
        try:
            # Try reading with openpyxl (for .xlsx)
            try:
                df = pd.read_excel(path, engine='openpyxl')
            except ImportError:
                # Try xlrd for older .xls files
                try:
                    df = pd.read_excel(path, engine='xlrd')
                except ImportError:
                    raise ImportError(
                        "Missing Excel dependencies. Install with: "
                        "pip install openpyxl xlrd"
                    )
            return df.to_string(index=False)
        except Exception as e:
            logger.error(f"Error reading Excel file {path}: {e}")
            raise

    @staticmethod
    def read_csv(path: str) -> str:
        """Convert CSV to text"""
        try:
            # Try UTF-8 first
            try:
                df = pd.read_csv(path, encoding="utf-8")
            except UnicodeDecodeError:
                # Fallback to latin-1 if UTF-8 fails
                df = pd.read_csv(path, encoding="latin-1")
            return df.to_string(index=False)
        except Exception as e:
            logger.error(f"Error reading CSV file {path}: {e}")
            raise

    @staticmethod
    def read_image(path: str) -> str:
        """Extract text from image using Ollama vision - Lightweight version"""
        try:
            filename = Path(path).name
            file_size = Path(path).stat().st_size / (1024 * 1024)  # Size in MB
            
            logger.info(f"Processing image: {filename} ({file_size:.2f} MB)")
            
            # For now, just store image metadata and path
            # Actual vision processing will happen during chat when user asks about it
            result = f"""Image File: {filename}
Type: Image
Size: {file_size:.2f} MB
Path: {path}
Description: This is an image file that can be analyzed using vision-capable models (ministral-3, llava).
To view its contents, ask about this specific image."""
            
            logger.info(f"Stored image metadata: {filename}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing image {path}: {e}")
            return f"Image: {Path(path).name}\n[Error: {str(e)}]"

    @staticmethod
    def read_code(path: str) -> str:
        """Read programming/code files"""
        try:
            content = Path(path).read_text(encoding="utf-8", errors="ignore")
            filename = Path(path).name
            ext = Path(path).suffix
            
            # Add metadata header
            header = f"File: {filename}\nType: {ext} file\n\n"
            return header + content
        except Exception as e:
            logger.error(f"Error reading code file {path}: {e}")
            raise

    @classmethod
    def process(cls, path: str) -> str:
        """Process document and extract text"""
        if not Path(path).exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        ext = Path(path).suffix.lower()

        # Image extensions
        image_exts = {".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", ".tif", ".tiff", ".webp", ".bmp"}
        
        # Code/text extensions
        code_exts = {
            ".html", ".css", ".js", ".jsx", ".json", ".cpp", ".py", ".ts", ".tsx",
            ".md", ".env", ".bat", ".sh", ".php", ".cs", ".rb", ".java", ".go",
            ".rs", ".yaml", ".yml", ".xml", ".sql", ".c", ".h"
        }

        handlers = {
            ".txt": cls.read_txt,
            ".pdf": cls.read_pdf,
            ".docx": cls.read_docx,
            ".doc": cls.read_docx,
            ".xlsx": cls.read_excel,
            ".xls": cls.read_excel,
            ".csv": cls.read_csv
        }
        
        # Add image handler for all image types
        for img_ext in image_exts:
            handlers[img_ext] = cls.read_image
        
        # Add code handler for all code types
        for code_ext in code_exts:
            handlers[code_ext] = cls.read_code

        if ext not in handlers:
            raise ValueError(f"Unsupported file type: {ext}")

        logger.info(f"Processing {ext} file: {path}")
        return handlers[ext](path)


# =========================
# RAG Engine
# =========================

class RAGChatbot:
    """Enhanced RAG chatbot with error handling and features"""

    def __init__(
        self,
        model: str = "ministral-3",
        embedding_model: str = "nomic-embed-text"
    ):
        self.model = model
        self.embedding_model = embedding_model
        self.vector_store = SimpleVectorStore()
        self.processor = DocumentProcessor()
        
        # Verify Ollama connection
        try:
            ollama.list()
            logger.info("Connected to Ollama successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")
            raise

    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 500,
        overlap: int = 50
    ) -> List[str]:
        """Split text into overlapping chunks"""
        if not text.strip():
            return []
        
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)

        logger.debug(f"Created {len(chunks)} chunks from text")
        return chunks

    def add_document(
        self,
        file_path: str,
        metadata: Optional[Dict] = None
    ) -> Tuple[bool, int]:
        """Add document to knowledge base"""
        try:
            # Process document
            text = self.processor.process(file_path)
            
            if not text.strip():
                logger.warning(f"No text extracted from {file_path}")
                return False, 0
            
            # Create chunks
            chunks = self.chunk_text(text)
            
            if not chunks:
                logger.warning(f"No chunks created from {file_path}")
                return False, 0
            
            # Generate embeddings and add to vector store
            filename = Path(file_path).name
            
            for i, chunk in enumerate(chunks):
                try:
                    # Get embedding from Ollama
                    emb_response = ollama.embeddings(
                        model=self.embedding_model,
                        prompt=chunk
                    )
                    
                    embedding = emb_response["embedding"]
                    
                    # Prepare metadata
                    chunk_metadata = {
                        "source": file_path,
                        "filename": filename,
                        "chunk": i,
                        "upload_date": datetime.now().isoformat(),
                        "file_type": Path(file_path).suffix,
                        **(metadata or {})
                    }
                    
                    # Add to vector store
                    self.vector_store.add(
                        ids=[f"{Path(file_path).stem}_{i}"],
                        embeddings=[embedding],
                        documents=[chunk],
                        metadatas=[chunk_metadata]
                    )
                    
                except Exception as e:
                    logger.error(f"Error processing chunk {i} of {file_path}: {e}")
                    continue
            
            logger.info(f"Added {len(chunks)} chunks from {file_path}")
            return True, len(chunks)
            
        except Exception as e:
            logger.error(f"Error adding document {file_path}: {e}")
            return False, 0

    def delete_document(self, filename: str) -> int:
        """Delete all chunks from a document"""
        # Find matching source paths
        sources = [meta["source"] for meta in self.vector_store.metadatas 
                   if Path(meta["source"]).name == filename]
        
        if not sources:
            logger.warning(f"No document found with filename: {filename}")
            return 0
        
        total_removed = 0
        for source in set(sources):
            removed = self.vector_store.delete_by_source(source)
            total_removed += removed
        
        return total_removed

    def retrieve_context(
        self,
        query: str,
        n_results: int = 3,
        min_similarity: float = 0.3
    ) -> Tuple[str, List[str]]:
        """Retrieve relevant context for query"""
        try:
            # Get query embedding
            query_emb_response = ollama.embeddings(
                model=self.embedding_model,
                prompt=query
            )
            query_emb = query_emb_response["embedding"]
            
            # Query vector store
            results = self.vector_store.query(query_emb, n_results)
            
            docs, sources = [], []
            
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            ):
                similarity = 1 - dist
                if similarity >= min_similarity:
                    docs.append(doc)
                    sources.append(meta.get("filename", meta.get("source", "Unknown")))
            
            context = "\n\n".join(docs)
            unique_sources = list(set(sources))
            
            logger.debug(f"Retrieved {len(docs)} relevant chunks from {len(unique_sources)} sources")
            return context, unique_sources
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return "", []

    def chat(
        self,
        message: str,
        use_rag: bool = True,
        top_k: int = 3
    ) -> Dict:
        """Generate response to user message"""
        try:
            context = ""
            sources = []

            if use_rag and len(self.vector_store.documents) > 0:
                context, sources = self.retrieve_context(message, n_results=top_k)

            # Prepare messages
            if context:
                messages = [
                    {
                        "role": "system",
                        "content": f"""You are a helpful AI assistant. Use the following context to answer the user's question accurately.

If the context doesn't contain relevant information, politely say so and provide a general response if possible.

Context:
{context}
"""
                    },
                    {"role": "user", "content": message}
                ]
            else:
                messages = [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant. Answer the user's question to the best of your ability."
                    },
                    {"role": "user", "content": message}
                ]

            # Get response from Ollama
            response = ollama.chat(
                model=self.model,
                messages=messages
            )

            answer = response["message"]["content"]

            return {
                "answer": answer,
                "sources": sources,
                "context_used": bool(context)
            }
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {
                "answer": f"Sorry, I encountered an error: {str(e)}",
                "sources": [],
                "context_used": False
            }

    # ===== Persistence =====

    def save_knowledge_base(self, path: str):
        """Save knowledge base to disk"""
        try:
            self.vector_store.save(path)
        except Exception as e:
            logger.error(f"Error saving knowledge base: {e}")
            raise

    def load_knowledge_base(self, path: str):
        """Load knowledge base from disk"""
        try:
            if Path(path).exists():
                self.vector_store.load(path)
            else:
                logger.warning(f"Knowledge base file not found: {path}")
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            raise

    def clear_knowledge_base(self):
        """Clear all documents from knowledge base"""
        self.vector_store.clear()
        logger.info("Knowledge base cleared")

    def get_stats(self) -> Dict:
        """Get statistics about the knowledge base"""
        documents = {}
        for meta in self.vector_store.metadatas:
            filename = meta.get("filename", "Unknown")
            documents[filename] = documents.get(filename, 0) + 1
        
        return {
            "total_chunks": len(self.vector_store.documents),
            "total_documents": len(documents),
            "documents": documents
        }