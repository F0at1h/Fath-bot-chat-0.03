export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Ubah format pesan jadi format yang dimengerti OpenRouter
    const formattedMessages = messages.map((m) => {
      if (m.attachment && m.attachment.type?.startsWith("image")) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content || "Tolong lihat gambar ini." },
            { type: "image_url", image_url: { url: m.attachment.url } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5:free",
        messages: formattedMessages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return Response.json({ reply: "Error dari AI: " + data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "Maaf, tidak ada balasan.";
    return Response.json({ reply });
  } catch (err) {
    return Response.json({ reply: "Terjadi kesalahan server: " + err.message });
  }
}
