import { useState, useRef } from "react";
import { addDocument } from "../services/api";

export default function DocumentManager() {
    const [path, setPath] = useState("");
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("");
    const [mode, setMode] = useState("path"); // "path" or "upload"
    const fileInputRef = useRef(null);

    // Handle adding document by path
    async function handleAddByPath() {
        if (!path) {
            setStatus("Please enter a file path");
            return;
        }

        setStatus("Processing path...");
        try {
            await addDocument(path);
            setStatus("Document added from path ✅");
            setPath("");
        } catch {
            setStatus("Error adding document ❌");
        }
    }

    // Handle uploading document by file
    async function handleUpload() {
        if (!file) {
            setStatus("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setStatus("Uploading...");
        try {
            const res = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setStatus(`Uploaded: ${data.filename} ✅`);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            setStatus("Upload failed ❌");
        }
    }

    // Handle file selection
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus(`Selected: ${selectedFile.name}`);
        }
    };

    // Main submit handler that calls the appropriate function based on mode
    const handleSubmit = () => {
        if (mode === "path") {
            handleAddByPath();
        } else {
            handleUpload();
        }
    };

    return (
        <div className="docs">
            <h3>📄 Document Manager</h3>

            {/* Mode selector */}
            <div className="mode-selector">
                <button
                    className={mode === "path" ? "active" : ""}
                    onClick={() => setMode("path")}
                >
                    Add by Path
                </button>
                <button
                    className={mode === "upload" ? "active" : ""}
                    onClick={() => setMode("upload")}
                >
                    Upload File
                </button>
            </div>

            {/* Path input mode */}
            {mode === "path" && (
                <div className="input-section">
                    <input
                        value={path}
                        onChange={e => setPath(e.target.value)}
                        placeholder="Local file path (PDF, DOCX, CSV...)"
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>
            )}

            {/* File upload mode */}
            {mode === "upload" && (
                <div className="input-section">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.csv,.txt,.md"
                    />
                    {file && (
                        <div className="file-info">
                            Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
                        </div>
                    )}
                </div>
            )}

            {/* Action button */}
            <button
                onClick={handleSubmit}
                disabled={(mode === "path" && !path) || (mode === "upload" && !file)}
            >
                {mode === "path" ? "Add Document" : "Upload Document"}
            </button>

            {/* Status message */}
            {status && (
                <div className={`status ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : ""}`}>
                    {status}
                </div>
            )}

            {/* Quick help */}
            <div className="help-text">
                {mode === "path"
                    ? "Enter the full path to a document on your system."
                    : "Select a document file to upload from your computer."}
            </div>
        </div>
    );
}