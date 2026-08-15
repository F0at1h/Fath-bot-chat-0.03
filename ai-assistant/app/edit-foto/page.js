"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function EditFotoPage() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!file || !prompt) {
      setError("Pilih foto dan isi prompt dulu ya.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      // 1. Upload foto asli ke Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Ambil URL publik foto yang baru diupload
      const { data: publicUrlData } = supabase.storage
        .from("Uploads")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Kirim ke API edit-image
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await response.json();

      if (data.error) throw new Error(JSON.stringify(data.error));

      setResultUrl(data.imageUrl);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1>Edit Foto dengan AI</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <textarea
        placeholder="Contoh: ubah latar belakang jadi pantai"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Sedang memproses..." : "Edit Foto"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Hasil:</h3>
          <img src={resultUrl} alt="Hasil edit" style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}