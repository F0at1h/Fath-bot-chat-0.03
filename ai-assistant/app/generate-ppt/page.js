"use client";

import { useState } from "react";

export default function GeneratePptPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!topic) {
      setError("Isi topik presentasi dulu ya.");
      return;
    }

    setLoading(true);
    setError(null);
    setFileUrl(null);

    try {
      const response = await fetch("/api/generate-ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setFileUrl(data.fileUrl);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1>Buat PPT dengan AI</h1>

      <textarea
        placeholder="Contoh: manfaat energi terbarukan untuk masa depan"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={3}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Sedang membuat PPT..." : "Buat PPT"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {fileUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Selesai!</h3>
          <a href={fileUrl} download>
            Download File PPT
          </a>
        </div>
      )}
    </div>
  );
}