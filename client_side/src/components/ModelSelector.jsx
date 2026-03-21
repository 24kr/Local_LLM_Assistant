import { useState, useEffect } from "react";
import { listModels, switchModel, getCurrentModel } from "../services/api";

export default function ModelSelector({ onModelChange, selectedModel }) {
    const [models, setModels] = useState([]);
    const [currentModel, setCurrentModel] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        loadModels();
    }, []);

    useEffect(() => {
        if (selectedModel) {
            setCurrentModel(selectedModel);
        }
    }, [selectedModel]);

    async function loadModels() {
        setLoading(true);
        try {
            const [modelsData, currentData] = await Promise.all([
                listModels(),
                getCurrentModel()
            ]);

            setModels(modelsData.models || []);
            setCurrentModel(currentData.llm_model);
        } catch (err) {
            console.error("Failed to load models:", err);
            setStatus("⚠️ Failed to load models");
        } finally {
            setLoading(false);
        }
    }

    async function handleModelSwitch(modelName) {
        setLoading(true);
        setStatus("");

        try {
            await switchModel(modelName);
            setCurrentModel(modelName);
            setIsOpen(false);
            setStatus(`✅ Switched to ${modelName}`);

            // Notify parent component
            if (onModelChange) {
                onModelChange(modelName);
            }

            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            console.error("Failed to switch model:", err);
            setStatus(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    function formatSize(bytes) {
        const gb = bytes / (1024 ** 3);
        return gb.toFixed(1) + " GB";
    }

    function getCapabilityIcon(capability) {
        const icons = {
            'vision': '👁️',
            'coding': '💻',
            'chat': '💬',
            'embedding': '🔢'
        };
        return icons[capability] || '🤖';
    }

    function getModelShortName(fullName) {
        // Extract just the model name without tags
        return fullName.split(':')[0];
    }

    return (
        <div className="model-selector">
            <button
                className="model-selector-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                title="Select Model"
            >
                <span className="model-icon">🤖</span>
                <span className="model-name">{getModelShortName(currentModel)}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <>
                    <div className="model-selector-overlay" onClick={() => setIsOpen(false)} />
                    <div className="model-selector-dropdown">
                        <div className="dropdown-header">
                            <h3>Select Model</h3>
                            <button
                                className="btn-refresh"
                                onClick={loadModels}
                                disabled={loading}
                                title="Refresh models"
                            >
                                🔄
                            </button>
                        </div>

                        {loading ? (
                            <div className="dropdown-loading">
                                <div className="spinner-sm"></div>
                                <p>Loading models...</p>
                            </div>
                        ) : models.length === 0 ? (
                            <div className="dropdown-empty">
                                <p>No models found</p>
                                <p className="hint">Pull models with: ollama pull &lt;model&gt;</p>
                            </div>
                        ) : (
                            <div className="model-list">
                                {models.map((model) => (
                                    <button
                                        key={model.name}
                                        className={`model-item ${model.name === currentModel ? 'active' : ''}`}
                                        onClick={() => handleModelSwitch(model.name)}
                                        disabled={loading || model.name === currentModel}
                                    >
                                        <div className="model-item-header">
                                            <span className="model-item-name">
                                                {model.name === currentModel && <span className="check-mark">✓ </span>}
                                                {getModelShortName(model.name)}
                                            </span>
                                            <span className="model-item-size">
                                                {formatSize(model.size)}
                                            </span>
                                        </div>
                                        <div className="model-item-footer">
                                            <div className="model-capabilities">
                                                {model.capabilities.map((cap) => (
                                                    <span key={cap} className="capability-badge" title={cap}>
                                                        {getCapabilityIcon(cap)}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="model-digest">{model.digest}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="dropdown-footer">
                            <p className="hint">
                                💡 Different models have different strengths
                            </p>
                        </div>
                    </div>
                </>
            )}

            {status && (
                <div className="model-status-toast">
                    {status}
                </div>
            )}
        </div>
    );
}