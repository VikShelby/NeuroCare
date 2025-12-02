"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function EditLessonPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/caree/lessons/${id}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        setTitle(data.lesson?.title || '')
        setDescription(data.lesson?.description || '')
        setContent(data.lesson?.content || '')
      } catch (e:any) {
        setError(e.message || 'Failed to load')
      }
    }
    load()
  }, [id])

  const save = async () => {
    try {
      setError(''); setOk(false)
      const res = await fetch(`/api/caree/lessons/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, content })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setOk(true)
    } catch (e:any) {
      setError(e.message || 'Failed to save')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Edit Lesson</h1>
      <Card className="p-4 space-y-4">
        <div>
          <div className="text-sm font-medium">Title</div>
          <Input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-medium">Description</div>
          <Textarea value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-medium">Content</div>
          <Textarea value={content} onChange={e=>setContent(e.target.value)} rows={10} />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save}>Save</Button>
          {ok && <div className="text-sm text-green-600">Saved</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </Card>
    </div>
  )
}
