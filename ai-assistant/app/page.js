"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "Uploads";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  async function uploadFile(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return { url: data.publicUrl, type: file.type };
  }

  async function handleSend() {
    if (!input.trim() && !pendingFile) return;
    setLoading(true);

    let attachment = null;
    try {
      if (pendingFile) {
        attachment = await uploadFile(pendingFile);
      }
    } catch (err) {
      alert("Gagal upload file: " + err.message);
      setLoading(false);
      return;
    }

    const userMsg = { role: "user", content: input, attachment };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingFile(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Maaf, ada error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">AI Assistant Sendiri</div>

      <div className="messages">
        {messages.length === 0 && (
          <div style={{ opacity: 0.5, textAlign: "center", marginTop: 40 }}>
            Mulai ngobrol atau kirim foto/video di bawah 👇
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content}
            {m.attachment && m.attachment.type?.startsWith("image") && (
              <img src={m.attachment.url} alt="upload" />
            )}
            {m.attachment && m.attachment.type?.startsWith("video") && (
              <video src={m.attachment.url} controls />
            )}
          </div>
        ))}
        {loading && <div className="msg assistant">Mengetik...</div>}
      </div>

      {pendingFile && (
        <div className="previewChip">📎 {pendingFile.name} (siap dikirim)</div>
      )}

      <div className="inputBar">
        <button
          className="fileBtn"
          onClick={() => fileInputRef.current.click()}
          title="Lampirkan foto/video"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => setPendingFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Tulis pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          Kirim
        </button>
      </div>
    </div>
  );
}
