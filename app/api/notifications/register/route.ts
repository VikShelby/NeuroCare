import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

// POST - Register device ID for seizure detection app
// Can be called from mobile app (with email) or web app (with session)
export async function POST(req: NextRequest) {
  try {
    const { deviceId, email } = await req.json()

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 })
    }

    await connectToDatabase()

    let userEmail = email

    // If no email provided, try to get from session (web app flow)
    if (!userEmail) {
      const session: any = await getServerSession(authOptions as any)
      if (!session?.user?.email) {
        return NextResponse.json({ error: "email is required" }, { status: 400 })
      }
      userEmail = session.user.email
    }

    // Find the caree by email and update their deviceId
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { deviceId },
      { new: true }
    ).select("name email role caregiverId")

    if (!user) {
      return NextResponse.json({ error: "User not found with this email" }, { status: 404 })
    }

    // Check if user is a caree and has a caregiver
    let caregiverInfo = null
    if (user.role === "caree" && user.caregiverId) {
      const caregiver = await User.findById(user.caregiverId).select("name email")
      if (caregiver) {
        caregiverInfo = {
          name: caregiver.name,
          email: caregiver.email,
        }
      }
    }

    return NextResponse.json({
      ok: true,
      deviceId,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      caregiver: caregiverInfo,
    })
  } catch (e: any) {
    console.error("[notifications/register] error:", e)
    return NextResponse.json({ error: e.message || "Failed to register device" }, { status: 500 })
  }
}

