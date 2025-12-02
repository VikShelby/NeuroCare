import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, candidates } = body || {}
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Gemini not configured" }, { status: 500 })

    // Fetch current user's autism profile to condition Gemini
    let autismProfile: any = null
    try {
      const session = await getServerSession(authOptions as any)
      if (session?.user?.email) {
        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email }).select("autismProfile role")
        autismProfile = user?.autismProfile || null
      }
    } catch {}

    // @ts-ignore dynamic import per required pattern
    const mod: any = await import("@google/genai")
    const ai = new mod.GoogleGenAI({ apiKey })

    const prompt = `You are an AAC communication assistant. A third person spoke; we transcribed their message (transcript). We also searched symbol libraries and got many symbol candidates. Based on the transcript and (if present) the caree's autism profile, choose the best 6 symbol options to show.

Return ONLY JSON: { selected: Array<{ name: string, image_url?: string, alt_url?: string, repo_key?: string, score?: number }> }
Guidelines:
- Prefer concrete, literal symbols matching the likely need.
- Avoid duplicates; prefer higher score and clearer images.
- Keep order by overall suitability.

transcript: ${JSON.stringify(transcript)}
autismProfile: ${JSON.stringify(autismProfile)}
candidates: ${JSON.stringify(candidates).slice(0, 10000)} // truncated if huge
`

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

    // Robustly extract JSON even if wrapped in code fences or extra text
    const tryParse = (s: string) => { try { return JSON.parse(s) } catch { return null } }
    const extractJson = (raw: string) => {
      if (!raw) return null
      const t = raw.trim()
      const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
      if (fence && fence[1]) {
        const p = tryParse(fence[1].trim())
        if (p) return p
      }
      const greedy = t.match(/\{[\s\S]*\}/)
      if (greedy) {
        const p = tryParse(greedy[0])
        if (p) return p
      }
      const fi = t.indexOf('{'); const li = t.lastIndexOf('}')
      if (fi !== -1 && li !== -1 && li > fi) {
        const p = tryParse(t.slice(fi, li + 1))
        if (p) return p
      }
      return null
    }

    let parsed: any = extractJson(text) ?? { selected: [] }
    const selected = Array.isArray(parsed.selected) ? parsed.selected.slice(0, 6) : []
    return NextResponse.json({ selected })
  } catch (error: any) {
    console.error('[aac/filter] error', error)
    return NextResponse.json({ error: error?.message || 'Failed to filter symbols' }, { status: 500 })
  }
}
