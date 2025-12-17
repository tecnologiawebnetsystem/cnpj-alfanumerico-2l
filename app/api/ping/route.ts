export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "API is working!",
  })
}
