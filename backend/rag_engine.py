import ollama
import numpy as np
from pathlib import Path
import PyPDF2
from docx import Document
import pandas as pd
from typing import List, Dict, Tuple
import pickle
import re

# =========================
# Vector Store
# =========================

class SimpleVectorStore:
    """Simple in-memory vector store using cosine similarity"""

    def __init__(self):
        self.documents: List[str] = []
        self.embeddings: List[np.ndarray] = []
        self.metadatas: List[Dict] = []
        self.ids: List[str] = []

    def add(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict]
    ):
        for id_, emb, doc, meta in zip(ids, embeddings, documents, metadatas):
            self.ids.append(id_)
            self.embeddings.append(np.array(emb, dtype=np.float32))
            self.documents.append(doc)
            self.metadatas.append(meta)

    @staticmethod
    def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def query(
        self,
        query_embedding: List[float],
        n_results: int = 3
    ) -> Dict:
        if not self.embeddings:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        query_vec = np.array(query_embedding, dtype=np.float32)

        similarities = [
            self.cosine_similarity(query_vec, emb)
            for emb in self.embeddings
        ]

        top_indices = np.argsort(similarities)[-n_results:][::-1]

        return {
            "documents": [[self.documents[i] for i in top_indices]],
            "metadatas": [[self.metadatas[i] for i in top_indices]],
            "distances": [[1 - similarities[i] for i in top_indices]]
        }

    def get(self) -> Dict:
        return {
            "ids": self.ids,
            "documents": self.documents,
            "metadatas": self.metadatas
        }

    def clear(self):
        self.documents.clear()
        self.embeddings.clear()
        self.metadatas.clear()
        self.ids.clear()

    def save(self, filepath: str):
        data = {
            "ids": self.ids,
            "embeddings": [emb.tolist() for emb in self.embeddings],
            "documents": self.documents,
            "metadatas": self.metadatas
        }
        with open(filepath, "wb") as f:
            pickle.dump(data, f)

    def load(self, filepath: str):
        with open(filepath, "rb") as f:
            data = pickle.load(f)

        self.ids = data["ids"]
        self.embeddings = [np.array(e, dtype=np.float32) for e in data["embeddings"]]
        self.documents = data["documents"]
        self.metadatas = data["metadatas"]


# =========================
# Document Processing
# =========================

class DocumentProcessor:
    """Extract text from supported document formats"""

    @staticmethod
    def read_txt(path: str) -> str:
        return Path(path).read_text(encoding="utf-8", errors="ignore")

    @staticmethod
    def read_pdf(path: str) -> str:
        text = ""
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
        return text

    @staticmethod
    def read_docx(path: str) -> str:
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)

    @staticmethod
    def read_excel(path: str) -> str:
        df = pd.read_excel(path)
        return df.to_string()

    @staticmethod
    def read_csv(path: str) -> str:
        df = pd.read_csv(path)
        return df.to_string()

    @classmethod
    def process(cls, path: str) -> str:
        ext = Path(path).suffix.lower()

        handlers = {
            ".txt": cls.read_txt,
            ".pdf": cls.read_pdf,
            ".docx": cls.read_docx,
            ".doc": cls.read_docx,
            ".xlsx": cls.read_excel,
            ".xls": cls.read_excel,
            ".csv": cls.read_csv
        }

        if ext not in handlers:
            raise ValueError(f"Unsupported file type: {ext}")

        return handlers[ext](path)


# =========================
# RAG Engine
# =========================

class RAGChatbot:
    """Offline RAG-powered chatbot using Ollama"""

    def __init__(
        self,
        model: str = "ministral-3",
        embedding_model: str = "nomic-embed-text"
    ):
        self.model = model
        self.embedding_model = embedding_model
        self.vector_store = SimpleVectorStore()
        self.processor = DocumentProcessor()

    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 500,
        overlap: int = 50
    ) -> List[str]:
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)

        return chunks

    def add_document(self, file_path: str, metadata: Dict = None) -> bool:
        text = self.processor.process(file_path)
        chunks = self.chunk_text(text)

        for i, chunk in enumerate(chunks):
            emb = ollama.embeddings(
                model=self.embedding_model,
                prompt=chunk
            )["embedding"]

            self.vector_store.add(
                ids=[f"{Path(file_path).stem}_{i}"],
                embeddings=[emb],
                documents=[chunk],
                metadatas=[{
                    "source": file_path,
                    "chunk": i,
                    **(metadata or {})
                }]
            )

        return True

    def retrieve_context(
        self,
        query: str,
        n_results: int = 3,
        min_similarity: float = 0.3
    ) -> Tuple[str, List[str]]:

        query_emb = ollama.embeddings(
            model=self.embedding_model,
            prompt=query
        )["embedding"]

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
                sources.append(meta["source"])

        return "\n\n".join(docs), list(set(sources))

    def chat(self, message: str, use_rag: bool = True):
        context = ""
        sources = []

        if use_rag:
            context, sources = self.retrieve_context(message)

        if context:
            messages = [
            {
                "role": "system",
                "content": f"""
You are a helpful assistant.
Use the following context to answer the user's question.
If the context is not relevant, say so.

Context:
{context}
"""
            },
            {"role": "user", "content": message}
        ]
        else:
            messages = [{"role": "user", "content": message}]

        response = ollama.chat(
            model=self.model,
            messages=messages
    )

        answer = response["message"]["content"]

        return {
            "answer": answer,
            "sources": list(set(sources))
       }


    # ===== Persistence =====

    def save_knowledge_base(self, path: str):
        self.vector_store.save(path)

    def load_knowledge_base(self, path: str):
        if Path(path).exists():
            self.vector_store.load(path)

    def clear_knowledge_base(self):
        self.vector_store.clear()

    def compress_context(self, context: str, question: str) -> str:
        prompt = f"""
You are an assistant that extracts only the most relevant information.

Context:
{context}

Question:
{question}

Extract ONLY the information relevant to answering the question.
"""
        response = ollama.chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response["message"]["content"]
