import { API_URL } from "../services/api";
import { formatFileSize } from "../utils/fileTypes";
import { FileTypeIcon } from "./AppIcons";

export default function Message({ role, text, attachments = [] }) {
    return (
        <div className={`message ${role}`}>
            <strong>{role === "user" ? "Me" : "LoLA"}:</strong>
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
                            <FileTypeIcon filename={attachment.filename} size={20} />
                            <span>{attachment.filename}</span>
                            <span className="message-attachment-size">{formatFileSize(attachment.size)}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
