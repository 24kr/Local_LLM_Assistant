import { useState, useEffect } from "react";
import {
    getHealth,
    getStats,
    saveKnowledgeBase,
    clearAllDocuments,
    listModels,
    switchEmbeddingModel,
    getCurrentModel,
} from "../services/api";
import {
    AlertIcon,
    BotIcon,
    BrainIcon,
    CheckCircleIcon,
    DatabaseIcon,
    InfoIcon,
    LibraryIcon,
    LockIcon,
    ModelCapabilityIcon,
    PaletteIcon,
    RefreshIcon,
    SaveIcon,
    SettingsIcon,
    TrashIcon,
    BoltIcon,
    getCapabilityBadgeMeta,
} from "./AppIcons";
import { createStatus } from "../utils/modelStatus";

export default function Settings({ darkMode, toggleDarkMode, useRag, setUseRag }) {
    const [health, setHealth] = useState(null);
    const [stats, setStats] = useState(null);
    const [models, setModels] = useState([]);
    const [currentEmbeddingModel, setCurrentEmbeddingModel] = useState("");
    const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState("");
    const [loading, setLoading] = useState(false);
    const [embeddingLoading, setEmbeddingLoading] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        loadHealthAndStats();
        loadModels();
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

    async function loadModels() {
        try {
            const [data, current] = await Promise.all([
                listModels(),
                getCurrentModel(),
            ]);
            setModels(data.models || []);
            setCurrentEmbeddingModel(current.embedding_model || "");
            setSelectedEmbeddingModel(current.embedding_model || "");
        } catch (err) {
            console.error("Failed to load models:", err);
        }
    }

    async function handleEmbeddingSwitch() {
        if (!selectedEmbeddingModel || selectedEmbeddingModel === currentEmbeddingModel) {
            return;
        }

        setEmbeddingLoading(true);
        setStatus(createStatus("Switching embedding model...", "info"));

        try {
            await switchEmbeddingModel(selectedEmbeddingModel);
            setCurrentEmbeddingModel(selectedEmbeddingModel);
            await loadHealthAndStats();
            await loadModels();
            setStatus(createStatus(`Switched embedding model to ${selectedEmbeddingModel}`, "success"));
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus(createStatus(err.message || "Failed to switch embedding model", "error"));
        } finally {
            setEmbeddingLoading(false);
        }
    }

    async function handleSaveKB() {
        setStatus(createStatus("Saving knowledge base...", "info"));
        try {
            await saveKnowledgeBase();
            setStatus(createStatus("Knowledge base saved successfully", "success"));
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus(createStatus("Failed to save knowledge base", "error"));
        }
    }

    async function handleClearAll() {
        if (!window.confirm("This will delete all documents from the knowledge base. Continue?")) {
            return;
        }

        if (!window.confirm("Are you absolutely sure? This cannot be undone!")) {
            return;
        }

        setStatus(createStatus("Clearing all documents...", "info"));
        try {
            await clearAllDocuments();
            setStatus(createStatus("All documents cleared", "success"));
            await loadHealthAndStats();
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus(createStatus("Failed to clear documents", "error"));
        }
    }

    function formatModelSize(bytes) {
        const gb = bytes / (1024 ** 3);
        return gb.toFixed(1) + " GB";
    }

    function getCapabilityBadge(cap) {
        return getCapabilityBadgeMeta(cap);
    }

    const embeddingModels = models.filter((model) => model.capabilities.includes("embedding"));

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2 className="section-title"><SettingsIcon size={22} /> Settings</h2>
            </div>

            {/* Appearance Settings */}
            <div className="settings-section">
                <h3 className="section-title"><PaletteIcon size={18} /> Appearance</h3>
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
                <h3 className="section-title"><BrainIcon size={18} /> AI Behavior</h3>
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

            {/* Models Section */}
            <div className="settings-section">
                <h3 className="section-title"><BotIcon size={18} /> Available Models</h3>
                {models.length === 0 ? (
                    <p className="text-secondary">No models loaded. Pull models with: ollama pull &lt;model&gt;</p>
                ) : (
                    <div className="models-grid">
                        {models.map((model) => (
                            <div key={model.name} className="model-card">
                                <div className="model-card-header">
                                    <span className="model-card-name">{model.name.split(':')[0]}</span>
                                    <span className="model-card-size">{formatModelSize(model.size)}</span>
                                </div>
                                <div className="model-card-capabilities">
                                    {model.capabilities.map((cap) => {
                                        const badge = getCapabilityBadge(cap);
                                        return (
                                            <span key={cap} className={`model-capability-badge ${badge.color}`} title={badge.label}>
                                                <ModelCapabilityIcon capability={cap} size={14} /> {badge.label}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="model-card-footer">
                                    <span className="model-card-digest">{model.digest}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="btn-secondary"
                    onClick={loadModels}
                    style={{ marginTop: '12px' }}
                >
                    <RefreshIcon size={16} /> Refresh Models
                </button>
            </div>

            <div className="settings-section">
                <h3 className="section-title"><DatabaseIcon size={18} /> Embedding Model</h3>
                {embeddingModels.length === 0 ? (
                    <p className="text-secondary">No embedding-capable models detected. Pull one with: ollama pull qwen3-embedding:4b</p>
                ) : (
                    <div className="setting-stack">
                        <div className="setting-item vertical-align">
                            <div className="setting-info">
                                <div className="setting-label">Current Embedding Model</div>
                                <div className="setting-description">
                                    Used for document and query embeddings in RAG retrieval.
                                </div>
                            </div>
                            <div className="setting-control-group">
                                <select
                                    className="settings-select"
                                    value={selectedEmbeddingModel}
                                    onChange={(e) => setSelectedEmbeddingModel(e.target.value)}
                                    disabled={embeddingLoading}
                                >
                                    {embeddingModels.map((model) => (
                                        <option key={model.name} value={model.name}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className="btn-primary"
                                    onClick={handleEmbeddingSwitch}
                                    disabled={embeddingLoading || !selectedEmbeddingModel || selectedEmbeddingModel === currentEmbeddingModel}
                                >
                                    {embeddingLoading ? "Switching..." : "Apply Embedding Model"}
                                </button>
                            </div>
                        </div>
                        <p className="text-secondary">
                            Active model: <strong>{currentEmbeddingModel || "N/A"}</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* System Information */}
            <div className="settings-section">
                <h3 className="section-title"><DatabaseIcon size={18} /> System Status</h3>
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
                                    <span className={`info-value ${health.status === "healthy" ? "success" : "error"} icon-badge`}>
                                        {health.status === "healthy" ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />} {health.status === "healthy" ? "Healthy" : "Error"}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Version</span>
                                    <span className="info-value">{health.version}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Current LLM</span>
                                    <span className="info-value">{health.models?.llm?.split(':')[0] || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Embedding Model</span>
                                    <span className="info-value">{health.models?.embedding?.split(':')[0] || "N/A"}</span>
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
                    <RefreshIcon size={16} /> Refresh Status
                </button>
            </div>

            {/* Data Management */}
            <div className="settings-section">
                <h3 className="section-title"><DatabaseIcon size={18} /> Data Management</h3>
                <div className="action-buttons">
                    <button
                        className="btn-primary"
                        onClick={handleSaveKB}
                    >
                        <SaveIcon size={16} /> Save Knowledge Base
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handleClearAll}
                    >
                        <TrashIcon size={16} /> Clear All Documents
                    </button>
                </div>
                <p className="warning-text icon-badge">
                    <AlertIcon size={14} /> Clearing all documents will permanently delete all uploaded files from the knowledge base.
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className={`status-banner ${status.tone}`}>
                    {status.tone === "success" ? <CheckCircleIcon size={16} /> : status.tone === "error" ? <AlertIcon size={16} /> : <RefreshIcon size={16} />}
                    <span>{status.text}</span>
                </div>
            )}

            {/* About Section */}
            <div className="settings-section about-section">
                <h3 className="section-title"><InfoIcon size={18} /> About</h3>
                <div className="about-content">
                    <p><strong>RAG Assistant</strong></p>
                    <p>A privacy-focused, offline AI chatbot using Retrieval-Augmented Generation.</p>
                    <div className="features-list">
                        <div className="feature-badge"><LockIcon size={14} /> 100% Private</div>
                        <div className="feature-badge"><DatabaseIcon size={14} /> Offline First</div>
                        <div className="feature-badge"><BoltIcon size={14} /> Fast &amp; Local</div>
                        <div className="feature-badge"><LibraryIcon size={14} /> Document RAG</div>
                        <div className="feature-badge"><BotIcon size={14} /> Model Switching</div>
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
