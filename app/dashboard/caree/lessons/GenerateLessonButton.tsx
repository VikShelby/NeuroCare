"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Loader2, Sparkles } from "lucide-react"

interface GenerateLessonButtonProps {
  onGenerated?: () => void
}

export default function GenerateLessonButton({ onGenerated }: GenerateLessonButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerateLesson = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/lessons", { method: "POST" })
      setLoading(false)
      if (!res.ok) {
        toast.error("Failed to generate lesson")
        return
      }
      toast.success("New lesson generated")
      if (onGenerated) {
        onGenerated()
      } else {
        router.refresh()
      }
    } catch {
      setLoading(false)
      toast.error("Failed to generate lesson")
    }
  }

  return (
    <button 
      onClick={handleGenerateLesson} 
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#007AFF] text-white rounded-full text-sm font-medium hover:bg-[#0056CC] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#007AFF]/25"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>Generate</span>
        </>
      )}
    </button>
  )
}
