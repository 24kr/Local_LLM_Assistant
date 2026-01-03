import { useState } from "react";
import { chat } from "../services/api";
import Message from "./Message";

export default function ChatBox({ useRag }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function send() {
        if (!input) return;

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const res = await chat(input, useRag);

        setMessages(prev => [
            ...prev,
            { role: "assistant", text: res.answer }
        ]);

        setLoading(false);
    }

    return (
        <div className="chat">
            <div className="messages">
                {messages.map((m, i) => (
                    <Message key={i} role={m.role} text={m.text} />
                ))}
                {loading && <p className="typing">AI is thinking…</p>}
            </div>

            <div className="input-bar">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                />
                <button onClick={send}>Send</button>
            </div>
        </div>
    );
}
