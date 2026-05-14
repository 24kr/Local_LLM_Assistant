import { ChatBubbleIcon, LibraryIcon, RagOffIcon, RagOnIcon, SettingsIcon } from "./AppIcons";

export default function Sidebar({ activeTab, setActiveTab, useRag, setUseRag }) {
    const tabs = [
        { id: "chat", icon: ChatBubbleIcon, label: "Chat" },
        { id: "documents", icon: LibraryIcon, label: "Documents" },
        { id: "settings", icon: SettingsIcon, label: "Settings" },
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
                        <tab.icon className="nav-icon" size={20} />
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
                            {useRag ? (
                                <RagOnIcon className="toggle-text-icon" size={18} />
                            ) : (
                                <RagOffIcon className="toggle-text-icon" size={18} />
                            )}
                            <span>{useRag ? "RAG Enabled" : "RAG Disabled"}</span>
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
