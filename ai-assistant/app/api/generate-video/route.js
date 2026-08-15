export async function POST(req) {
  const { imageUrl, prompt } = await req.json();

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "minimax/video-01",
      input: {
        prompt: prompt,
        first_frame_image: imageUrl,
      },
    }),
  });

  const data = await response.json();

  if (data.error) {
    return Response.json({ error: data.error }, { status: 500 });
  }

  // Kirim balik ID prediksi dan URL untuk cek status
  return Response.json({
    predictionId: data.id,
    getUrl: data.urls.get,
  });
}