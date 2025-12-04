import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

// POST - Send message to a user's device
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, message, title, data } = await req.json()

    if (!email || !message) {
      return NextResponse.json(
        { error: "email and message are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Get target user's deviceId
    const targetUser = await User.findOne({ email }).select("deviceId name")
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!targetUser.deviceId) {
      return NextResponse.json(
        { error: "User has no registered device" },
        { status: 400 }
      )
    }

    // Return the deviceId and message to send
    return NextResponse.json({
      ok: true,
      deviceId: targetUser.deviceId,
      recipient: targetUser.name,
      notification: {
        title: title || "NeuroCare",
        message,
        data: data || {},
      },
    })
  } catch (e: any) {
    console.error("[notifications/send] error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to send notification" },
      { status: 500 }
    )
  }
}
