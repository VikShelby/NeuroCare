import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { addAlert } from "../check-alerts/route"

// POST - Seizure/emergency alert from mobile app
// Finds the caree by deviceId and returns their caregiver info for alert
export async function POST(req: NextRequest) {
  try {
    const { deviceId, alertType = "seizure" } = await req.json()
    console.log("[alert] Received alert request:", { deviceId, alertType })

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find the caree by their registered deviceId
    const caree = await User.findOne({ deviceId }).select("name email role caregiverId")
    console.log("[alert] Found caree:", caree?.email, "role:", caree?.role)

    if (!caree) {
      return NextResponse.json({ 
        error: "No user found with this device ID. Please register first." 
      }, { status: 404 })
    }

    if (caree.role !== "caree") {
      return NextResponse.json({ 
        error: "This device is not registered to a caree account" 
      }, { status: 400 })
    }

    // Get the caregiver
    if (!caree.caregiverId) {
      console.log("[alert] Caree has no caregiverId")
      return NextResponse.json({ 
        error: "This caree has no linked caregiver",
        caree: {
          name: caree.name,
          email: caree.email,
        }
      }, { status: 400 })
    }

    const caregiver = await User.findById(caree.caregiverId).select("name email deviceId")
    console.log("[alert] Found caregiver:", caregiver?.email)

    if (!caregiver) {
      return NextResponse.json({ 
        error: "Caregiver not found",
        caree: {
          name: caree.name,
          email: caree.email,
        }
      }, { status: 404 })
    }

    // Build the alert message
    const alertMessages: Record<string, { title: string; message: string }> = {
      seizure: {
        title: "🚨 SEIZURE ALERT",
        message: `${caree.name || "Your caree"} may be having a seizure! Immediate assistance may be required.`,
      },
      fall: {
        title: "⚠️ FALL DETECTED",
        message: `${caree.name || "Your caree"} has fallen. Please check on them.`,
      },
      emergency: {
        title: "🆘 EMERGENCY",
        message: `${caree.name || "Your caree"} needs immediate help!`,
      },
    }

    const alertInfo = alertMessages[alertType] || alertMessages.seizure

    // Create the full alert object
    const fullAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: alertType,
      title: alertInfo.title,
      message: alertInfo.message,
      timestamp: new Date().toISOString(),
      caree: {
        name: caree.name,
        email: caree.email,
      },
    }

    // Store alert for the caregiver to poll
    console.log("[alert] Storing alert for caregiver:", caregiver.email)
    addAlert(caregiver.email, fullAlert)

    return NextResponse.json({
      ok: true,
      alert: fullAlert,
      caree: {
        name: caree.name,
        email: caree.email,
      },
      caregiver: {
        name: caregiver.name,
        email: caregiver.email,
        deviceId: caregiver.deviceId || null,
      },
    })
  } catch (e: any) {
    console.error("[notifications/alert] error:", e)
    return NextResponse.json({ error: e.message || "Failed to send alert" }, { status: 500 })
  }
}
