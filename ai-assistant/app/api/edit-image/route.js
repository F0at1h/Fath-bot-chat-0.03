export async function POST(req) {
  const { imageUrl, prompt } = await req.json();

  // 1. Kirim request awal ke Replicate
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-kontext-pro",
      input: { input_image: imageUrl, prompt: prompt },
    }),
  });

  let data = await response.json();

  if (data.error) {
    return Response.json({ error: data.error }, { status: 500 });
  }

  // 2. Polling: cek status sampai selesai (succeeded/failed)
  const getUrl = data.urls.get;

  while (data.status !== "succeeded" && data.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // tunggu 1.5 detik

    const pollResponse = await fetch(getUrl, {
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    data = await pollResponse.json();
  }

  if (data.status === "failed") {
    return Response.json({ error: "Gagal edit foto", detail: data.error }, { status: 500 });
  }

  // 3. Kirim balik URL hasil gambar
  return Response.json({ imageUrl: data.output });
}