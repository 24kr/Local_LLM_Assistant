import { API_URL } from "../services/api";
import { formatFileSize, getFileIcon } from "../utils/fileTypes";

export default function Message({ role, text, attachments = [] }) {
    return (
        <div className={`message ${role}`}>
            <strong>{role === "user" ? "You" : "AI"}:</strong>
            <p>{text}</p>
            {attachments.length > 0 && (
                <div className="message-attachments">
                    {attachments.map((attachment) => (
                        <a
                            key={attachment.id}
                            className="message-attachment-chip"
                            href={`${API_URL}/attachments/${attachment.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            title={attachment.filename}
                        >
                            <span>{getFileIcon(attachment.filename)}</span>
                            <span>{attachment.filename}</span>
                            <span className="message-attachment-size">{formatFileSize(attachment.size)}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
