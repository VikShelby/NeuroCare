import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Routine from "@/models/Routine"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || undefined
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)))

    const filter: Record<string, any> = {}
    if (userId) filter.userId = userId

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Routine.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Routine.countDocuments(filter),
    ])

    return NextResponse.json({
      ok: true,
      page,
      limit,
      total,
      items,
    })
  } catch (err: any) {
    console.error("[RoutineList] Error", err)
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 })
  }
}
