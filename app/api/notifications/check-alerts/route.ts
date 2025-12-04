import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

// In-memory store for active alerts (in production, use Redis or database)
// Map of caregiver email -> array of alerts
declare global {
  var activeAlerts: Map<string, any[]> | undefined;
}

if (!global.activeAlerts) {
  global.activeAlerts = new Map();
  console.log("[alerts] Initialized global.activeAlerts Map");
}

export function addAlert(caregiverEmail: string, alert: any) {
  console.log("[alerts] Adding alert for:", caregiverEmail, alert.id);
  const alerts = global.activeAlerts!.get(caregiverEmail) || [];
  alerts.push(alert);
  global.activeAlerts!.set(caregiverEmail, alerts);
  console.log("[alerts] Total alerts for", caregiverEmail, ":", alerts.length);
}

export function getAlerts(caregiverEmail: string) {
  const alerts = global.activeAlerts!.get(caregiverEmail) || [];
  console.log("[alerts] Getting alerts for:", caregiverEmail, "found:", alerts.length);
  return alerts;
}

export function removeAlert(caregiverEmail: string, alertId: string) {
  const alerts = global.activeAlerts!.get(caregiverEmail) || [];
  const filtered = alerts.filter(a => a.id !== alertId);
  global.activeAlerts!.set(caregiverEmail, filtered);
}

// GET - Check for new alerts (polled by caregiver dashboard)
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      console.log("[check-alerts] No session");
      return NextResponse.json({ alerts: [] })
    }

    console.log("[check-alerts] Checking for:", session.user.email);

    await connectToDatabase()

    // Verify user is a caregiver
    const user = await User.findOne({ email: session.user.email }).select("role")
    if (user?.role !== "caregiver") {
      console.log("[check-alerts] User is not caregiver:", user?.role);
      return NextResponse.json({ alerts: [] })
    }

    const alerts = getAlerts(session.user.email)
    console.log("[check-alerts] Returning", alerts.length, "alerts");

    return NextResponse.json({ alerts })
  } catch (e: any) {
    console.error("[check-alerts] error:", e)
    return NextResponse.json({ alerts: [] })
  }
}
