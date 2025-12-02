"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const lessons = [
  { title: "Language: Simple requests", caree: "Maya", progress: 40 },
  { title: "Social: Greetings", caree: "Eli", progress: 70 },
  { title: "Daily living: Dressing", caree: "Noah", progress: 10 },
]

export default function CaregiverLessons() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Lessons</h1>
      <div className="grid gap-3">
        {lessons.map((l, i) => (
          <Card key={i} className="p-4 space-y-2">
            <div className="text-sm font-medium">{l.title}</div>
            <div className="text-xs text-muted-foreground">{l.caree}</div>
            <Progress value={l.progress} />
          </Card>
        ))}
      </div>
    </div>
  )
}
