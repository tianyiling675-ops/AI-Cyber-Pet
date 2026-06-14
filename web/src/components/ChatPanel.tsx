import { SendHorizontal } from "lucide-react";
import { FormEvent, useState } from "react";
import { chat } from "../api";
import type { ChatMessage } from "../types";

export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "哼，本主子在线。你最好是真的有事。",
      mode: "mock",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"zhipu" | "mock" | "cached">("mock");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((items) => [...items, { role: "user", content: text }]);
    setLoading(true);
    try {
      const result = await chat(text, mode);
      setMessages((items) => [
        ...items,
        { role: "assistant", content: result.reply, mode: result.mode },
      ]);
    } catch {
      setMessages((items) => [
        ...items,
        { role: "assistant", content: "网络不太给面子。本主子先用缓存陪你一下。", mode: "cached" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`chat-panel ${compact ? "compact" : ""}`}>
      <div className="chat-head">
        <div>
          <strong>橘橘</strong>
          <span>第一人称对话</span>
        </div>
        <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
          <option value="mock">mock</option>
          <option value="cached">cached</option>
          <option value="zhipu">zhipu</option>
        </select>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className={`bubble ${message.role}`} key={`${message.role}-${index}`}>
            <p>{message.content}</p>
            {message.mode ? <small>{message.mode}</small> : null}
          </div>
        ))}
        {loading ? <div className="bubble assistant pending">本主子正在组织语言...</div> : null}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="问问橘橘" />
        <button type="submit" aria-label="发送">
          <SendHorizontal size={18} />
        </button>
      </form>
    </section>
  );
}
