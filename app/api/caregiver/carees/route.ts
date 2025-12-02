import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    console.log("[caregiver/carees][GET] session user email:", session)
    await connectToDatabase()
    const caregiverEmail = String(session.user.email).trim()
    const caregiver = await User.findOne({ email: new RegExp(`^${escapeRegex(caregiverEmail)}$`, 'i') }).select("_id role careeIds")
    if (!caregiver) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (caregiver.role !== "caregiver") return NextResponse.json({ error: "Forbidden: account role is not caregiver" }, { status: 403 })
    console.log("[caregiver/carees][GET] caregiver:", JSON.stringify(caregiver))
    const ids = Array.isArray(caregiver.careeIds) ? caregiver.careeIds : []
    const byIdList = await User.find({ _id: { $in: ids } }).select("_id name email caregiverId").limit(200)
    const byCaregiverId = await User.find({ caregiverId: caregiver._id }).select("_id name email caregiverId").limit(200)
    const merged = [...byIdList, ...byCaregiverId].filter((v, i, a) => a.findIndex(x => String(x._id) === String(v._id)) === i)
    console.log("[caregiver/carees][GET] found carees:", merged.length, "byId:", byIdList.length, "byCaregiverId:", byCaregiverId.length)
    return NextResponse.json({ carees: merged, count: merged.length })
  } catch (error: any) {
    console.error("[caregiver/carees][GET]", error)
    return NextResponse.json({ error: error?.message || "Failed to list carees" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { email } = await req.json().catch(() => ({}))
    if (!email || typeof email !== 'string') return NextResponse.json({ error: "Missing caree email" }, { status: 400 })
    const inputEmail = String(email).trim()

    await connectToDatabase()
    const caregiver = await User.findOne({ email: new RegExp(`^${escapeRegex(String(session.user.email).trim())}$`, 'i') }).select("_id role careeIds")
    console.log("[caregiver/carees][POST] caregiver:", JSON.stringify(caregiver), "adding caree email:", inputEmail)
    if (!caregiver) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (caregiver.role !== "caregiver") return NextResponse.json({ error: "Forbidden: account role is not caregiver" }, { status: 403 })

    const caree = await User.findOne({ email: new RegExp(`^${escapeRegex(inputEmail)}$`, 'i') }).select("_id role caregiverId name email")
    if (!caree) return NextResponse.json({ error: "Caree not found" }, { status: 404 })
    if (String(caree._id) === String(caregiver._id)) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })
    // Allow linking any user account; set role to 'caree' on link
    if (caree.caregiverId && String(caree.caregiverId) !== String(caregiver._id)) {
      return NextResponse.json({ error: "Caree is already linked to another caregiver" }, { status: 409 })
    }
   
    // Link both sides
    
    console.log("Attempting to link...")
    console.log("Caregiver ID:", caregiver._id)
    console.log("Caree ID:", caree._id)

    // 1. Update Caree
    const careeUpdate = await User.updateOne(
      { _id: caree._id }, 
      { $set: { caregiverId: caregiver._id, role: "caree" } }
    )
    console.log("Caree Update Result:", careeUpdate) 
    // ^^^ LOOK AT THIS LOG. 
    // If modifiedCount is 0, your Schema is blocking the field or the ID format is wrong.

    // 2. Update Caregiver
    const caregiverUpdate = await User.updateOne(
      { _id: caregiver._id }, 
      { $addToSet: { careeIds: caree._id } }
    )
    console.log("Caregiver Update Result:", caregiverUpdate)
    // Re-read caregiver to ensure fresh careeIds
    const refreshedCaregiver = await User.findById(caregiver._id).select("careeIds")
    // Return updated list snapshot for convenience
    const updatedCarees = await User.find({ $or: [ { _id: { $in: [...(refreshedCaregiver?.careeIds || []), caree._id] } }, { caregiverId: caregiver._id } ] })
      .select("_id name email")
      .limit(200)
    return NextResponse.json({ ok: true, caree: { _id: caree._id, name: caree.name, email: caree.email }, carees: updatedCarees })
  } catch (error: any) {
    console.error("[caregiver/carees][POST]", error)
    return NextResponse.json({ error: error?.message || "Failed to add caree" }, { status: 500 })
  }
}
