import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import SignOutButton from "./SignOutButton"

const stat = (label: string, value: string, sub?: string) => (
  <Card className="p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
    {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
  </Card>
)

export default async function CaregiverDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (!(session.user as any)?.profileCompleted) redirect("/onboarding/role")
  if ((session.user as any).role !== "caregiver") redirect("/dashboard")

  await connectToDatabase()
  const caregiver = await User.findOne({ email: session.user.email }).select("_id role careeIds")
  const ids = Array.isArray(caregiver?.careeIds) ? caregiver!.careeIds : []
  const carees = await User.find({ $or: [ { _id: { $in: ids } }, { caregiverId: caregiver?._id } ] })
    .select("_id name email")
    .limit(6)
    .lean()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Caregiver Overview</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/caregiver/routines"><Button variant="outline" size="sm">Routines</Button></Link>
          <Link href="/dashboard/caregiver/lessons"><Button variant="outline" size="sm">Lessons</Button></Link>
          <Link href="/dashboard/caregiver/carees"><Button variant="outline" size="sm">Carees</Button></Link>
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stat("Active carees", "6")}
        {stat("Today routines", "14", "9 completed")}
        {stat("Lesson sessions", "3", "2 in progress")}
        {stat("Alerts", "0", "All clear")}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium mb-2">Recent Activity</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>08:30 — Morning routine completed (Alex)</li>
            <li>09:15 — Language lesson started (Maya)</li>
            <li>10:05 — AAC communication used (Eli)</li>
          </ul>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium mb-2">Upcoming</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>11:00 — Sensory break (Noah)</li>
            <li>13:00 — Social skills lesson (Maya)</li>
            <li>15:30 — Walk routine (Alex)</li>
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Your Carees</div>
          <Link href="/dashboard/caregiver/carees" className="text-xs text-muted-foreground hover:underline">View all</Link>
        </div>
        {(!carees || carees.length === 0) ? (
          <div className="text-sm text-muted-foreground">No carees linked yet. Add one from the Carees page.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {carees.map((c: any) => (
              <li key={String(c._id)} className="rounded border p-3">
                <div className="text-sm font-medium">{c.name || c.email}</div>
                <div className="text-xs text-muted-foreground">{c.email}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
