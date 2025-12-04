import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Routine from "@/models/Routine"
import { Plus, Clock, Calendar, CheckCircle2 } from "lucide-react"

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
  const session = await getServerSession(authOptions as any) as { user?: { email?: string } } | null
  if (!session?.user?.email) return []
  await connectToDatabase()
  const caregiver = await User.findOne({ email: session.user.email }).select('_id role')
  if (!caregiver || caregiver.role !== 'caregiver') return []
  const docs = await Routine.find({ caregiverId: caregiver._id }).sort({ createdAt: -1 }).limit(200)
  return docs as any

}

export default async function CaregiverRoutines() {
  const routines = await fetchRoutines()

  // Group routines by frequency
  const dailyRoutines = routines.filter(r => r.frequency === 'daily')

  return (
    <div className="pb-24">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-black mb-1">Routines</h1>
            <p className="text-sm text-black/50">{routines.length} total routines</p>
          </div>
          <Button asChild className="bg-black text-white hover:bg-black/80">
            <Link href="/dashboard/caregiver/routines/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Routine
            </Link>
          </Button>
        </div>

        {routines.length === 0 ? (
          <div className="bg-white rounded-xl border border-black/5 p-12 text-center">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-black/30" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No routines yet</h3>
            <p className="text-sm text-black/50 mb-6">Create your first routine to get started</p>
            <Button asChild className="bg-black text-white hover:bg-black/80">
              <Link href="/dashboard/caregiver/routines/new">
                <Plus className="w-4 h-4 mr-2" /> Create Routine
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-black">{routines.length}</div>
                    <div className="text-xs text-black/50">Total Routines</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-black">{dailyRoutines.length}</div>
                    <div className="text-xs text-black/50">Daily Routines</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-black">87%</div>
                    <div className="text-xs text-black/50">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Routines List */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5">
                <h2 className="text-sm font-medium text-black">All Routines</h2>
              </div>
              <div className="divide-y divide-black/5">
                {routines.map((r, idx) => {
                  const careeLabel = r.caree?.name || r.caree?.email || r.caree?._id || 'Unassigned'
                  const timeLabel = typeof r.time === 'string' ? r.time : (r.time?.start || '')
                  return (
                    <div key={r._id} className="p-6 hover:bg-black/[0.01] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center text-sm font-medium text-black">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-black mb-1">{r.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-black/50">
                              <span className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-black/10 rounded-full flex items-center justify-center text-[10px]">
                                  {(careeLabel[0] || '?').toUpperCase()}
                                </div>
                                {careeLabel}
                              </span>
                              {timeLabel && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {timeLabel}
                                  </span>
                                </>
                              )}
                              {r.frequency && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize px-2 py-0.5 bg-black/5 rounded-full">{r.frequency}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {r.importance !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-black/40">Priority</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-sm ${i < (r.importance || 0) ? 'bg-black' : 'bg-black/10'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
