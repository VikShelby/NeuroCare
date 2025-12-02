"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

type Caree = { _id: string; name?: string; email?: string }

export default function NewRoutinePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [importance, setImportance] = useState<number>(3)
  const [associatedActivities, setAssociatedActivities] = useState<string>("")
  const [flexibility, setFlexibility] = useState<string>("medium")
  const [notes, setNotes] = useState("")
  const [careeId, setCareeId] = useState("")
  const [carees, setCarees] = useState<Caree[]>([])
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const loadCarees = async () => {
      try {
        const res = await fetch('/api/caregiver/carees', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load carees')
        setCarees(data.carees || [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load carees')
      }
    }
    loadCarees()
  }, [])

  const onSubmit = async () => {
    try {
      setError(""); setOk(false)
      // Validate caree selection
      if (!careeId) throw new Error('Please select a caree')
      // Validate date/time is after now
      if (date) {
        const now = new Date()
        const selected = new Date(timeOfDay ? `${date}T${timeOfDay}` : `${date}T00:00`)
        if (selected <= now) {
          throw new Error('Please pick a future date/time')
        }
      }
      const res = await fetch('/api/caregiver/routines', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          time: (date && timeOfDay) ? `${date} ${timeOfDay}` : (date || undefined),
          frequency,
          importance,
          associatedActivities: associatedActivities.split(',').map(s => s.trim()).filter(Boolean),
          flexibility,
          notes,
          careeId,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setOk(true)
      setTitle(""); setDescription("");  setFrequency("daily"); setImportance(3);
      setAssociatedActivities(""); setFlexibility("medium"); setNotes(""); setCareeId(""); setDate(""); setTimeOfDay("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Routine</h1>
      <Card className="p-4 space-y-4">
        <div>
          <div className="text-sm font-medium">Title</div>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Morning Routine" />
        </div>
        <div>
          <div className="text-sm font-medium">Description</div>
          <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What this routine involves" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium">Date / Time</div>
            <div className="flex gap-2">
              <Input type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().slice(0,10)} />
              <Input type="time" value={timeOfDay} onChange={e=>setTimeOfDay(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Frequency</div>
            <Input value={frequency} onChange={e=>setFrequency(e.target.value)} placeholder="daily | weekly | weekdays | once" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium">Importance (1–5)</div>
            <Input type="number" min={1} max={5} value={importance} onChange={e=>setImportance(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-sm font-medium">Flexibility</div>
            <Input value={flexibility} onChange={e=>setFlexibility(e.target.value)} placeholder="low | medium | high or a number" />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Associated Activities (comma-separated)</div>
          <Input value={associatedActivities} onChange={e=>setAssociatedActivities(e.target.value)} placeholder="brush teeth, meditation" />
        </div>
        <div>
          <div className="text-sm font-medium">Notes</div>
          <Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Tips or instructions" />
        </div>
        <div>
          <div className="text-sm font-medium">Caree (required)</div>
          <Select value={careeId} onValueChange={setCareeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a caree…" />
            </SelectTrigger>
            <SelectContent>
              {carees.length > 0 && carees.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name || c.email || c._id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {carees.length === 0 && (
            <div className="text-xs text-muted-foreground mt-1">No carees found. Link carees first.</div>
          )}
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
function setTime(arg0: string) {
    throw new Error("Function not implemented.")
}

