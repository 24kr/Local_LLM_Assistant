export default function Sidebar({ activeTab, setActiveTab, useRag, setUseRag }) {
    const tabs = [
        { id: "chat", icon: "💬", label: "Chat" },
        { id: "documents", icon: "📚", label: "Documents" },
        { id: "settings", icon: "⚙️", label: "Settings" },
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">           
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="nav-icon">{tab.icon}</span>
                        <span className="nav-label">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="rag-toggle">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={useRag}
                            onChange={() => setUseRag(!useRag)}
                            className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-text">
                            {useRag ? "📚 RAG Enabled" : "🚫 RAG Disabled"}
                        </span>
                    </label>
                    <p className="toggle-hint">
                        {useRag
                            ? "Using documents for context"
                            : "Chatting without documents"}
                    </p>
                </div>
            </div>
        </aside>
    );
}