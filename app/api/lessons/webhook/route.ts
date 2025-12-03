import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Lesson from "@/models/Lesson"
import Routine from "@/models/Routine"

export const dynamic = "force-dynamic"

function computePercent(totalSteps: number, completedSteps: number[]) {
  const total = Math.max(1, totalSteps)
  const done = Array.isArray(completedSteps) ? new Set(completedSteps).size : 0
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const raw = await req.json().catch(() => ({} as any))
    const body = raw && typeof raw === 'object' && 'body' in raw && typeof raw.body === 'object' ? (raw as any).body : raw

    // Support Routine payload shape
    if (body && (body.routineName || body.routineDescription || body.routineTime)) {
      const { userId, routineName, routineDescription, routineTime, additionalData } = body as any
      if (!userId || !routineName) {
        return NextResponse.json({ error: "Missing userId or routineName" }, { status: 400 })
      }

      const routineDoc = await Routine.create({
        caregiverId: userId,
        title: routineName,
        description: routineDescription || undefined,
        time: routineTime || undefined,
        notes: additionalData ? (typeof additionalData === 'string' ? additionalData : JSON.stringify(additionalData)) : undefined,
      })
      return NextResponse.json({ ok: true, routineId: routineDoc._id, routine: routineDoc })
    }

    // Default: Lesson progress payload
    const { step_number, userId, lessonId } = body as any
    console.log(body)
    if (!step_number || !userId || !lessonId) {
      return NextResponse.json(
        { error: "Missing required fields: step_number, userId, or lessonId" },
        { status: 400 }
      )
    }

    const stepIndex = parseInt(step_number, 10) - 1 // Convert 1-based to 0-based index
    if (isNaN(stepIndex) || stepIndex < 0) {
      return NextResponse.json({ error: "Invalid step_number" }, { status: 400 })
    }

    const lesson: any = await Lesson.findOne({ _id: lessonId, userId })
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const progress = lesson.progress || {
      currentStepIndex: 0,
      completedSteps: [],
      percent: 0,
    }
    const now = new Date()

    // Mark step as complete
    const completedSet = new Set<number>(progress.completedSteps as number[])
    completedSet.add(stepIndex)
    progress.completedSteps = Array.from(completedSet).sort((a: number, b: number) => a - b)
    progress.currentStepIndex = Math.max(stepIndex + 1, progress.currentStepIndex)
    progress.updatedAt = now
    if (!progress.startedAt) progress.startedAt = now

    // Compute percent
    let stepsCount = 0
    try {
      const parsed =
        typeof lesson.content === "string"
          ? JSON.parse(lesson.content)
          : lesson.content || {}
      stepsCount = Array.isArray(parsed?.steps) ? parsed.steps.length : 0
    } catch {
      stepsCount = 0
    }

    progress.percent = computePercent(stepsCount, progress.completedSteps)
    if (progress.percent === 100 && !progress.completedAt) {
      progress.completedAt = now
    }

    lesson.progress = progress
    await lesson.save()

    console.log(
      `[webhook] Step ${step_number} completed for lesson ${lessonId} by user ${userId}`
    )

    return NextResponse.json({
      ok: true,
      progress,
      userId,
      lessonId,
    })
  } catch (error: any) {
    console.error("[webhook] error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
