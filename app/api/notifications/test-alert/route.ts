import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { addAlert } from "../check-alerts/route"

// POST - Test endpoint to trigger a seizure alert for the logged-in caregiver
// Use this to test the popup without the mobile app
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email }).select("role careeIds")
    
    if (user?.role !== "caregiver") {
      return NextResponse.json({ error: "Only caregivers can test alerts" }, { status: 400 })
    }

    // Get a caree name if available
    let careeName = "Test Caree"
    let careeEmail = "test@example.com"
    
    if (user.careeIds && user.careeIds.length > 0) {
      const caree = await User.findById(user.careeIds[0]).select("name email")
      if (caree) {
        careeName = caree.name || "Your Caree"
        careeEmail = caree.email
      }
    }

    const testAlert = {
      id: `test-${Date.now()}`,
      type: "seizure",
      title: "🚨 SEIZURE ALERT",
      message: `${careeName} may be having a seizure! Immediate assistance may be required.`,
      timestamp: new Date().toISOString(),
      caree: {
        name: careeName,
        email: careeEmail,
      },
    }

    addAlert(session.user.email, testAlert)

    return NextResponse.json({ 
      ok: true, 
      message: "Test alert triggered",
      alert: testAlert 
    })
  } catch (e: any) {
    console.error("[test-alert] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
