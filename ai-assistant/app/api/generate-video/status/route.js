export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const getUrl = searchParams.get("getUrl");

  if (!getUrl) {
    return Response.json({ error: "getUrl wajib diisi" }, { status: 400 });
  }

  const response = await fetch(getUrl, {
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });

  const data = await response.json();

  return Response.json({
    status: data.status,
    output: data.output,
    error: data.error,
  });
}