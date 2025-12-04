import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Routine from "@/models/Routine"
import User from "@/models/User"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const caree = await User.findOne({ email: session.user.email }).select("_id role")
    if (!caree || caree.role !== "caree") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const routine = await Routine.findOne({ _id: id, careeId: caree._id })
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 })
    }

    // Mark as completed for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!routine.completedDates) {
      routine.completedDates = []
    }

    // Check if already completed today
    const alreadyCompleted = routine.completedDates.some((date: Date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    if (!alreadyCompleted) {
      routine.completedDates.push(today)
      await routine.save()
    }

    return NextResponse.json({ ok: true, routine })
  } catch (e: any) {
    console.error("[routine complete] error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to mark routine as complete" },
      { status: 500 }
    )
  }
}
