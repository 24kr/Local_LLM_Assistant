import { useState } from "react";

function FileUpload() {
    const [status, setStatus] = useState("");

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        setStatus(`Uploaded: ${data.filename}`);
    };

    return (
        <div>
            <input type="file" onChange={handleUpload} />
            <p>{status}</p>
        </div>
    );
}

export default FileUpload;
