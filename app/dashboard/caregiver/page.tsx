import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  BookOpen, 
  Bell,
  Activity,
  Clock,
  CheckCircle2,
  Circle
} from "lucide-react"
import { 
  WeeklyActivityChart, 
  ProgressChart, 
  RoutineCategoriesChart, 
  EngagementChart,
  RoutineCategoriesLegend,
  MiniSparkline
} from "./components/analytics-charts"

export default async function CaregiverDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (!session.user) redirect("/login")
  if (!(session.user as any)?.profileCompleted) redirect("/onboarding/role")
  if ((session.user as any).role !== "caregiver") redirect("/dashboard")

  await connectToDatabase()
  const caregiver = await User.findOne({ email: (session.user as any).email }).select("_id role careeIds name")
  const ids = Array.isArray(caregiver?.careeIds) ? caregiver!.careeIds : []
  const carees = await User.find({ $or: [ { _id: { $in: ids } }, { caregiverId: caregiver?._id } ] })
    .select("_id name email")
    .limit(6)
    .lean()

  const firstName = caregiver?.name?.split(' ')[0] || 'there'

  return (
    <div className="pb-24">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-black mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}
          </h2>
          <p className="text-sm text-black/50">Here's an overview of your carees' progress and activities.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-lg hover:shadow-black/5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <MiniSparkline data={[3, 4, 4, 5, 5, 6, carees.length]} />
            </div>
            <div className="text-3xl font-semibold text-black mb-1">{carees.length}</div>
            <div className="text-xs text-black/50 uppercase tracking-wider">Active Carees</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+2 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-lg hover:shadow-black/5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <MiniSparkline data={[10, 12, 11, 14, 13, 15, 14]} />
            </div>
            <div className="text-3xl font-semibold text-black mb-1">14</div>
            <div className="text-xs text-black/50 uppercase tracking-wider">Today's Routines</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: '64%' }} />
              </div>
              <span className="text-xs text-black/60">9/14</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-lg hover:shadow-black/5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <MiniSparkline data={[2, 3, 2, 4, 3, 3, 3]} />
            </div>
            <div className="text-3xl font-semibold text-black mb-1">3</div>
            <div className="text-xs text-black/50 uppercase tracking-wider">Lesson Sessions</div>
            <div className="flex items-center gap-1 mt-2">
              <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
              <span className="text-xs text-black/60">2 in progress</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-lg hover:shadow-black/5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="px-2 py-1 bg-emerald-50 rounded-full">
                <span className="text-xs text-emerald-600 font-medium">All Clear</span>
              </div>
            </div>
            <div className="text-3xl font-semibold text-black mb-1">0</div>
            <div className="text-xs text-black/50 uppercase tracking-wider">Alerts</div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">No action needed</span>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-black">Weekly Activity</h3>
                <p className="text-xs text-black/50 mt-0.5">Routines & lessons completed per day</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-sm" />
                  <span className="text-xs text-black/60">Routines</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black/40 rounded-sm" />
                  <span className="text-xs text-black/60">Lessons</span>
                </div>
              </div>
            </div>
            <WeeklyActivityChart />
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-black">Routine Distribution</h3>
              <p className="text-xs text-black/50 mt-0.5">By time of day</p>
            </div>
            <RoutineCategoriesChart />
            <RoutineCategoriesLegend />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-black">Overall Progress</h3>
                <p className="text-xs text-black/50 mt-0.5">Goal completion rate over 6 weeks</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">+33%</span>
              </div>
            </div>
            <ProgressChart />
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-black">Caree Engagement</h3>
                <p className="text-xs text-black/50 mt-0.5">Weekly engagement scores</p>
              </div>
              <Link href="/dashboard/caregiver/carees" className="text-xs text-black/50 hover:text-black flex items-center gap-1">
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <EngagementChart />
          </div>
        </div>

        {/* Activity & Schedule Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-black/40" />
                <h3 className="text-sm font-medium text-black">Recent Activity</h3>
              </div>
              <span className="text-xs text-black/40">Today</span>
            </div>
            <ul className="space-y-4">
              {[
                { time: "08:30", text: "Morning routine completed", person: "Alex", status: "completed" },
                { time: "09:15", text: "Language lesson started", person: "Maya", status: "active" },
                { time: "10:05", text: "AAC communication used", person: "Eli", status: "completed" },
                { time: "10:45", text: "Sensory activity logged", person: "Noah", status: "completed" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 text-right">
                    <span className="text-xs font-mono text-black/40">{item.time}</span>
                  </div>
                  <div className="flex-shrink-0 mt-1.5">
                    {item.status === 'completed' ? (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black">{item.text}</p>
                    <p className="text-xs text-black/40">{item.person}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black/40" />
                <h3 className="text-sm font-medium text-black">Upcoming Schedule</h3>
              </div>
              <Link href="/dashboard/caregiver/routines" className="text-xs text-black/50 hover:text-black flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="space-y-3">
              {[
                { time: "11:00", text: "Sensory break", person: "Noah", priority: "high" },
                { time: "13:00", text: "Social skills lesson", person: "Maya", priority: "medium" },
                { time: "15:30", text: "Walk routine", person: "Alex", priority: "low" },
                { time: "17:00", text: "Evening routine", person: "Eli", priority: "high" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/[0.02] transition-colors">
                  <div className="flex-shrink-0 w-12">
                    <span className="text-xs font-mono text-black/60">{item.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black">{item.text}</p>
                    <p className="text-xs text-black/40">{item.person}</p>
                  </div>
                  <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs ${
                    item.priority === 'high' ? 'bg-red-50 text-red-600' :
                    item.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-black/5 text-black/50'
                  }`}>
                    {item.priority}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Carees Section */}
        <div className="bg-white rounded-xl border border-black/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-black">Your Carees</h3>
              <p className="text-xs text-black/50 mt-0.5">Quick access to caree profiles</p>
            </div>
            <Link href="/dashboard/caregiver/carees" className="text-xs text-black/50 hover:text-black flex items-center gap-1">
              Manage all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(!carees || carees.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-black/30" />
              </div>
              <p className="text-sm text-black/50 mb-4">No carees linked yet</p>
              <Link href="/dashboard/caregiver/carees">
                <Button size="sm" className="bg-black text-white hover:bg-black/80">
                  Add Caree
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {carees.map((c: any, idx: number) => {
                const colors = ['bg-black', 'bg-neutral-700', 'bg-neutral-500', 'bg-neutral-400']
                return (
                  <div key={String(c._id)} className="group p-4 rounded-lg border border-black/5 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${colors[idx % colors.length]} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                        {(c.name || c.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{c.name || 'Unnamed'}</p>
                        <p className="text-xs text-black/40 truncate">{c.email}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black/0 group-hover:text-black/40 transition-colors" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-black/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-black/40">Today's progress</span>
                        <span className="text-black font-medium">{65 + idx * 8}%</span>
                      </div>
                      <div className="mt-2 h-1 bg-black/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black rounded-full transition-all" 
                          style={{ width: `${65 + idx * 8}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
