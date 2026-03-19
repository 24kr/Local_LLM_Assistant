import { useState, useRef, useEffect } from "react";
import { chat, getCurrentModel } from "../services/api";
import Message from "./Message";
import ChatHistory from "./ChatHistory";
import ModelSelector from "./ModelSelector";

export default function ChatBox({ useRag }) {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentModel, setCurrentModel] = useState("ministral-3");
    const [selectedImageBase64, setSelectedImageBase64] = useState(null);
    const [selectedImageName, setSelectedImageName] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const imageInputRef = useRef(null);

    // Initialize or load current chat
    useEffect(() => {
        const savedCurrentId = localStorage.getItem('currentChatId');
        if (savedCurrentId) {
            loadChat(savedCurrentId);
        } else {
            createNewChat();
        }

        // Load current model
        loadCurrentModel();
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Save messages whenever they change
    useEffect(() => {
        if (currentChatId && messages.length > 0) {
            saveCurrentChat();
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function loadCurrentModel() {
        try {
            const data = await getCurrentModel();
            setCurrentModel(data.llm_model);
        } catch (err) {
            console.error("Failed to load current model:", err);
        }
    }

    function handleModelChange(newModel) {
        setCurrentModel(newModel);
    }

    function generateChatId() {
        return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function generateChatTitle(firstMessage) {
        if (!firstMessage) return 'New Chat';
        return firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
    }

    function createNewChat() {
        const newChatId = generateChatId();
        const newChat = {
            id: newChatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to all chats
        const allChats = getAllChats();
        allChats.unshift(newChat);
        localStorage.setItem('allChats', JSON.stringify(allChats));
        localStorage.setItem('currentChatId', newChatId);

        setCurrentChatId(newChatId);
        setMessages([]);
        setError(null);
    }

    function getAllChats() {
        const saved = localStorage.getItem('allChats');
        return saved ? JSON.parse(saved) : [];
    }

    function saveCurrentChat() {
        const allChats = getAllChats();
        const chatIndex = allChats.findIndex(c => c.id === currentChatId);

        const chatData = {
            id: currentChatId,
            title: messages.length > 0 ? generateChatTitle(messages[0].text) : 'New Chat',
            messages: messages,
            createdAt: chatIndex >= 0 ? allChats[chatIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (chatIndex >= 0) {
            allChats[chatIndex] = chatData;
        } else {
            allChats.unshift(chatData);
        }

        localStorage.setItem('allChats', JSON.stringify(allChats));
    }

    function loadChat(chatId) {
        const allChats = getAllChats();
        const chat = allChats.find(c => c.id === chatId);

        if (chat) {
            setCurrentChatId(chat.id);
            setMessages(chat.messages || []);
            localStorage.setItem('currentChatId', chat.id);
        }
    }

    function deleteChat(chatId) {
        const allChats = getAllChats();
        const filtered = allChats.filter(c => c.id !== chatId);
        localStorage.setItem('allChats', JSON.stringify(filtered));

        if (chatId === currentChatId) {
            if (filtered.length > 0) {
                loadChat(filtered[0].id);
            } else {
                createNewChat();
            }
        }
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                if (typeof result !== "string") {
                    reject(new Error("Failed to read image"));
                    return;
                }

                const base64 = result.includes(",") ? result.split(",")[1] : result;
                resolve(base64);
            };
            reader.onerror = () => reject(new Error("Failed to read image"));
            reader.readAsDataURL(file);
        });
    }

    async function handleImageSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setError("Image too large. Maximum size is 20MB for chat attachments.");
            return;
        }

        try {
            const base64 = await readFileAsBase64(file);
            setSelectedImageBase64(base64);
            setSelectedImageName(file.name);
            setError(null);
        } catch (err) {
            setError("Failed to read image attachment.");
            console.error("Image read error:", err);
        }
    }

    function clearSelectedImage() {
        setSelectedImageBase64(null);
        setSelectedImageName("");
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }

    async function send() {
        if (!input.trim() && !selectedImageBase64) return;

        const messageToSend = input.trim() || "Please analyze the attached image.";

        const userMsg = {
            role: "user",
            text: selectedImageName ? `${messageToSend}\n\n[Attached image: ${selectedImageName}]` : messageToSend,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setError(null);

        try {
            const res = await chat(
                messageToSend,
                useRag,
                3,
                currentModel,
                selectedImageBase64,
                selectedImageName || null
            );

            const assistantMsg = {
                role: "assistant",
                text: res.answer,
                sources: res.sources || [],
                contextUsed: res.context_used,
                modelUsed: res.model_used || currentModel,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
            clearSelectedImage();
        } catch (err) {
            setError("Failed to get response. Check if backend is running.");
            console.error("Chat error:", err);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function clearChat() {
        if (window.confirm("Clear current chat?")) {
            setMessages([]);
            saveCurrentChat();
            setError(null);
        }
    }

    function exportChat() {
        const chatText = messages
            .map((m) => `${m.role.toUpperCase()}: ${m.text}${m.modelUsed ? ` [Model: ${m.modelUsed}]` : ''}`)
            .join("\n\n");
        const blob = new Blob([chatText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const currentChat = getAllChats().find(c => c.id === currentChatId);
        a.download = `${currentChat?.title || 'chat'}-${Date.now()}.txt`;
        a.click();
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-header-left">
                    <ChatHistory
                        currentChatId={currentChatId}
                        onSelectChat={loadChat}
                        onNewChat={createNewChat}
                        onDeleteChat={deleteChat}
                    />
                    <h2>💬 Chat</h2>
                </div>
                <div className="chat-actions">
                    <ModelSelector onModelChange={handleModelChange} />
                    <button
                        className="btn-secondary btn-sm"
                        onClick={createNewChat}
                        title="New Chat"
                    >
                        ➕ New
                    </button>
                    {messages.length > 0 && (
                        <>
                            <button className="btn-secondary btn-sm" onClick={exportChat} title="Export Chat">
                                📥 Export
                            </button>
                            <button className="btn-secondary btn-sm" onClick={clearChat} title="Clear Chat">
                                🗑️ Clear
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💭</div>
                        <h3>Start a Conversation</h3>
                        <p>Ask me anything! {useRag ? "I'll use your documents to help." : "I'm ready to chat."}</p>
                        <div className="model-info">
                            <span className="current-model-badge">
                                🤖 Using: <strong>{currentModel.split(':')[0]}</strong>
                            </span>
                        </div>
                        <div className="example-prompts">
                            <p className="example-label">Try asking:</p>
                            {useRag ? (
                                <>
                                    <button className="example-prompt" onClick={() => setInput("Summarize the key points in the documents")}>
                                        "Summarize the key points"
                                    </button>
                                    <button className="example-prompt" onClick={() => setInput("What are the main topics covered?")}>
                                        "What topics are covered?"
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="example-prompt" onClick={() => setInput("Tell me about artificial intelligence")}>
                                        "Tell me about AI"
                                    </button>
                                    <button className="example-prompt" onClick={() => setInput("Explain machine learning")}>
                                        "Explain machine learning"
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="messages">
                        {messages.map((m, i) => (
                            <Message key={i} {...m} />
                        ))}
                        {loading && (
                            <div className="loading-message">
                                <p>LoLA is thinking </p>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {error && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                    <button className="error-close" onClick={() => setError(null)}>
                        ✕
                    </button>
                </div>
            )}

            <div className="input-container">
                {selectedImageName && (
                    <div className="image-attachment-preview">
                        <span>🖼️ Attached: {selectedImageName}</span>
                        <button
                            className="btn-clear-attachment"
                            onClick={clearSelectedImage}
                            disabled={loading}
                            title="Remove attachment"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="input-wrapper">
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="image-file-input"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="attach-button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={loading}
                        title="Attach image"
                    >
                        🖼️
                    </button>

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={useRag ? "Ask about your documents or attach an image..." : "Type your message or attach an image..."}
                        rows={1}
                        className="chat-input"
                        disabled={loading}
                    />
                    <button
                        onClick={send}
                        disabled={(!input.trim() && !selectedImageBase64) || loading}
                        className="send-button"
                        title="Send (Enter)"
                    >
                        <span className="send-icon">➤</span>
                    </button>
                </div>
                <div className="input-footer">
                    <span className="input-hint">
                        🤖 {currentModel.split(':')[0]} • {useRag ? "📚 Using RAG mode" : "💭 Direct chat mode"} • Press Enter to send
                    </span>
                </div>
            </div>
        </div>
    );
}