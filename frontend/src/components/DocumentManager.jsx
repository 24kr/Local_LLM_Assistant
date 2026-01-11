import { useState, useRef, useEffect } from "react";
import { listDocuments, deleteDocument, uploadDocument } from "../services/api";

export default function DocumentManager() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total_documents: 0, total_chunks: 0 });
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Load documents on mount
    useEffect(() => {
        loadDocuments();
    }, []);

    async function loadDocuments() {
        setLoading(true);
        setError(null);
        try {
            const data = await listDocuments();
            setDocuments(data.documents || []);
            setStats({
                total_documents: data.total_documents || 0,
                total_chunks: data.total_chunks || 0,
            });
        } catch (err) {
            setError("Failed to load documents");
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload() {
        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError(null);
        setStatus("Uploading...");

        try {
            const result = await uploadDocument(selectedFile);
            setStatus(`✅ Uploaded: ${result.filename} (${result.chunks_created} chunks)`);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // Reload documents
            await loadDocuments();
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setError("Upload failed. Check file size and format.");
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(filename) {
        if (!window.confirm(`Delete "${filename}"?`)) return;

        try {
            await deleteDocument(filename);
            setStatus(`✅ Deleted: ${filename}`);
            await loadDocuments();
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setError(`Failed to delete ${filename}`);
            console.error("Delete error:", err);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                setError("File too large! Maximum size is 50MB");
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    return (
        <div className="document-manager">
            <div className="manager-header">
                <h2>📚 Document Library</h2>
                <button
                    className="btn-secondary btn-sm"
                    onClick={loadDocuments}
                    disabled={loading}
                    title="Refresh"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_documents}</div>
                        <div className="stat-label">Documents</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🧩</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_chunks}</div>
                        <div className="stat-label">Chunks</div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
                <h3>Upload New Document</h3>
                <div className="upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls"
                        className="file-input"
                        id="file-upload"
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className="file-label">
                        <span className="upload-icon">📎</span>
                        <span className="upload-text">
                            {selectedFile ? selectedFile.name : "Choose a file"}
                        </span>
                    </label>

                    {selectedFile && (
                        <div className="file-info">
                            <span className="file-name">📄 {selectedFile.name}</span>
                            <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                            <button
                                className="btn-clear"
                                onClick={() => {
                                    setSelectedFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? "⏳ Uploading..." : "📤 Upload Document"}
                    </button>

                    <p className="upload-hint">
                        Supported: PDF, DOCX, TXT, CSV, XLSX (Max 50MB)
                    </p>
                </div>
            </div>

            {/* Status Messages */}
            {status && (
                <div className="status-message success">
                    {status}
                </div>
            )}

            {error && (
                <div className="status-message error">
                    <span>⚠️ {error}</span>
                    <button className="error-close" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Documents List */}
            <div className="documents-section">
                <h3>Your Documents</h3>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h4>No documents yet</h4>
                        <p>Upload your first document to get started!</p>
                    </div>
                ) : (
                    <div className="documents-list">
                        {documents.map((doc, i) => (
                            <div key={i} className="document-card">
                                <div className="doc-icon">
                                    {doc.filename.endsWith(".pdf") ? "📕" :
                                        doc.filename.endsWith(".docx") ? "📘" :
                                            doc.filename.endsWith(".csv") ? "📊" :
                                                doc.filename.endsWith(".txt") ? "📄" : "📄"}
                                </div>
                                <div className="doc-info">
                                    <div className="doc-name" title={doc.filename}>
                                        {doc.filename}
                                    </div>
                                    <div className="doc-meta">
                                        <span className="doc-chunks">🧩 {doc.chunks} chunks</span>
                                        {doc.upload_date && (
                                            <span className="doc-date">
                                                📅 {new Date(doc.upload_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(doc.filename)}
                                    title="Delete document"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}