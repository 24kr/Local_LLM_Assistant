export const SUPPORTED_ATTACHMENT_EXTENSIONS = [
    ".txt", ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv",
    ".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", ".tif", ".tiff", ".webp", ".bmp",
    ".html", ".css", ".js", ".jsx", ".json", ".cpp", ".py", ".ts", ".tsx", ".md",
    ".env", ".bat", ".sh", ".php", ".cs", ".rb", ".java", ".go", ".rs", ".yaml",
    ".yml", ".xml", ".sql", ".c", ".h",
];

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "bmp", "tif", "tiff"];

export function getFileExtension(filename = "") {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function isSupportedAttachment(filename = "") {
    const extension = getFileExtension(filename);
    return SUPPORTED_ATTACHMENT_EXTENSIONS.includes(`.${extension}`);
}

export function isImageFile(filename = "") {
    return IMAGE_EXTENSIONS.includes(getFileExtension(filename));
}

export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(filename = "") {
    const ext = getFileExtension(filename);

    if (IMAGE_EXTENSIONS.includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📕";
    if (["docx", "doc"].includes(ext)) return "📘";
    if (["xlsx", "xls", "csv"].includes(ext)) return "📊";
    if (["txt", "md"].includes(ext)) return "📄";
    if (["html", "css"].includes(ext)) return "🌐";
    if (["js", "jsx", "ts", "tsx", "json"].includes(ext)) return "⚙️";
    if (["py"].includes(ext)) return "🐍";
    if (["java"].includes(ext)) return "☕";
    if (["cpp", "c", "h"].includes(ext)) return "⚡";
    if (["php"].includes(ext)) return "🐘";
    if (["rb"].includes(ext)) return "💎";
    if (["go"].includes(ext)) return "🔷";
    if (["rs"].includes(ext)) return "🦀";
    if (["sh", "bat"].includes(ext)) return "🖥️";
    if (["yaml", "yml", "xml", "env"].includes(ext)) return "⚙️";
    if (["sql"].includes(ext)) return "🗄️";

    return "📎";
}