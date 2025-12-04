import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { text, voiceId } = await req.json()

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 })
    }

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const selectedVoice = voiceId || "lcMyyd2HUfFzxdCaC4Ta" // fallback voice

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v3",
        optimize_streaming_latency: 0,
      }),
    })

    // Handle errors clearly
    if (!resp.ok) {
      let errText = await resp.text().catch(() => "")
      try {
        const parsed = JSON.parse(errText)
        errText = parsed?.message || errText
      } catch {}

      return NextResponse.json(
        { error: errText || "Failed to generate speech" },
        { status: resp.status }
      )
    }

    // STREAM RESPONSE (best)
    if (resp.body) {
      return new NextResponse(resp.body, {
        headers: { "Content-Type": "audio/mpeg" },
      })
    }

    // Fallback for some environments
    const buffer = Buffer.from(await resp.arrayBuffer())
    return new NextResponse(buffer, {
      headers: { "Content-Type": "audio/mpeg" },
    })

  } catch (error: any) {
    console.error("[aac/synthesize] error", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate speech" },
      { status: 500 }
    )
  }
}
