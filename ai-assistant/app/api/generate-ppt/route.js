import PptxGenJS from "pptxgenjs";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  const { topic } = await req.json();

  if (!topic) {
    return Response.json({ error: "Topik wajib diisi" }, { status: 400 });
  }

  // 1. Minta AI (lewat OpenRouter) bikin outline slide dalam format JSON
  const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: `Buatkan outline presentasi PowerPoint tentang "${topic}" dalam 5-7 slide.
Balas HANYA dalam format JSON murni seperti ini, tanpa teks tambahan, tanpa markdown:
{
  "title": "Judul Presentasi",
  "slides": [
    { "heading": "Judul Slide", "bullets": ["poin 1", "poin 2", "poin 3"] }
  ]
}`,
        },
      ],
    }),
  });

  const aiData = await aiResponse.json();
  let outline;

  try {
    const rawText = aiData.choices[0].message.content;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    outline = JSON.parse(cleanText);
  } catch (err) {
    return Response.json({ error: "Gagal memproses hasil AI, coba lagi." }, { status: 500 });
  }

  // 2. Bangun file PPT dari outline
  const pptx = new PptxGenJS();

  // Slide judul
  const titleSlide = pptx.addSlide();
  titleSlide.addText(outline.title, {
    x: 0.5, y: 2, w: 9, h: 1.5,
    fontSize: 32, bold: true, align: "center",
  });

  // Slide isi
  outline.slides.forEach((slide) => {
    const s = pptx.addSlide();
    s.addText(slide.heading, {
      x: 0.5, y: 0.4, w: 9, h: 1,
      fontSize: 24, bold: true,
    });
    s.addText(
      slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
      { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 16 }
    );
  });

  // 3. Simpan sebagai buffer, upload ke Supabase Storage
  const pptxBuffer = await pptx.write("nodebuffer");
  const fileName = `ppt-${Date.now()}.pptx`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("Uploads")
    .upload(fileName, pptxBuffer, {
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("Uploads")
    .getPublicUrl(fileName);

  return Response.json({ fileUrl: publicUrlData.publicUrl });
}