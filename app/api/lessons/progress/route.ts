import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Lesson from "@/models/Lesson"
import Preferences from "@/models/Preferences"

export const dynamic = "force-dynamic"

function computePercent(totalSteps: number, completedSteps: number[]) {
  const total = Math.max(1, totalSteps)
  const done = Array.isArray(completedSteps) ? new Set(completedSteps).size : 0
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectToDatabase()

  const { lessonId, action, stepIndex, totalSteps } = await req.json()
  if (!lessonId || !action) return NextResponse.json({ error: "Missing lessonId or action" }, { status: 400 })

  const lesson: any = await Lesson.findById(lessonId)
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  if (String(lesson.userId) !== String((session.user as any).id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const progress = lesson.progress || { currentStepIndex: 0, completedSteps: [], percent: 0 }
  const now = new Date()

  switch (action) {
    case 'voice-start':
      progress.startedAt = progress.startedAt || now
      progress.updatedAt = now
      break
    case 'voice-end':
      progress.updatedAt = now
      break
    case 'step-start': {
      const idx = typeof stepIndex === 'number' ? stepIndex : progress.currentStepIndex
      progress.currentStepIndex = Math.max(0, idx)
      progress.updatedAt = now
      break
    }
    case 'step-complete': {
      const idx = typeof stepIndex === 'number' ? stepIndex : progress.currentStepIndex
      const set = new Set<number>(progress.completedSteps as number[])
      set.add(Math.max(0, idx))
      progress.completedSteps = Array.from(set).sort((a: number, b: number) => a - b)
      progress.currentStepIndex = Math.max(idx + 1, progress.currentStepIndex)
      progress.updatedAt = now
      break
    }
    case 'pause':
    case 'resume':
      progress.updatedAt = now
      break
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  const stepsCount = typeof totalSteps === 'number' ? totalSteps : (() => {
    try {
      const parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content || {}
      return Array.isArray(parsed?.steps) ? parsed.steps.length : 0
    } catch {
      return 0
    }
  })()

  progress.percent = computePercent(stepsCount, progress.completedSteps)
  if (progress.percent === 100 && !progress.completedAt) progress.completedAt = now
  console.log("[lessons/progress] computed progress percent:", progress.percent)
  lesson.progress = progress
  await lesson.save()

  return NextResponse.json({ ok: true, progress })
}

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectToDatabase()

  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get("lessonId")
  const userId = (session.user as any).id

  let lesson: any = null
  if (lessonId) {
    lesson = await Lesson.findOne({ _id: lessonId, userId }).lean()
  } else {
    const pref = await Preferences.findOne({ userId }).lean()
    if (pref?.currentLessonId) {
      lesson = await Lesson.findOne({ _id: pref.currentLessonId, userId }).lean()
    }
    if (!lesson) {
      lesson = await Lesson.findOne({ userId }).sort({ createdAt: -1 }).lean()
    }
  }

  if (!lesson) return NextResponse.json({ progress: null, lessonId: null })

  // Ensure progress shape and compute percent based on content steps
  const progress = (lesson as any).progress || { currentStepIndex: 0, completedSteps: [], percent: 0 }
  let stepsCount = 0
  try {
    const parsed = typeof (lesson as any).content === 'string' ? JSON.parse((lesson as any).content) : ((lesson as any).content || {})
    stepsCount = Array.isArray(parsed?.steps) ? parsed.steps.length : 0
  } catch {
    stepsCount = 0
  }
  progress.percent = computePercent(stepsCount, progress.completedSteps || [])

  return NextResponse.json({ progress, lessonId: (lesson as any)._id, stepsCount })
}
