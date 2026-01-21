// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Error handling wrapper
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request Failed [${endpoint}]:`, error);
        throw error;
    }
}

// Chat API
export async function chat(message, use_rag = true, top_k = 3, model = null) {
    return apiRequest("/chat", {
        method: "POST",
        body: JSON.stringify({ message, use_rag, top_k, model }),
    });
}

// Model Management
export async function listModels() {
    return apiRequest("/models/list");
}

export async function switchModel(modelName) {
    return apiRequest("/models/switch", {
        method: "POST",
        body: JSON.stringify({ model_name: modelName }),
    });
}

export async function getCurrentModel() {
    return apiRequest("/models/current");
}

// Chat History Management
export async function saveChatSession(session) {
    return apiRequest("/chats/save", {
        method: "POST",
        body: JSON.stringify(session),
    });
}

export async function listChatSessions() {
    return apiRequest("/chats/list");
}

export async function loadChatSession(sessionId) {
    return apiRequest(`/chats/load/${sessionId}`);
}

export async function deleteChatSession(sessionId) {
    return apiRequest(`/chats/delete/${sessionId}`, {
        method: "DELETE",
    });
}

export async function clearAllChatSessions() {
    return apiRequest("/chats/clear", {
        method: "POST",
    });
}

export async function exportChatSession(sessionId) {
    return apiRequest(`/chats/export/${sessionId}`, {
        method: "POST",
    });
}

// Document Management
export async function listDocuments() {
    return apiRequest("/documents");
}

export async function addDocument(path, metadata = null) {
    return apiRequest("/documents/add", {
        method: "POST",
        body: JSON.stringify({ path, metadata }),
    });
}

export async function deleteDocument(filename) {
    return apiRequest("/documents/delete", {
        method: "DELETE",
        body: JSON.stringify({ filename }),
    });
}

export async function clearAllDocuments() {
    return apiRequest("/documents/clear", {
        method: "POST",
    });
}

// File Upload (multipart/form-data)
export async function uploadDocument(file) {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Upload failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Upload Failed:", error);
        throw error;
    }
}

// Knowledge Base Management
export async function saveKnowledgeBase() {
    return apiRequest("/kb/save", {
        method: "POST",
    });
}

export async function loadKnowledgeBase() {
    return apiRequest("/kb/load", {
        method: "POST",
    });
}

export async function getStats() {
    return apiRequest("/kb/stats");
}

// Health Check
export async function getHealth() {
    return apiRequest("/health");
}

// Export API URL for reference
export const API_URL = API_BASE_URL;