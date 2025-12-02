import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Routine from "@/models/Routine"
import User from "@/models/User"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const caregiver = await User.findOne({ email: session.user.email }).select('_id role')
    if (!caregiver || caregiver.role !== 'caregiver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const routines = await Routine.find({ caregiverId: caregiver._id }).sort({ createdAt: -1 }).limit(200)
    return NextResponse.json({ routines })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list routines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const { title, description, time, frequency, importance, associatedActivities, flexibility, notes, careeId } = body
    if (!title || typeof title !== 'string') return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    await connectToDatabase()
    const caregiver = await User.findOne({ email: session.user.email }).select('_id role')
    if (!caregiver || caregiver.role !== 'caregiver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const doc = await Routine.create({
      title,
      description,
      time,
      frequency,
      importance,
      associatedActivities,
      flexibility,
      notes,
      caregiverId: caregiver._id,
      careeId: careeId || undefined,
    })
    return NextResponse.json({ ok: true, routine: doc })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create routine' }, { status: 500 })
  }
}
