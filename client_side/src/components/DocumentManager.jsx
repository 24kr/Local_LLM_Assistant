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
        setStatus("Uploading and processing...");

        try {
            const result = await uploadDocument(selectedFile);
            setStatus(`✅ Uploaded: ${result.filename} (${result.chunks_created} chunks)`);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // Reload documents
            await loadDocuments();
            setTimeout(() => setStatus(""), 5000);
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

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        // Images
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'bmp', 'tif', 'tiff'].includes(ext)) {
            return "🖼️";
        }
        // Documents
        if (['pdf'].includes(ext)) return "📕";
        if (['docx', 'doc'].includes(ext)) return "📘";
        if (['xlsx', 'xls', 'csv'].includes(ext)) return "📊";
        if (['txt', 'md'].includes(ext)) return "📄";
        // Code files
        if (['html', 'css'].includes(ext)) return "🌐";
        if (['js', 'jsx', 'ts', 'tsx', 'json'].includes(ext)) return "⚙️";
        if (['py'].includes(ext)) return "🐍";
        if (['java'].includes(ext)) return "☕";
        if (['cpp', 'c', 'h'].includes(ext)) return "⚡";
        if (['php'].includes(ext)) return "🐘";
        if (['rb'].includes(ext)) return "💎";
        if (['go'].includes(ext)) return "🔷";
        if (['rs'].includes(ext)) return "🦀";
        if (['sh', 'bat'].includes(ext)) return "🖥️";
        if (['yaml', 'yml', 'xml', 'env'].includes(ext)) return "⚙️";
        if (['sql'].includes(ext)) return "🗄️";
        
        return "📄";
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
                        accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.svg,.ico,.gif,.tif,.tiff,.webp,.bmp,.html,.css,.js,.jsx,.json,.cpp,.py,.ts,.tsx,.md,.env,.bat,.sh,.php,.cs,.rb,.java,.go,.rs,.yaml,.yml,.xml,.sql,.c,.h"
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
                            <span className="file-name">{getFileIcon(selectedFile.name)} {selectedFile.name}</span>
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
                        {uploading ? "⏳ Processing..." : "📤 Upload Document"}
                    </button>

                    <p className="upload-hint">
                        <strong>Supported formats:</strong><br/>
                        📄 Documents: PDF, DOCX, TXT, CSV, XLSX<br/>
                        🖼️ Images: PNG, JPG, SVG, GIF, WebP<br/>
                        💻 Code: JS, PY, HTML, CSS, JSON, MD, etc.<br/>
                        <em>Max size: 50MB</em>
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
                        <div className="empty-icon">🔭</div>
                        <h4>No documents yet</h4>
                        <p>Upload your first document to get started!</p>
                    </div>
                ) : (
                    <div className="documents-list">
                        {documents.map((doc, i) => (
                            <div key={i} className="document-card">
                                <div className="doc-icon">
                                    {getFileIcon(doc.filename)}
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