import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { transcript, symbol } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Gemini not configured" }, { status: 500 })

    // Use dynamic import and the call style you provided
    // @ts-ignore
    const mod: any = await import("@google/genai")
    const ai = new mod.GoogleGenAI({ apiKey })

    const symbolName = symbol?.name || ""
    const prompt = `You are assisting AAC communication. Given a raw transcript and an optional selected symbol name, output a concise, user-friendly word or short phrase best matching the user's intent. Prefer the symbol name if appropriate. Keep output under 6 words, plain text.\n\nTranscript: "${transcript}"\nSymbol: "${symbolName}"\nOutput only the final word or short phrase, no extra text.`

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

    // Robust fallback: prefer selected symbol name, else transcript first word
    if (!text) {
      if (symbolName) {
        text = symbolName
      } else if (typeof transcript === "string" && transcript.trim().length) {
        text = transcript.trim().split(/\s+/).slice(0, 6).join(" ")
      } else {
        text = ""
      }
    }

    // Sanitize: ensure under 6 words, plain text
    text = text.replace(/[\r\n]+/g, " ").trim().split(/\s+/).slice(0, 6).join(" ")
    return NextResponse.json({ phrase: text })
  } catch (error: any) {
    console.error("[aac/interpret] error", error)
    return NextResponse.json({ error: error?.message || "Failed to interpret" }, { status: 500 })
  }
}
