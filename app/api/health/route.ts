export async function GET() {
  return Response.json({
    ok: true,
    service: "Premium Harvest",
    timestamp: new Date().toISOString()
  });
}
