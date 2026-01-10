export default function StatusBar({ apiStatus }) {
    const getStatusInfo = () => {
        switch (apiStatus) {
            case "connected":
                return { icon: "✅", text: "Connected", color: "success" };
            case "disconnected":
                return { icon: "❌", text: "Disconnected", color: "error" };
            case "error":
                return { icon: "⚠️", text: "Error", color: "warning" };
            default:
                return { icon: "🔄", text: "Checking...", color: "neutral" };
        }
    };

    const status = getStatusInfo();

    return (
        <footer className="status-bar">
            <div className="status-left">
                <div className={`status-indicator ${status.color}`}>
                    <span className="status-icon">{status.icon}</span>
                    <span className="status-text">API: {status.text}</span>
                </div>
            </div>

            <div className="status-center">
                <span className="status-info">
                    RAG Assistant v1.0.0
                </span>
            </div>

            <div className="status-right">
                <span className="status-info">
                    🖥️ Electron Ready
                </span>
            </div>
        </footer>
    );
}