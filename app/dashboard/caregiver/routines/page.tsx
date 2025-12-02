import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { headers } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import  User  from "@/models/User"
import Routine from "@/models/Routine"

type Routine = {
  _id: string
  title: string
  description?: string
  time?: string | { start?: string; end?: string }
  frequency?: string
  importance?: number
  flexibility?: number | string
  notes?: string
  caree?: { _id: string; name?: string; email?: string } | null
}

async function fetchRoutines(): Promise<Routine[]> { 
  const session = await getServerSession(authOptions as any) 
  if (!session?.user?.email) return [] 
  await connectToDatabase() 
  const caregiver = await User.findOne({ email: session.user.email }).select('_id role') 
  if (!caregiver || caregiver.role !== 'caregiver') return [] 
  const docs = await Routine.find({ caregiverId: caregiver._id }).sort({ createdAt: -1 }).limit(200) 
  return docs as any 
  
}

export default async function CaregiverRoutines() {
  const routines = await fetchRoutines()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Routines</h1>
        <Button asChild size="sm" variant="outline"><Link href="/dashboard/caregiver/routines/new">New Routine</Link></Button>
      </div>
      {routines.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">No routines yet. Create your first routine.</Card>
      ) : (
        <div className="grid gap-3">
          {routines.map((r) => {
            const careeLabel = r.caree?.name || r.caree?.email || r.caree?._id || 'Unassigned'
            const timeLabel = typeof r.time === 'string' ? r.time : (r.time?.start || '')
            return (
              <Card key={r._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {careeLabel} {timeLabel && `• ${timeLabel}`} {r.frequency && `• ${r.frequency}`}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Importance: {r.importance ?? '—'}</div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
