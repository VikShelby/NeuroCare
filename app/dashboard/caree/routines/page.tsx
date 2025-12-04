"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Check, Calendar, Sun, Clock } from "lucide-react"
import { motion } from "framer-motion"

type RoutineType = {
  _id: string
  title: string
  description?: string
  time?: string | { start?: string; end?: string }
  frequency?: string
  importance?: number
  flexibility?: number | string
  notes?: string
  completedDates?: string[]
}

// Soft pastel colors for routine cards
const cardColors = [
  { bg: "bg-orange-50", accent: "bg-orange-400", icon: "text-orange-500" },
  { bg: "bg-blue-50", accent: "bg-blue-400", icon: "text-blue-500" },
  { bg: "bg-emerald-50", accent: "bg-emerald-400", icon: "text-emerald-500" },
  { bg: "bg-purple-50", accent: "bg-purple-400", icon: "text-purple-500" },
  { bg: "bg-pink-50", accent: "bg-pink-400", icon: "text-pink-500" },
  { bg: "bg-amber-50", accent: "bg-amber-400", icon: "text-amber-500" },
]

export default function CareeRoutinesPage() {
  const [routines, setRoutines] = useState<RoutineType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutines()
  }, [])

  const fetchRoutines = async () => {
    try {
      const res = await fetch("/api/caree/routines")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      const routineList = Array.isArray(data.routines) ? data.routines : []
      setRoutines(routineList)
    } catch (error) {
      console.error("Failed to fetch routines:", error)
      toast.error("Failed to load routines")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsDone = async (routineId: string, routineTitle: string, routineIndex: number) => {
    const today = new Date().toISOString()
    setRoutines((prev) =>
      prev.map((r, idx) =>
        idx === routineIndex
          ? { ...r, completedDates: [...(r.completedDates || []), today] }
          : r
      )
    )
    
    try {
      const res = await fetch(`/api/caree/routines/${routineId}/complete`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to mark as done")
      toast.success(`"${routineTitle}" completed!`)
    } catch (error) {
      console.error("Failed to mark routine as done:", error)
      toast.error("Failed to mark routine as done")
      fetchRoutines()
    }
  }

  const isCompletedToday = (routine: RoutineType): boolean => {
    if (!routine.completedDates || routine.completedDates.length === 0) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return routine.completedDates.some((dateStr) => {
      const d = new Date(dateStr)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
  }

  const completedCount = routines.filter(r => isCompletedToday(r)).length
  const totalCount = routines.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getTimeLabel = (routine: RoutineType) => {
    if (typeof routine.time === 'string') return routine.time
    if (routine.time?.start) return routine.time.start
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Routines</h1>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">My Routines</h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Sun className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Today's Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{progressPercent}%</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  className="dark:stroke-gray-700"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progressPercent}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{completedCount}/{totalCount}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {progressPercent === 100 ? "🎉 All routines completed!" : `${totalCount - completedCount} routines remaining`}
          </p>
        </motion.div>

        {/* Routines List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Today's Routines</h2>
          
          {routines.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No routines yet</p>
              <p className="text-sm text-gray-300 mt-1">Your caregiver can create routines for you</p>
            </div>
          ) : (
            routines.map((routine, index) => {
              const completedToday = isCompletedToday(routine)
              const colors = cardColors[index % cardColors.length]
              const timeLabel = getTimeLabel(routine)
              
              return (
                <motion.div
                  key={routine._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${colors.bg} dark:bg-[#1E1E1E] rounded-2xl p-4 flex items-center gap-4 ${
                    completedToday ? "opacity-60" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => !completedToday && handleMarkAsDone(routine._id, routine.title, index)}
                    disabled={completedToday}
                    className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      completedToday 
                        ? `${colors.accent} text-white` 
                        : "border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {completedToday && <Check className="h-4 w-4" strokeWidth={3} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-gray-900 dark:text-white ${
                      completedToday ? "line-through text-gray-400 dark:text-gray-500" : ""
                    }`}>
                      {routine.title}
                    </h3>
                    {(timeLabel || routine.frequency) && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {[timeLabel, routine.frequency].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    completedToday ? "bg-emerald-400" : colors.accent
                  }`} />
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
