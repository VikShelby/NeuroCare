import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Routine from "@/models/Routine"
import User from "@/models/User"

type Routine = {
  _id: string
  title: string
  description?: string
  time?: string | { start?: string; end?: string }
  frequency?: string
  importance?: number
  flexibility?: number | string
  notes?: string
}

async function fetchCareeRoutines(): Promise<Routine[]> {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.email) return []
  await connectToDatabase()
  const caree = await User.findOne({ email: session.user.email }).select('_id role caregiverId')
  if (!caree || caree.role !== 'caree' || !caree.caregiverId) return []
  const docs = await Routine.find({ caregiverId: caree.caregiverId, careeId: caree._id }).sort({ createdAt: -1 }).limit(200)
  return docs as any
}

export default async function CareeRoutinesPage() {
  const routines = await fetchCareeRoutines()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Routines</h1>
        <Button asChild size="sm" variant="outline"><Link href="/dashboard/caree/routines/new">Add Routine</Link></Button>
      </div>
      {routines.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">No routines yet. Add one.</Card>
      ) : (
        <div className="grid gap-3">
          {routines.map(r => {
            const timeLabel = typeof r.time === 'string' ? r.time : (r.time?.start || '')
            return (
              <Card key={r._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{timeLabel} {r.frequency && `• ${r.frequency}`}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Importance: {r.importance ?? '—'}</div>
                </div>
                {r.description && <div className="mt-2 text-xs">{r.description}</div>}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
