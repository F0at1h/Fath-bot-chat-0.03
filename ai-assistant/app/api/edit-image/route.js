export async function POST(req) {
  const { imageUrl, prompt } = await req.json();

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

  const data = await response.json();
  return Response.json(data);
}