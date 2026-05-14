export const SUPPORTED_ATTACHMENT_EXTENSIONS = [
    ".txt", ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv",
    ".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", ".tif", ".tiff", ".webp", ".bmp",
    ".html", ".css", ".js", ".jsx", ".json", ".cpp", ".py", ".ts", ".tsx", ".md",
    ".env", ".bat", ".sh", ".php", ".cs", ".rb", ".java", ".go", ".rs", ".yaml",
    ".yml", ".xml", ".sql", ".c", ".h",
];

export const FILE_TYPE_META = {
    pdf: { label: "PDF", tone: "red" },
    doc: { label: "DOC", tone: "blue" },
    docx: { label: "DOCX", tone: "blue" },
    xls: { label: "XLS", tone: "green" },
    xlsx: { label: "XLSX", tone: "green" },
    csv: { label: "CSV", tone: "emerald" },
    txt: { label: "TXT", tone: "slate" },
    md: { label: "MD", tone: "slate" },
    png: { label: "PNG", tone: "pink" },
    jpg: { label: "JPG", tone: "pink" },
    jpeg: { label: "JPEG", tone: "pink" },
    svg: { label: "SVG", tone: "purple" },
    ico: { label: "ICO", tone: "indigo" },
    gif: { label: "GIF", tone: "orange" },
    tif: { label: "TIF", tone: "amber" },
    tiff: { label: "TIFF", tone: "amber" },
    webp: { label: "WEBP", tone: "rose" },
    bmp: { label: "BMP", tone: "cyan" },
    html: { label: "HTML", tone: "orange" },
    css: { label: "CSS", tone: "cyan" },
    js: { label: "JS", tone: "amber" },
    jsx: { label: "JSX", tone: "amber" },
    json: { label: "JSON", tone: "purple" },
    cpp: { label: "C++", tone: "indigo" },
    c: { label: "C", tone: "indigo" },
    h: { label: "H", tone: "indigo" },
    py: { label: "PY", tone: "yellow" },
    ts: { label: "TS", tone: "blue" },
    tsx: { label: "TSX", tone: "blue" },
    env: { label: "ENV", tone: "emerald" },
    bat: { label: "BAT", tone: "slate" },
    sh: { label: "SH", tone: "slate" },
    php: { label: "PHP", tone: "purple" },
    cs: { label: "C#", tone: "green" },
    rb: { label: "RB", tone: "rose" },
    java: { label: "JAVA", tone: "orange" },
    go: { label: "GO", tone: "teal" },
    rs: { label: "RS", tone: "orange" },
    yaml: { label: "YAML", tone: "emerald" },
    yml: { label: "YML", tone: "emerald" },
    xml: { label: "XML", tone: "orange" },
    sql: { label: "SQL", tone: "blue" },
};

const DEFAULT_FILE_TYPE_META = { label: "FILE", tone: "slate" };

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

export function getFileTypeMeta(filename = "") {
    const ext = getFileExtension(filename);
    return FILE_TYPE_META[ext] || { ...DEFAULT_FILE_TYPE_META, label: ext ? ext.toUpperCase() : DEFAULT_FILE_TYPE_META.label };
}

export function getFileIcon(filename = "") {
    return getFileTypeMeta(filename).label;
}
