"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { 
  Search, 
  Plus, 
  Users, 
  TrendingUp, 
  Activity,
  MoreHorizontal
} from "lucide-react"

type Caree = { _id: string; name?: string | null; email: string }

export default function CareesDirectory() {
  const [q, setQ] = useState("")
  const [carees, setCarees] = useState<Caree[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchCarees = async () => {
    try {
      setError("")
      setLoading(true)
      const res = await fetch("/api/caregiver/carees", { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setCarees(Array.isArray(data.carees) ? data.carees : [])
    } catch (e: any) {
      setError(e.message || "Failed to load")
    } finally {
      setLoading(false)
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
      setShowAddForm(false)
      if (Array.isArray(data.carees)) {
        setCarees(data.carees)
      } else {
        await fetchCarees()
      }
    } catch (e: any) {
      setError(e.message || "Failed to add")
    } finally { setLoading(false) }
  }

  const colors = ['bg-black', 'bg-neutral-700', 'bg-neutral-500', 'bg-neutral-400', 'bg-neutral-600']

  return (
    <div className="pb-24">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-black mb-1">Carees</h1>
            <p className="text-sm text-black/50">{carees.length} carees linked</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <Input 
                placeholder="Search carees..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                className="w-64 pl-10 bg-black/5 border-0 focus:bg-white focus:ring-1 focus:ring-black/10" 
              />
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-black text-white hover:bg-black/80"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Caree
            </Button>
          </div>
        </div>
        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-medium text-black mb-4">Add New Caree</h2>
              <p className="text-sm text-black/50 mb-4">Enter the email address of the caree you want to link.</p>
              <Input 
                placeholder="caree@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="mb-4"
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              <div className="flex items-center gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button onClick={onAdd} disabled={loading} className="bg-black text-white hover:bg-black/80">
                  {loading ? "Adding..." : "Add Caree"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">{carees.length}</div>
                <div className="text-xs text-black/50">Total Carees</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">{carees.length}</div>
                <div className="text-xs text-black/50">Active Today</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-black">78%</div>
                <div className="text-xs text-black/50">Avg. Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Carees Grid */}
        {loading && carees.length === 0 ? (
          <div className="bg-white rounded-xl border border-black/5 p-12 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-black/5 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-black/5 rounded w-32 mx-auto" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-black/5 p-12 text-center">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-black/30" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              {q ? "No matches found" : "No carees yet"}
            </h3>
            <p className="text-sm text-black/50 mb-6">
              {q ? "Try a different search term" : "Add a caree to get started"}
            </p>
            {!q && (
              <Button onClick={() => setShowAddForm(true)} className="bg-black text-white hover:bg-black/80">
                <Plus className="w-4 h-4 mr-2" /> Add Caree
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, idx) => {
              const initials = (c.name || c.email || '?').slice(0, 2).toUpperCase()
              const progress = 60 + (idx * 7) % 35
              return (
                <div 
                  key={c._id} 
                  className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-lg hover:shadow-black/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${colors[idx % colors.length]} rounded-full flex items-center justify-center text-white font-medium`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-black">{c.name || "Unnamed"}</h3>
                        <p className="text-xs text-black/40">{c.email}</p>
                      </div>
                    </div>
                    <button className="text-black/20 hover:text-black/60 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/50">Today's progress</span>
                      <span className="font-medium text-black">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                      <span className="text-black/40">Last active: 2h ago</span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}