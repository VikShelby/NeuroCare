import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import AnalyticEmotion from "@/models/AnalyticEmotion"

function validatePayload(body: any) {
  if (!body || typeof body !== "object") return false
  const { emotions, dominant_emotion, analysis_summary } = body
  if (!Array.isArray(emotions) || emotions.length === 0) return false
  for (const item of emotions) {
    if (!item || typeof item !== "object") return false
    if (typeof item.emotion !== "string") return false
    if (typeof item.percentage !== "number") return false
  }
  if (typeof dominant_emotion !== "string") return false
  if (typeof analysis_summary !== "string") return false
  return true
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = await req.json()
    if (!validatePayload(body)) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const userId = body.userId || `rand_${Math.random().toString(36).slice(2)}_${Date.now()}`

    const doc = await AnalyticEmotion.create({
      userId,
      emotions: body.emotions,
      dominant_emotion: body.dominant_emotion,
      analysis_summary: body.analysis_summary,
    })

    return NextResponse.json({ ok: true, emotion: doc }, { status: 201 })
  } catch (err: any) {
    console.error("[EmotionCreate] Error", err)
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 })
  }
}
