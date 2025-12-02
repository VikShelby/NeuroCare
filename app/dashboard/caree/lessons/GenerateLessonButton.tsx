"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function GenerateLessonButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerateLesson = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/lessons", { method: "POST" })
      setLoading(false)
      if (!res.ok) return
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={handleGenerateLesson} disabled={loading}>
      {loading ? "Generating..." : "Generate Lesson"}
    </Button>
  )
}
