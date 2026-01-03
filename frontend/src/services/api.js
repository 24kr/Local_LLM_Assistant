const API = "http://localhost:8000";

export async function chat(message, use_rag = true) {
    const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, use_rag })
    });
    return res.json();
}

export async function addDocument(path) {
    const res = await fetch(`${API}/documents/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
    });
    return res.json();
}
