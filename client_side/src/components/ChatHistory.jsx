import { useState } from "react";
import { ChatBubbleIcon, CloseIcon, PlusIcon, TrashIcon } from "./AppIcons";

export default function ChatHistory({ currentChatId, onSelectChat, onNewChat, onDeleteChat }) {
    const [chats, setChats] = useState(() => {
        const savedChats = localStorage.getItem('allChats');
        if (savedChats) {
            try {
                return JSON.parse(savedChats);
            } catch (e) {
                console.error('Error loading chats:', e);
                return [];
            }
        }
        return [];
    });
    const [isOpen, setIsOpen] = useState(false);

    function handleDelete(chatId, e) {
        e.stopPropagation();
        if (window.confirm('Delete this chat?')) {
            onDeleteChat(chatId);

            // Reload chats after deletion
            const savedChats = localStorage.getItem('allChats');
            if (savedChats) {
                try {
                    const parsedChats = JSON.parse(savedChats);
                    setChats(parsedChats);
                } catch (e) {
                    console.error('Error loading chats:', e);
                }
            }
        }
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    function getPreview(chat) {
        if (!chat.messages || chat.messages.length === 0) return 'Empty chat';
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
    }

    return (
        <>
            <button
                className="chat-history-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="Chat History"
            >
                <ChatBubbleIcon className="icon" size={18} />
                <span className="label">Chats</span>
                <span className="badge">{chats.length}</span>
            </button>

            {isOpen && (
                <>
                    <div className="chat-history-overlay" onClick={() => setIsOpen(false)} />
                    <div className="chat-history-panel">
                        <div className="chat-history-header">
                            <h3>Chat History</h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}><CloseIcon size={18} /></button>
                        </div>

                        <button className="new-chat-btn" onClick={() => {
                            onNewChat();
                            setIsOpen(false);
                        }}>
                            <PlusIcon size={16} /> New Chat
                        </button>

                        <div className="chats-list">
                            {chats.length === 0 ? (
                                <div className="empty-chats">
                                    <p>No chat history yet</p>
                                    <p className="hint">Start a conversation to see it here!</p>
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="chat-item-header">
                                            <span className="chat-title">{chat.title}</span>
                                            <button
                                                className="delete-chat-btn"
                                                onClick={(e) => handleDelete(chat.id, e)}
                                                title="Delete chat"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                        <div className="chat-preview">{getPreview(chat)}</div>
                                        <div className="chat-meta">
                                            <span className="message-count">{chat.messages?.length || 0} messages</span>
                                            <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
