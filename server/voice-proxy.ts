// Lightweight WebSocket proxy to ElevenLabs Realtime
// Run separately from Next.js: `node server/voice-proxy.js` (after transpile) or ts-node

import WebSocket, { WebSocketServer } from "ws"
import http from "http"

const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY_OVERRIDE
const ELEVEN_REALTIME_URL = process.env.ELEVENLABS_REALTIME_URL || "wss://api.elevenlabs.io/v1/realtime"
const PORT = Number(process.env.VOICE_PROXY_PORT || 8787)

if (!ELEVEN_KEY) {
  console.error("Missing ELEVENLABS_API_KEY. Set it in .env.local before starting proxy.")
}

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", async (client) => {
  let upstream: WebSocket | null = null
  try {
    upstream = new WebSocket(ELEVEN_REALTIME_URL, {
      headers: {
        "xi-api-key": ELEVEN_KEY as string,
      },
    })

    upstream.on("open", () => {
      // Optionally send init config (voice/agent) if API supports it
      // upstream?.send(JSON.stringify({ type: "init", voice_id: process.env.ELEVENLABS_VOICE_ID }))
    })

    upstream.on("message", (data) => {
      // Forward assistant text/audio back to browser
      try {
        if (Buffer.isBuffer(data)) {
          client.send(data)
        } else {
          client.send(data as WebSocket.RawData)
        }
      } catch {}
    })

    upstream.on("close", () => {
      try { client.close() } catch {}
    })
    upstream.on("error", (err) => {
      console.error("Upstream error:", err)
      try { client.close() } catch {}
    })

    client.on("message", (data) => {
      // Browser sends audio Blob chunks or JSON user_text
      if (upstream && upstream.readyState === WebSocket.OPEN) {
        upstream.send(data)
      }
    })

    client.on("close", () => {
      try { upstream?.close() } catch {}
    })
    client.on("error", () => {
      try { upstream?.close() } catch {}
    })
  } catch (e) {
    console.error("Proxy connection error:", e)
    try { client.close() } catch {}
  }
})

server.listen(PORT, () => {
  console.log(`Voice proxy listening on ws://localhost:${PORT}`)
})
