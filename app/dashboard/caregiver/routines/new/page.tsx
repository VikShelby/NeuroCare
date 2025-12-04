"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { CheckCircle2 } from "lucide-react"

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
    <div className="pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-light text-black mb-8">Create Routine</h1>
        
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Title</label>
            <Input 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              placeholder="Morning Routine" 
              className="border-black/10 focus:border-black"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Description</label>
            <Textarea 
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
              placeholder="What this routine involves" 
              className="border-black/10 focus:border-black min-h-[100px]"
            />
          </div>
          
          <div className="h-px bg-black/10" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-black/50">Date</label>
              <Input 
                type="date" 
                value={date} 
                onChange={e=>setDate(e.target.value)} 
                min={new Date().toISOString().slice(0,10)} 
                className="border-black/10 focus:border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-black/50">Time</label>
              <Input 
                type="time" 
                value={timeOfDay} 
                onChange={e=>setTimeOfDay(e.target.value)} 
                className="border-black/10 focus:border-black"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Frequency</label>
            <Input 
              value={frequency} 
              onChange={e=>setFrequency(e.target.value)} 
              placeholder="daily | weekly | weekdays | once" 
              className="border-black/10 focus:border-black"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-black/50">Importance (1–5)</label>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                value={importance} 
                onChange={e=>setImportance(Number(e.target.value))} 
                className="border-black/10 focus:border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-black/50">Flexibility</label>
              <Input 
                value={flexibility} 
                onChange={e=>setFlexibility(e.target.value)} 
                placeholder="low | medium | high" 
                className="border-black/10 focus:border-black"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Associated Activities</label>
            <Input 
              value={associatedActivities} 
              onChange={e=>setAssociatedActivities(e.target.value)} 
              placeholder="brush teeth, meditation" 
              className="border-black/10 focus:border-black"
            />
            <p className="text-xs text-black/40">Comma-separated list</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Notes</label>
            <Textarea 
              value={notes} 
              onChange={e=>setNotes(e.target.value)} 
              placeholder="Tips or instructions" 
              className="border-black/10 focus:border-black min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-black/50">Caree (required)</label>
            <Select value={careeId} onValueChange={setCareeId}>
              <SelectTrigger className="w-full border-black/10 focus:border-black">
                <SelectValue placeholder="Select a caree…" />
              </SelectTrigger>
              <SelectContent>
                {carees.length > 0 && carees.map(c => (
                  <SelectItem key={c._id} value={c._id}>{c.name || c.email || c._id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {carees.length === 0 && (
              <p className="text-xs text-black/40">No carees found. Link carees first.</p>
            )}
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <Button 
              onClick={onSubmit}
              className="bg-black text-white hover:bg-black/80 px-8"
            >
              Create Routine
            </Button>
            {ok && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" /> Created successfully
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

