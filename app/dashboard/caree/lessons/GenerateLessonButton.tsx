"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
      toast.success("New lesson generated successfully")
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
    <Button size="sm" onClick={handleGenerateLesson} disabled={loading}>
      {loading ? "Generating..." : "Generate Lesson"}
    </Button>
  )
}
