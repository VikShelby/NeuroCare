import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Preferences from "@/models/Preferences";
import Lesson from "@/models/Lesson";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const userId = (session.user as any).id;
  const pref = await Preferences.findOne({ userId }).lean();
  let lesson = null as any;
  if (pref?.currentLessonId) {
    lesson = await Lesson.findOne({ _id: pref.currentLessonId, userId }).lean();
  }
  if (!lesson) {
    lesson = await Lesson.findOne({ userId }).sort({ createdAt: -1 }).lean();
  }
  // Ensure progress is present with sane defaults and computed percent
  if (lesson) {
    const progress = (lesson as any).progress || { currentStepIndex: 0, completedSteps: [], percent: 0 };
    console.log("[lessons/current] existing progress:", progress);
    let stepsCount = 0;
    try {
      const parsed = typeof (lesson as any).content === 'string' ? JSON.parse((lesson as any).content) : ((lesson as any).content || {});
      stepsCount = Array.isArray(parsed?.steps) ? parsed.steps.length : 0;
    } catch { stepsCount = 0; }
    const total = Math.max(1, stepsCount);
    const done = new Set((progress.completedSteps || []) as number[]).size;
    progress.percent = typeof progress.percent === 'number' ? progress.percent : Math.max(0, Math.min(100, Math.round((done / total) * 100)));
    console.log("[lessons/current] computed progress percent:", progress.percent);
    (lesson as any).progress = progress;
  }
  return NextResponse.json({ lesson: lesson || null, currentLessonId: pref?.currentLessonId || null });
}

const activateSchema = z.object({ lessonId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const userId = (session.user as any).id;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Two modes: activate current lesson, or update progress
  if (typeof body.action === "string") {
    const { action, lessonId, stepIndex, totalSteps } = body as any;
    if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    const lesson: any = await Lesson.findOne({ _id: lessonId, userId });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const progress = lesson.progress || { currentStepIndex: 0, completedSteps: [], percent: 0 };
    const now = new Date();

    switch (action) {
      case "voice-start":
        progress.startedAt = progress.startedAt || now;
        progress.updatedAt = now;
        break;
      case "voice-end":
        progress.updatedAt = now;
        break;
      case "step-start": {
        const idx = typeof stepIndex === "number" ? stepIndex : progress.currentStepIndex;
        progress.currentStepIndex = Math.max(0, idx);
        progress.updatedAt = now;
        break;
      }
      case "step-complete": {
        const idx = typeof stepIndex === "number" ? stepIndex : progress.currentStepIndex;
        const set = new Set<number>(progress.completedSteps as number[]);
        set.add(Math.max(0, idx));
        progress.completedSteps = Array.from(set).sort((a: number, b: number) => a - b);
        progress.currentStepIndex = Math.max(idx + 1, progress.currentStepIndex);
        progress.updatedAt = now;
        break;
      }
      case "pause":
      case "resume":
        progress.updatedAt = now;
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Compute percent
    let stepsCount = 0;
    if (typeof totalSteps === "number") {
      stepsCount = totalSteps;
    } else {
      try {
        const parsed = typeof lesson.content === "string" ? JSON.parse(lesson.content) : (lesson.content || {});
        stepsCount = Array.isArray(parsed?.steps) ? parsed.steps.length : 0;
      } catch {
        stepsCount = 0;
      }
    }
    const total = Math.max(1, stepsCount);
    const done = new Set(progress.completedSteps as number[]).size;
    progress.percent = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
    if (progress.percent === 100 && !progress.completedAt) progress.completedAt = now;

    lesson.progress = progress;
    await lesson.save();
    return NextResponse.json({ ok: true, progress });
  }

  // Default: activate current lesson by id
  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { lessonId } = parsed.data;
  const owned = await Lesson.findOne({ _id: lessonId, userId }).select({ _id: 1 }).lean();
  if (!owned) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  await Preferences.findOneAndUpdate(
    { userId },
    { $set: { currentLessonId: owned._id } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, currentLessonId: lessonId });
}
