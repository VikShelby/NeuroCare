"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import  GenerateLessonButton from "@/app/dashboard/caree/lessons/GenerateLessonButton"
import SortableList, { Item, SortableListItem } from "@/components/ui/sortable-list"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckCircle2, PlayCircle } from "lucide-react"

type LessonType = {
  _id: string
  title: string
  summary?: string
  content?: string
}

export default function CareeLessonsPage() {
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

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
      setItems(
        lessonList.map((l: LessonType, idx: number) => ({
          id: idx,
          text: l.title || "Untitled Lesson",
          description: l.summary || "",
          checked: false,
        }))
      )
    } catch (error) {
      console.error("Failed to fetch lessons:", error)
      toast.error("Failed to load lessons")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCurrentLesson = async (lessonId: string, lessonTitle: string) => {
    try {
      const res = await fetch("/api/lessons/set-current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      })
      if (!res.ok) throw new Error("Failed to set current")
      toast.success(`"${lessonTitle}" is now your current lesson`)
    } catch (error) {
      console.error("Failed to set current lesson:", error)
      toast.error("Failed to set current lesson")
    }
  }

  const handleDeleteLesson = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    const lesson = lessons[id]
    if (lesson?._id) {
      // Optional: call DELETE API endpoint if you have one
      toast.success(`"${lesson.title}" removed`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Lessons</h1>
        </div>
        <Card className="p-4 text-sm text-muted-foreground">Loading lessons...</Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Lessons</h1>
        <GenerateLessonButton onGenerated={fetchLessons} />
      </div>
      {lessons.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No lessons yet. Generate one to get started.
        </Card>
      ) : (
        <div className="space-y-2">
          <SortableList
            items={items}
            setItems={(newItems) => {
              const oldOrder = items.map(i => i.id)
              const newOrder = typeof newItems === 'function' ? newItems(items).map(i => i.id) : newItems.map(i => i.id)
              
              // Check if order changed
              const orderChanged = JSON.stringify(oldOrder) !== JSON.stringify(newOrder)
              
              if (orderChanged) {
                const reorderedItems = typeof newItems === 'function' ? newItems(items) : newItems
                setItems(reorderedItems)
                
                // Show toast with save action
                const firstLesson = lessons[reorderedItems[0].id]
                if (firstLesson) {
                  toast.success(
                    `Reordered! "${firstLesson.title}" is now first.`,
                    {
                      action: {
                        label: "Set as Current",
                        onClick: () => handleSetCurrentLesson(firstLesson._id, firstLesson.title)
                      }
                    }
                  )
                }
              } else {
                setItems(newItems)
              }
            }}
            onCompleteItem={(id) => {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, checked: !item.checked } : item
                )
              )
            }}
            renderItem={(item, order, onComplete, onRemove) => (
              <SortableListItem
                key={item.id}
                item={item}
                order={order}
                onCompleteItem={onComplete}
                onRemoveItem={onRemove}
                handleDrag={() => {}}
                renderExtra={(item) => {
                  const lesson = lessons[item.id]
                  if (!lesson) return null
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="ml-auto px-3 py-2 text-xs text-black/70 hover:text-black transition-colors">
                          Options
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() =>
                              handleSetCurrentLesson(lesson._id, lesson.title)
                            }
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Set as Current Lesson
                          </Button>
                       
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  )
}
