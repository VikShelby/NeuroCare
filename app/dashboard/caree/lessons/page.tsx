"use client"

import GenerateLessonButton from "@/app/dashboard/caree/lessons/GenerateLessonButton"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Check, BookOpen, Sparkles, ChevronRight, Brain, Lightbulb, Target, Puzzle, Heart, Star, Zap, Compass, Flame, Music } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Array of icons to randomly assign to lessons
const lessonIcons = [Brain, Lightbulb, Target, Puzzle, Heart, Star, Zap, Compass, Flame, Music]

type LessonType = {
  _id: string
  title: string
  summary?: string
  content?: string
  progress?: {
    currentStepIndex: number
    completedSteps: number[]
    percent: number
    startedAt?: string
    updatedAt?: string
    completedAt?: string | null
  }
}

// Get total steps from lesson content
const getTotalSteps = (lesson: LessonType): number => {
  try {
    if (!lesson.content) return 0
    const parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content
    return Array.isArray(parsed?.steps) ? parsed.steps.length : 0
  } catch {
    return 0
  }
}

// Check if lesson is completed
const isLessonCompleted = (lesson: LessonType): boolean => {
  if (lesson.progress?.completedAt) return true
  if (lesson.progress?.percent === 100) return true
  const totalSteps = getTotalSteps(lesson)
  if (totalSteps > 0 && (lesson.progress?.currentStepIndex ?? 0) >= totalSteps) return true
  return false
}

export default function CareeLessonsPage() {
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lessons")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      const lessonList = Array.isArray(data.lessons) ? data.lessons : []
      setLessons(lessonList)
    } catch (error) {
      console.error("Failed to fetch lessons:", error)
      toast.error("Failed to load lessons")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCurrentLesson = async (lessonId: string, lessonTitle: string) => {
    try {
      setActiveLesson(lessonId)
      const res = await fetch("/api/lessons/set-current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      })
      if (!res.ok) throw new Error("Failed to set current")
      toast.success(`"${lessonTitle}" is now active`)
    } catch (error) {
      console.error("Failed to set current lesson:", error)
      toast.error("Failed to set current lesson")
      setActiveLesson(null)
    }
  }

  const completedCount = lessons.filter(l => isLessonCompleted(l)).length
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1C1C1E] dark:text-white">Lessons</h1>
        </div>
        <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#8E8E93]">Loading lessons...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 xl:p-0 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E] dark:text-white">Lessons</h1>
          <p className="text-sm text-[#8E8E93] mt-0.5">{lessons.length} lessons available</p>
        </div>
        <GenerateLessonButton onGenerated={fetchLessons} />
      </div>

      {/* Progress Card */}
      {lessons.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-5 shadow-lg shadow-[#007AFF]/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Your Progress</h3>
                <p className="text-white/70 text-sm">{completedCount} of {lessons.length} completed</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{progressPercent}%</div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-[#8E8E93]" />
          </div>
          <h3 className="text-lg font-medium text-[#1C1C1E] dark:text-white mb-2">No Lessons Yet</h3>
          <p className="text-[#8E8E93] text-sm mb-6">Generate your first lesson to start learning</p>
          <GenerateLessonButton onGenerated={fetchLessons} />
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm overflow-hidden">
          <AnimatePresence>
            {lessons.map((lesson, idx) => {
              const isCompleted = isLessonCompleted(lesson)
              const isActive = activeLesson === lesson._id
              const isLast = idx === lessons.length - 1
              const LessonIcon = lessonIcons[idx % lessonIcons.length]
              const lessonProgress = lesson.progress?.percent || 0
              
              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative ${
                    !isLast ? 'border-b border-[#E5E5EA] dark:border-[#3A3A3C]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 p-4 hover:bg-[#F2F2F7]/50 dark:hover:bg-[#3A3A3C]/50 transition-colors">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-[#34C759] text-white' 
                        : 'bg-[#F2F2F7] dark:bg-[#3A3A3C] text-[#8E8E93]'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <LessonIcon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-[17px] font-medium transition-all ${
                        isCompleted 
                          ? 'text-[#8E8E93]' 
                          : 'text-[#1C1C1E] dark:text-white'
                      }`}>
                        {lesson.title || "Untitled Lesson"}
                      </h3>
                      {lesson.summary && (
                        <p className="text-[15px] text-[#8E8E93] leading-relaxed mt-0.5 line-clamp-1">
                          {lesson.summary}
                        </p>
                      )}
                      {/* Progress indicator */}
                      {!isCompleted && lessonProgress > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 bg-[#E5E5EA] dark:bg-[#3A3A3C] rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-[#007AFF] rounded-full transition-all"
                              style={{ width: `${lessonProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#8E8E93]">{lessonProgress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSetCurrentLesson(lesson._id, lesson.title)}
                      disabled={isCompleted}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isCompleted
                          ? 'bg-[#34C759]/10 text-[#34C759]'
                          : isActive
                            ? 'bg-[#34C759] text-white'
                            : 'bg-[#007AFF] text-white hover:bg-[#0056CC] active:scale-95'
                      }`}
                    >
                      {isCompleted ? (
                        <>Done<Check className="w-4 h-4" /></>
                      ) : isActive ? (
                        <>Active<Check className="w-4 h-4" /></>
                      ) : lessonProgress > 0 ? (
                        <>Continue<ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <>Start<ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
