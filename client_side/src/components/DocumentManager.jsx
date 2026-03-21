import { useState, useRef, useEffect } from "react";
import {
    listDocuments,
    deleteDocument,
    uploadDocument,
    listChatAttachments,
    deleteChatAttachment,
    API_URL,
} from "../services/api";
import { getAllChats, removeAttachmentReferences } from "../utils/chatStorage";
import { formatFileSize, getFileIcon } from "../utils/fileTypes";

export default function DocumentManager() {
    const [documents, setDocuments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total_documents: 0, total_chunks: 0, total_attachments: 0 });
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
            const [documentData, attachmentData] = await Promise.all([
                listDocuments(),
                listChatAttachments(),
            ]);

            setDocuments(documentData.documents || []);
            setAttachments(attachmentData.attachments || []);
            setStats({
                total_documents: documentData.total_documents || 0,
                total_chunks: documentData.total_chunks || 0,
                total_attachments: attachmentData.total_attachments || 0,
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

    function getChatLabel(chatId) {
        if (!chatId) {
            return "Unassigned chat";
        }

        const chat = getAllChats().find((item) => item.id === chatId);
        return chat?.title || chatId;
    }

    async function handleDeleteAttachment(attachment) {
        if (!window.confirm(`Delete attachment "${attachment.filename}" from all chats?`)) return;

        try {
            await deleteChatAttachment(attachment.id);
            removeAttachmentReferences([attachment.id]);
            setStatus(`✅ Deleted attachment: ${attachment.filename}`);
            await loadDocuments();
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setError(`Failed to delete attachment ${attachment.filename}`);
            console.error("Attachment delete error:", err);
        }
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
                <div className="stat-card">
                    <div className="stat-icon">📎</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_attachments}</div>
                        <div className="stat-label">Chat Attachments</div>
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

            <div className="documents-section attachment-section">
                <h3>Chat Attachments</h3>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading attachments...</p>
                    </div>
                ) : attachments.length === 0 ? (
                    <div className="empty-state compact-empty-state">
                        <div className="empty-icon">📎</div>
                        <h4>No chat attachments yet</h4>
                        <p>Attach files in a chat to manage them here.</p>
                    </div>
                ) : (
                    <div className="documents-list">
                        {attachments.map((attachment) => (
                            <div key={attachment.id} className="document-card">
                                <div className="doc-icon">
                                    {getFileIcon(attachment.filename)}
                                </div>
                                <div className="doc-info">
                                    <div className="doc-name" title={attachment.filename}>
                                        {attachment.filename}
                                    </div>
                                    <div className="doc-meta attachment-meta">
                                        <span className="doc-chunks">💾 {formatFileSize(attachment.size)}</span>
                                        <span className="doc-date">💬 {getChatLabel(attachment.chat_id)}</span>
                                        <span className="doc-date">📅 {new Date(attachment.upload_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <a
                                    className="btn-secondary btn-sm attachment-open-btn"
                                    href={`${API_URL}/attachments/${attachment.id}/file`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open attachment"
                                >
                                    Open
                                </a>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteAttachment(attachment)}
                                    title="Delete attachment"
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