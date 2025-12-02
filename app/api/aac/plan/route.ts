import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Gemini not configured" }, { status: 500 })

    // Pull autism profile for prompt conditioning
    let autismProfile: any = null
    try {
      const session = await getServerSession(authOptions as any)
      if (session?.user?.email) {
        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email }).select("autismProfile role")
        autismProfile = user?.autismProfile || null
      }
    } catch {}

    // Dynamic import using your required client/style
    const mod: any = await import("@google/genai")
    const ai = new mod.GoogleGenAI({ apiKey })
    const prompt = `You are an AAC communication agent. A third person spoke to the caree. Use the transcript and the caree's autism profile (if provided) to infer intent and extract 2–5 concise keywords to search for symbols (SymboTalk/ARASAAC).
Return ONLY JSON: { intent: string, queries: string[], tags: string[] }.

Transcript: ${JSON.stringify(transcript)}
AutismProfile: ${JSON.stringify(autismProfile)}
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
        console.log('[aac/plan] raw output:', text)
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
      // ```json ... ``` block
      const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
      if (fence && fence[1]) {
        const p = tryParse(fence[1].trim())
        if (p) return p
      }
      // Greedy match first { ... last }
      const greedy = t.match(/\{[\s\S]*\}/)
      if (greedy) {
        const p = tryParse(greedy[0])
        if (p) return p
      }
      // Slice between first { and last }
      const fi = t.indexOf('{'); const li = t.lastIndexOf('}')
      if (fi !== -1 && li !== -1 && li > fi) {
        const p = tryParse(t.slice(fi, li + 1))
        if (p) return p
      }
      return null
    }

    let parsed: any = extractJson(text) ?? { intent: "", queries: [], tags: [] }

    const intent = typeof parsed.intent === 'string' ? parsed.intent : ''
    const queries = Array.isArray(parsed.queries) ? parsed.queries.filter((q: any) => typeof q === 'string').slice(0, 6) : []
    const tags = Array.isArray(parsed.tags) ? parsed.tags.filter((t: any) => typeof t === 'string').slice(0, 6) : []
    console.log('[aac/plan] intent:', intent, 'queries:', queries, 'tags:', tags)
    return NextResponse.json({ intent, queries, tags })
  } catch (error: any) {
    console.error('[aac/plan] error', error)
    return NextResponse.json({ error: error?.message || 'Failed to plan AAC queries' }, { status: 500 })
  }
}
