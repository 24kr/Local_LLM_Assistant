import { useState, useEffect } from "react";
import { getHealth, getStats, saveKnowledgeBase, clearAllDocuments } from "../services/api";

export default function Settings({ darkMode, toggleDarkMode, useRag, setUseRag }) {
    const [health, setHealth] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        loadHealthAndStats();
    }, []);

    async function loadHealthAndStats() {
        setLoading(true);
        try {
            const [healthData, statsData] = await Promise.all([
                getHealth(),
                getStats()
            ]);
            setHealth(healthData);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to load settings data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveKB() {
        setStatus("Saving knowledge base...");
        try {
            await saveKnowledgeBase();
            setStatus("✅ Knowledge base saved successfully!");
            setTimeout(() => setStatus(""), 3000);
        } catch {
            setStatus("❌ Failed to save knowledge base");
        }
    }

    async function handleClearAll() {
        if (!window.confirm("⚠️ This will delete ALL documents from the knowledge base. Continue?")) {
            return;
        }

        if (!window.confirm("Are you absolutely sure? This cannot be undone!")) {
            return;
        }

        setStatus("Clearing all documents...");
        try {
            await clearAllDocuments();
            setStatus("✅ All documents cleared!");
            await loadHealthAndStats();
            setTimeout(() => setStatus(""), 3000);
        } catch {
            setStatus("❌ Failed to clear documents");
        }
    }

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>⚙️ Settings</h2>
            </div>

            {/* Appearance Settings */}
            <div className="settings-section">
                <h3>🎨 Appearance</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Dark Mode</div>
                        <div className="setting-description">
                            Switch between light and dark themes
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* RAG Settings */}
            <div className="settings-section">
                <h3>🧠 AI Behavior</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">RAG Mode</div>
                        <div className="setting-description">
                            Use uploaded documents to provide context for answers
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={useRag}
                            onChange={() => setUseRag(!useRag)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* System Information */}
            <div className="settings-section">
                <h3>📊 System Status</h3>
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading system info...</p>
                    </div>
                ) : (
                    <>
                        {health && (
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Status</span>
                                    <span className={`info-value ${health.status === "healthy" ? "success" : "error"}`}>
                                        {health.status === "healthy" ? "✅ Healthy" : "❌ Error"}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Version</span>
                                    <span className="info-value">{health.version}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">LLM Model</span>
                                    <span className="info-value">{health.models?.llm || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Embedding Model</span>
                                    <span className="info-value">{health.models?.embedding || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Vector Store Size</span>
                                    <span className="info-value">{health.vector_store_size} chunks</span>
                                </div>
                            </div>
                        )}

                        {stats && stats.stats && (
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <div className="stat-number">{stats.stats.total_documents}</div>
                                    <div className="stat-text">Documents</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-number">{stats.stats.total_chunks}</div>
                                    <div className="stat-text">Total Chunks</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <button
                    className="btn-secondary"
                    onClick={loadHealthAndStats}
                    disabled={loading}
                >
                    🔄 Refresh Status
                </button>
            </div>

            {/* Data Management */}
            <div className="settings-section">
                <h3>💾 Data Management</h3>
                <div className="action-buttons">
                    <button
                        className="btn-primary"
                        onClick={handleSaveKB}
                    >
                        💾 Save Knowledge Base
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handleClearAll}
                    >
                        🗑️ Clear All Documents
                    </button>
                </div>
                <p className="warning-text">
                    ⚠️ Clearing all documents will permanently delete all uploaded files from the knowledge base.
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className={`status-banner ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : ""}`}>
                    {status}
                </div>
            )}

            {/* About Section */}
            <div className="settings-section about-section">
                <h3>ℹ️ About</h3>
                <div className="about-content">
                    <p><strong>RAG Assistant</strong></p>
                    <p>A privacy-focused, offline AI chatbot using Retrieval-Augmented Generation.</p>
                    <div className="features-list">
                        <div className="feature-badge">🔒 100% Private</div>
                        <div className="feature-badge">💾 Offline First</div>
                        <div className="feature-badge">⚡ Fast & Local</div>
                        <div className="feature-badge">📚 Document RAG</div>
                    </div>
                    <div className="tech-stack">
                        <p className="tech-label">Powered by:</p>
                        <p className="tech-items">Ollama • FastAPI • React</p>
                    </div>
                </div>
            </div>
        </div>
    );
}