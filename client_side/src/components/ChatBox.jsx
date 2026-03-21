import { useState, useRef, useEffect } from "react";
import { chat, getCurrentModel, uploadChatAttachments } from "../services/api";
import Message from "./Message";
import ChatHistory from "./ChatHistory";
import ModelSelector from "./ModelSelector";
import { getAllChats, saveAllChats, setCurrentChatId as persistCurrentChatId } from "../utils/chatStorage";
import { formatFileSize, getFileIcon, isImageFile, isSupportedAttachment } from "../utils/fileTypes";

export default function ChatBox({ useRag }) {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentModel, setCurrentModel] = useState("ministral-3");
    const [selectedAttachments, setSelectedAttachments] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const attachmentInputRef = useRef(null);

    // Initialize or load current chat
    useEffect(() => {
        const savedCurrentId = localStorage.getItem('currentChatId');
        if (savedCurrentId) {
            const existingChat = getAllChats().find((chat) => chat.id === savedCurrentId);
            if (existingChat) {
                setCurrentChatId(existingChat.id);
                setMessages(existingChat.messages || []);
                persistCurrentChatId(existingChat.id);
            } else {
                const newChatId = generateChatId();
                const newChat = {
                    id: newChatId,
                    title: 'New Chat',
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                const allChats = getAllChats();
                allChats.unshift(newChat);
                saveAllChats(allChats);
                persistCurrentChatId(newChatId);
                setCurrentChatId(newChatId);
                setMessages([]);
            }
        } else {
            const newChatId = generateChatId();
            const newChat = {
                id: newChatId,
                title: 'New Chat',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const allChats = getAllChats();
            allChats.unshift(newChat);
            saveAllChats(allChats);
            persistCurrentChatId(newChatId);
            setCurrentChatId(newChatId);
            setMessages([]);
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
            const allChats = getAllChats();
            const chatIndex = allChats.findIndex((chat) => chat.id === currentChatId);
            const chatData = {
                id: currentChatId,
                title: messages.length > 0 ? generateChatTitle(messages[0].text) : 'New Chat',
                messages,
                createdAt: chatIndex >= 0 ? allChats[chatIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (chatIndex >= 0) {
                allChats[chatIndex] = chatData;
            } else {
                allChats.unshift(chatData);
            }

            saveAllChats(allChats);
        }
    }, [currentChatId, messages]);

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
        saveAllChats(allChats);
        persistCurrentChatId(newChatId);

        setCurrentChatId(newChatId);
        setMessages([]);
        setError(null);
        setSelectedAttachments([]);
    }

    function loadChat(chatId) {
        const allChats = getAllChats();
        const chat = allChats.find(c => c.id === chatId);

        if (chat) {
            setCurrentChatId(chat.id);
            setMessages(chat.messages || []);
            persistCurrentChatId(chat.id);
            setSelectedAttachments([]);
        }
    }

    function deleteChat(chatId) {
        const allChats = getAllChats();
        const filtered = allChats.filter(c => c.id !== chatId);
        saveAllChats(filtered);

        if (chatId === currentChatId) {
            if (filtered.length > 0) {
                loadChat(filtered[0].id);
            } else {
                createNewChat();
            }
        }
    }

    function generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    function clearSelectedAttachments() {
        setSelectedAttachments([]);
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = "";
        }
    }

    function handleAttachmentSelect(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) {
            return;
        }

        const supported = [];
        const unsupported = [];
        const oversized = [];

        files.forEach((file) => {
            if (file.size > 50 * 1024 * 1024) {
                oversized.push(file.name);
                return;
            }

            if (!isSupportedAttachment(file.name)) {
                unsupported.push(file.name);
                return;
            }

            supported.push(file);
        });

        if (supported.length) {
            setSelectedAttachments((prev) => {
                const existingKeys = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
                const merged = [...prev];
                supported.forEach((file) => {
                    const key = `${file.name}-${file.size}-${file.lastModified}`;
                    if (!existingKeys.has(key)) {
                        merged.push(file);
                    }
                });
                return merged;
            });
        }

        const notices = [];
        if (unsupported.length) {
            notices.push(`Unsupported file types skipped: ${unsupported.join(", ")}`);
        }
        if (oversized.length) {
            notices.push(`Files larger than 50MB skipped: ${oversized.join(", ")}`);
        }

        setError(notices.length ? notices.join(" ") : null);
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = "";
        }
    }

    function removeSelectedAttachment(indexToRemove) {
        setSelectedAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
    }

    async function send() {
        if (!input.trim() && !selectedAttachments.length) return;

        setLoading(true);
        setError(null);

        try {
            const messageId = generateMessageId();
            let uploadedAttachments = [];

            if (selectedAttachments.length > 0) {
                const uploadResult = await uploadChatAttachments(currentChatId, messageId, selectedAttachments);
                uploadedAttachments = uploadResult.attachments || [];

                if (uploadResult.unsupported_files?.length) {
                    setError(`Unsupported file types skipped: ${uploadResult.unsupported_files.join(", ")}`);
                }
            }

            if (!input.trim() && uploadedAttachments.length === 0) {
                throw new Error("No supported attachments were available to send.");
            }

            const hasImageAttachment = uploadedAttachments.some((attachment) => isImageFile(attachment.filename));
            const messageToSend = input.trim() || (hasImageAttachment ? "Please analyze the attached image files." : "Please review the attached files.");

            const historicalAttachmentIds = messages.flatMap((msg) =>
                (msg.attachments || []).map((attachment) => attachment.id).filter(Boolean)
            );

            const currentAttachmentIds = uploadedAttachments
                .map((attachment) => attachment.id)
                .filter(Boolean);

            const allAttachmentIds = Array.from(new Set([...historicalAttachmentIds, ...currentAttachmentIds]));

            const userMsg = {
                id: messageId,
                role: "user",
                text: messageToSend,
                attachments: uploadedAttachments,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            clearSelectedAttachments();

            const res = await chat(
                messageToSend,
                useRag,
                3,
                currentModel,
                null,
                null,
                allAttachmentIds
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
            if (res.model_used && res.model_used !== currentModel) {
                setCurrentModel(res.model_used);
            }
        } catch (err) {
            setError(err.message || "Failed to get response. Check if backend is running.");
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
            const allChats = getAllChats();
            const chatIndex = allChats.findIndex((chat) => chat.id === currentChatId);
            if (chatIndex >= 0) {
                allChats[chatIndex] = {
                    ...allChats[chatIndex],
                    title: 'New Chat',
                    messages: [],
                    updatedAt: new Date().toISOString(),
                };
                saveAllChats(allChats);
            }
            setMessages([]);
            setError(null);
        }
    }

    function exportChat() {
        const chatText = messages
            .map((m) => {
                const attachmentText = (m.attachments || []).length
                    ? `\nAttachments: ${(m.attachments || []).map((attachment) => attachment.filename).join(", ")}`
                    : "";
                return `${m.role.toUpperCase()}: ${m.text}${attachmentText}${m.modelUsed ? ` [Model: ${m.modelUsed}]` : ''}`;
            })
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
                    <ModelSelector onModelChange={handleModelChange} selectedModel={currentModel} />
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
                {selectedAttachments.length > 0 && (
                    <div className="attachment-preview-list">
                        {selectedAttachments.map((file, index) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="image-attachment-preview">
                                <span>{getFileIcon(file.name)} {file.name}</span>
                                <span className="attachment-preview-meta">{formatFileSize(file.size)}</span>
                                <button
                                    className="btn-clear-attachment"
                                    onClick={() => removeSelectedAttachment(index)}
                                    disabled={loading}
                                    title="Remove attachment"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            className="btn-secondary btn-sm"
                            onClick={clearSelectedAttachments}
                            disabled={loading}
                            title="Clear attachments"
                        >
                            Clear Attachments
                        </button>
                    </div>
                )}

                <div className="input-wrapper">
                    <input
                        ref={attachmentInputRef}
                        type="file"
                        multiple
                        onChange={handleAttachmentSelect}
                        className="image-file-input"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="attach-button"
                        onClick={() => attachmentInputRef.current?.click()}
                        disabled={loading}
                        title="Attach files"
                    >
                        📎
                    </button>

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={useRag ? "Ask about your documents or attach files..." : "Type your message or attach files..."}
                        rows={1}
                        className="chat-input"
                        disabled={loading}
                    />
                    <button
                        onClick={send}
                        disabled={(!input.trim() && !selectedAttachments.length) || loading}
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