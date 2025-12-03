"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SortableList, { Item, SortableListItem } from "@/components/ui/sortable-list"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckCircle2 } from "lucide-react"

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

export default function CareeRoutinesPage() {
  const [routines, setRoutines] = useState<RoutineType[]>([])
  const [items, setItems] = useState<Item[]>([])
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
      setItems(
        routineList.map((r: RoutineType, idx: number) => {
          const timeLabel = typeof r.time === 'string' ? r.time : (r.time?.start || '')
          const description = [
            timeLabel,
            r.frequency,
            r.importance ? `Importance: ${r.importance}` : null
          ].filter(Boolean).join(' • ')
          
          return {
            id: idx,
            text: r.title || "Untitled Routine",
            description: description || r.description || "",
            checked: false,
          }
        })
      )
    } catch (error) {
      console.error("Failed to fetch routines:", error)
      toast.error("Failed to load routines")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoutine = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    const routine = routines[id]
    if (routine?._id) {
      toast.success(`"${routine.title}" removed`)
    }
  }

  const handleMarkAsDone = async (routineId: string, routineTitle: string) => {
    try {
      const res = await fetch(`/api/caree/routines/${routineId}/complete`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to mark as done")
      toast.success(`"${routineTitle}" marked as done for today!`)
      // Refresh routines to get updated completion data
      fetchRoutines()
    } catch (error) {
      console.error("Failed to mark routine as done:", error)
      toast.error("Failed to mark routine as done")
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Routines</h1>
        </div>
        <Card className="p-4 text-sm text-muted-foreground">Loading routines...</Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Routines</h1>
      </div>
      {routines.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No routines yet. Your caregiver can create routines for you.
        </Card>
      ) : (
        <div className="space-y-2">
          <SortableList
            items={items}
            setItems={setItems}
            onCompleteItem={(id) => {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, checked: !item.checked } : item
                )
              )
            }}
            renderItem={(item, order, onComplete, onRemove) => {
              const routine = routines[item.id]
              const completedToday = routine ? isCompletedToday(routine) : false
              
              return (
                <SortableListItem
                  key={item.id}
                  item={item}
                  order={order}
                  onCompleteItem={onComplete}
                  onRemoveItem={onRemove}
                  handleDrag={() => {}}
                  className={completedToday ? "bg-green-600/90 hover:bg-green-600" : ""}
                  renderExtra={(item) => {
                    const routine = routines[item.id]
                    if (!routine) return null
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button 
                            className={`ml-auto px-3 py-2 text-xs transition-colors ${
                              completedToday 
                                ? "bg-white text-black font-medium rounded-md hover:bg-white/90" 
                                : "text-black/70 hover:text-black"
                            }`}
                          >
                            {completedToday ? "Done" : "Options"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() =>
                                handleMarkAsDone(routine._id, routine.title)
                              }
                              disabled={completedToday}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {completedToday ? "Done Today ✓" : "Mark as Done"}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
              )
            }}
          />
        </div>
      )}
    </div>
  )
}
