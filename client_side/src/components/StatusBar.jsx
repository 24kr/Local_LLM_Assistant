import {
    AlertIcon,
    CheckCircleIcon,
    DesktopIcon,
    RefreshIcon,
    ServerIcon,
    XCircleIcon,
} from "./AppIcons";

export default function StatusBar({ apiStatus }) {
    const getStatusInfo = () => {
        switch (apiStatus) {
            case "connected":
                return { icon: CheckCircleIcon, text: "Connected", color: "success" };
            case "disconnected":
                return { icon: XCircleIcon, text: "Disconnected", color: "error" };
            case "error":
                return { icon: AlertIcon, text: "Error", color: "warning" };
            default:
                return { icon: RefreshIcon, text: "Checking...", color: "neutral" };
        }
    };

    const status = getStatusInfo();
    const StatusIcon = status.icon;

    return (
        <footer className="status-bar">
            <div className="status-left">
                <div className={`status-indicator ${status.color}`}>
                    <StatusIcon className="status-icon" size={16} />
                    <span className="status-text">Server: {status.text}</span>
                </div>
            </div>

            <div className="status-center">
                <span className="status-info">
                    Local LLM Assistant v1.0.24
                </span>
            </div>

            <div className="status-right status-indicator neutral">
                <DesktopIcon className="status-icon" size={16} />
                <span className="status-info">
                    <ServerIcon className="status-inline-icon" size={14} /> LoLA Ready
                </span>
            </div>
        </footer>
    );
}
