export function getAllChats() {
    const saved = localStorage.getItem("allChats");
    return saved ? JSON.parse(saved) : [];
}

export function saveAllChats(chats) {
    localStorage.setItem("allChats", JSON.stringify(chats));
}

export function getCurrentChatId() {
    return localStorage.getItem("currentChatId");
}

export function setCurrentChatId(chatId) {
    localStorage.setItem("currentChatId", chatId);
}

export function removeAttachmentReferences(attachmentIds) {
    if (!attachmentIds.length) {
        return;
    }

    const targets = new Set(attachmentIds);
    const chats = getAllChats().map((chat) => ({
        ...chat,
        messages: (chat.messages || []).map((message) => ({
            ...message,
            attachments: (message.attachments || []).filter(
                (attachment) => !targets.has(attachment.id)
            ),
        })),
    }));

    saveAllChats(chats);
}