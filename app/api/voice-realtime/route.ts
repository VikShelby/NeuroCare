import type { NextRequest } from "next/server"

export const runtime = "edge"

// NOTE: Edge runtime can open outbound WebSocket connections to external services.
// This route is a placeholder scaffold. In production, implement full WS proxy:
// - Upgrade incoming request to a WebSocket
// - Connect to ElevenLabs Realtime WS with API key auth
// - Pipe binary audio from client -> ElevenLabs, and ElevenLabs -> client
// - Forward assistant text events as JSON messages

export async function GET(req: NextRequest) {
  return new Response("WebSocket required", { status: 400 })
}

export async function POST(req: NextRequest) {
  return new Response("WebSocket required", { status: 400 })
}
