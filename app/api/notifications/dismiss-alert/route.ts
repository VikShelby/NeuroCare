import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { removeAlert } from "../check-alerts/route"

// POST - Dismiss an alert
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { alertId } = await req.json()

    if (alertId) {
      removeAlert(session.user.email, alertId)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[dismiss-alert] error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
