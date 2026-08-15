export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-schnell",
      input: { prompt: prompt },
    }),
  });

  let data = await response.json();

  if (data.error) {
    return Response.json({ error: data.error }, { status: 500 });
  }

  const getUrl = data.urls.get;

  while (data.status !== "succeeded" && data.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const pollResponse = await fetch(getUrl, {
      headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` },
    });
    data = await pollResponse.json();
  }

  if (data.status === "failed") {
    return Response.json({ error: "Gagal generate gambar" }, { status: 500 });
  }

  // Model flux-schnell biasanya balikin array URL gambar
  const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

  return Response.json({ imageUrl });
}