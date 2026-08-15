"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GenerateVideoPage() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  async function pollStatus(getUrl) {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // cek tiap 3 detik

      const res = await fetch(`/api/generate-video/status?getUrl=${encodeURIComponent(getUrl)}`);
      const data = await res.json();

      setStatusText(`Status: ${data.status}`);

      if (data.status === "succeeded") {
        return data.output;
      }
      if (data.status === "failed") {
        throw new Error(JSON.stringify(data.error));
      }
      // kalau masih "starting" atau "processing", lanjut loop
    }
  }

  async function handleSubmit() {
    if (!file || !prompt) {
      setError("Pilih foto dan isi prompt dulu ya.");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusText("Mengupload foto...");

    try {
      // 1. Upload foto ke Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("Uploads")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 2. Mulai proses generate video
      setStatusText("Memulai proses generate video...");
      const startResponse = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const startData = await startResponse.json();
      if (startData.error) throw new Error(JSON.stringify(startData.error));

      // 3. Polling status dari browser sampai selesai
      const output = await pollStatus(startData.getUrl);

      setVideoUrl(output);
      setStatusText("Selesai!");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1>Generate Video dari Foto (AI)</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <textarea
        placeholder="Contoh: orang ini melambaikan tangan dan tersenyum"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Sedang memproses..." : "Generate Video"}
      </button>

      {loading && <p>{statusText} (proses ini bisa memakan waktu 1-5 menit)</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {videoUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Hasil:</h3>
          <video src={videoUrl} controls style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}