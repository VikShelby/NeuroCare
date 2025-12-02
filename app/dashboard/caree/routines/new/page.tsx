"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function NewCareeRoutinePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [importance, setImportance] = useState<number>(3)
  const [associatedActivities, setAssociatedActivities] = useState("")
  const [flexibility, setFlexibility] = useState("medium")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  const onSubmit = async () => {
    try {
      setError(""); setOk(false)
      if (!title) throw new Error('Title required')
      if (date) {
        const now = new Date()
        const selected = new Date(timeOfDay ? `${date}T${timeOfDay}` : `${date}T00:00`)
        if (selected <= now) throw new Error('Pick a future date/time')
      }
      const res = await fetch('/api/caree/routines', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          time: (date && timeOfDay) ? `${date} ${timeOfDay}` : (date || undefined),
          frequency,
          importance,
          associatedActivities: associatedActivities.split(',').map(s=>s.trim()).filter(Boolean),
          flexibility,
          notes,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setOk(true)
      setTitle(""); setDescription(""); setDate(""); setTimeOfDay(""); setFrequency("daily"); setImportance(3); setAssociatedActivities(""); setFlexibility("medium"); setNotes("")
    } catch (e:any) {
      setError(e.message || 'Failed to create')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Add Routine</h1>
      <Card className="p-4 space-y-4">
        <div>
          <div className="text-sm font-medium">Title</div>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Stretching" />
        </div>
        <div>
          <div className="text-sm font-medium">Description</div>
          <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe what happens" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium">Date / Time</div>
            <div className="flex gap-2">
              <Input type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={e=>setDate(e.target.value)} />
              <Input type="time" value={timeOfDay} onChange={e=>setTimeOfDay(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Frequency</div>
            <Input value={frequency} onChange={e=>setFrequency(e.target.value)} placeholder="daily | weekly | once" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium">Importance (1–5)</div>
            <Input type="number" min={1} max={5} value={importance} onChange={e=>setImportance(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-sm font-medium">Flexibility</div>
            <Input value={flexibility} onChange={e=>setFlexibility(e.target.value)} placeholder="low | medium | high" />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Associated Activities (comma-separated)</div>
          <Input value={associatedActivities} onChange={e=>setAssociatedActivities(e.target.value)} placeholder="breathing, journaling" />
        </div>
        <div>
          <div className="text-sm font-medium">Notes</div>
          <Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Extra tips" />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSubmit}>Create</Button>
          {ok && <div className="text-sm text-green-600">Created</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </Card>
    </div>
  )
}
