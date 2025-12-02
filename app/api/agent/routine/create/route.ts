import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Routine from "@/models/Routine"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = await req.json()
    const {
      userId,
      routineName,
      routineDescription,
      routineTime,
      additionalData,
    } = body || {}

    if (!userId || !routineName) {
      return NextResponse.json({ ok: false, error: "Missing required fields: userId, routineName" }, { status: 400 })
    }

    const doc = await Routine.create({
      userId,
      routineName,
      routineDescription,
      routineTime,
      additionalData,
    })

    return NextResponse.json({ ok: true, routine: doc }, { status: 201 })
  } catch (err: any) {
    console.error("[RoutineCreate] Error", err)
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 })
  }
}
