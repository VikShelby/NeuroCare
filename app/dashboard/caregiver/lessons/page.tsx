"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, Users, Clock } from "lucide-react"

const lessons = [
  { title: "Language: Simple requests", caree: "Maya", progress: 40, sessions: 8, lastActive: "2 hours ago" },
  { title: "Social: Greetings", caree: "Eli", progress: 70, sessions: 15, lastActive: "1 day ago" },
  { title: "Daily living: Dressing", caree: "Noah", progress: 10, sessions: 3, lastActive: "3 hours ago" },
  { title: "Communication: AAC basics", caree: "Alex", progress: 55, sessions: 12, lastActive: "5 hours ago" },
  { title: "Motor skills: Fine motor", caree: "Maya", progress: 85, sessions: 20, lastActive: "1 hour ago" },
]

export default function CaregiverLessons() {
  const avgProgress = Math.round(lessons.reduce((acc, l) => acc + l.progress, 0) / lessons.length)
  const totalSessions = lessons.reduce((acc, l) => acc + l.sessions, 0)

  return (
    <div className="pb-24">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-black mb-1">Lessons</h1>
            <p className="text-sm text-black/50">{lessons.length} active lessons</p>
          </div>
          <Button className="bg-black text-white hover:bg-black/80">
            Create Lesson
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">{lessons.length}</div>
                <div className="text-xs text-black/50">Active Lessons</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">{avgProgress}%</div>
                <div className="text-xs text-black/50">Avg. Progress</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">{totalSessions}</div>
                <div className="text-xs text-black/50">Total Sessions</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">4</div>
                <div className="text-xs text-black/50">Carees Learning</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5">
            <h2 className="text-sm font-medium text-black">All Lessons</h2>
          </div>
          <div className="divide-y divide-black/5">
            {lessons.map((l, i) => (
              <div key={i} className="p-6 hover:bg-black/[0.01] transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      l.progress >= 70 ? 'bg-emerald-50' : l.progress >= 40 ? 'bg-amber-50' : 'bg-black/5'
                    }`}>
                      <BookOpen className={`w-6 h-6 ${
                        l.progress >= 70 ? 'text-emerald-600' : l.progress >= 40 ? 'text-amber-600' : 'text-black/40'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-black group-hover:underline">{l.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-black/50 mt-1">
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center text-[10px] text-white">
                            {l.caree[0]}
                          </div>
                          {l.caree}
                        </span>
                        <span>•</span>
                        <span>{l.sessions} sessions</span>
                        <span>•</span>
                        <span>{l.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-black">{l.progress}%</div>
                    <div className="text-xs text-black/40">complete</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        l.progress >= 70 ? 'bg-emerald-500' : l.progress >= 40 ? 'bg-amber-500' : 'bg-black'
                      }`}
                      style={{ width: `${l.progress}%` }}
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-black/50 hover:text-black">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
