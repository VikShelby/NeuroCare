import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Preferences from "@/models/Preferences"
import Lesson from "@/models/Lesson"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { lessonId } = await req.json().catch(() => ({}))

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 })
  }

  await connectToDatabase()

  // Verify lesson exists and belongs to user
  const lesson = await Lesson.findOne({ _id: lessonId, userId })
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  // Update current lesson pointer
  await Preferences.findOneAndUpdate(
    { userId },
    { $set: { currentLessonId: lessonId } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true, lessonId })
}
