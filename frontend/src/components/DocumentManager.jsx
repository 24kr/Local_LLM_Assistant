import { useState } from "react";
import { addDocument } from "../services/api";

export default function DocumentManager() {
    const [path, setPath] = useState("");
    const [status, setStatus] = useState("");

    async function handleAdd() {
        if (!path) return;
        setStatus("Processing...");
        await addDocument(path);
        setStatus("Document added ✅");
        setPath("");
    }

    return (
        <div className="docs">
            <h3>📄 Documents</h3>

            <input
                value={path}
                onChange={e => setPath(e.target.value)}
                placeholder="Local file path (PDF, DOCX, CSV...)"
            />
            <button onClick={handleAdd}>Add</button>

            {status && <p>{status}</p>}
        </div>
    );
}
