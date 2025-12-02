"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { useEffect, useMemo, useState } from "react"

type Caree = { _id: string; name?: string | null; email: string }

export default function CareesDirectory() {
  const [q, setQ] = useState("")
  const [carees, setCarees] = useState<Caree[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchCarees = async () => {
    try {
      setError("")
      const res = await fetch("/api/caregiver/carees", { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setCarees(Array.isArray(data.carees) ? data.carees : [])
    } catch (e: any) {
      setError(e.message || "Failed to load")
    }
  }

  useEffect(() => { fetchCarees() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? carees.filter(c => (c.name || c.email).toLowerCase().includes(s)) : carees
  }, [q, carees])

  const onAdd = async () => {
    if (!email.trim()) return
    try {
      setLoading(true); setError("")
      const res = await fetch("/api/caregiver/carees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add")
      setEmail("")
      if (Array.isArray(data.carees)) {
        setCarees(data.carees)
      } else {
        await fetchCarees()
      }
    } catch (e: any) {
      setError(e.message || "Failed to add")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Carees</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} className="w-48" />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <div className="flex items-center gap-2">
        <Input placeholder="Add caree by email" value={email} onChange={e => setEmail(e.target.value)} className="max-w-xs" />
        <Button size="sm" onClick={onAdd} disabled={loading}>Add</Button>
        <Button size="sm" variant="outline" onClick={fetchCarees} disabled={loading}>Refresh</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No carees found. Add one by email above.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <Card key={c._id} className="p-4">
              <div className="text-sm font-medium">{c.name || c.email}</div>
              <div className="text-xs text-muted-foreground">{c.email}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
