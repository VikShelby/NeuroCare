import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { transcript, symbol, symbols } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Gemini not configured" }, { status: 500 })

    // @ts-ignore
    const mod: any = await import("@google/genai")
    const ai = new mod.GoogleGenAI({ apiKey })

    // Support both single symbol and multiple symbols
    const symbolNames = symbols 
      ? (Array.isArray(symbols) ? symbols : [symbols])
      : (symbol?.name ? [symbol.name] : [])
    
    const symbolList = symbolNames.join(", ")

    const prompt = `You are assisting AAC (Augmentative and Alternative Communication) for someone who may have difficulty speaking.

Given a raw voice transcript and selected AAC symbols, create a clear, natural-sounding phrase that communicates what the person wants to say.

Rules:
- Combine the transcript meaning with the selected symbols
- Make it sound natural and conversational
- Keep it concise (under 10 words)
- Output ONLY the final phrase, no explanations

Transcript: "${transcript}"
Selected symbols: ${symbolList || "none"}

Final phrase:`

    const contents = [{ role: 'user', parts: [{ text: prompt }] }]

    const modelFallbacks = ['gemini-2.0-flash']
    let text = ''
    let lastErr: any = null
    for (const model of modelFallbacks) {
      try {
        const stream: any = await ai.models.generateContentStream({ model, contents })
        for await (const chunk of stream) {
          if (chunk?.text) text += chunk.text
        }
        text = text.trim()
        if (text) break
      } catch (e:any) {
        lastErr = e
        text = ''
        continue
      }
    }
    if (!text && lastErr) throw lastErr

    // Fallback: use symbols or transcript
    if (!text) {
      if (symbolNames.length > 0) {
        text = symbolNames.join(" ")
      } else if (typeof transcript === "string" && transcript.trim().length) {
        text = transcript.trim().split(/\s+/).slice(0, 8).join(" ")
      } else {
        text = ""
      }
    }

    // Clean up
    text = text.replace(/[\r\n]+/g, " ").replace(/^["']|["']$/g, "").trim()
    return NextResponse.json({ phrase: text })
  } catch (error: any) {
    console.error("[aac/interpret] error", error)
    return NextResponse.json({ error: error?.message || "Failed to interpret" }, { status: 500 })
  }
}
