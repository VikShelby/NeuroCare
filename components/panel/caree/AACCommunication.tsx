"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// Removed LiveWaveform to avoid missing import; use a simple indicator
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import VoiceButton from "@/components/ui/VoiceButton"

interface RecordingState {
  isRecording: boolean
  isProcessing: boolean
  transcript: string
  error: string
  transcriptionTime?: number
}

interface SymbolItem {
  id?: string
  name: string
  image?: string
  repo?: string
}

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
}

const SUPPORTED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm"] as const
function getMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return "audio/webm"
}

export default function AACCommunication() {
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    transcript: "",
    error: "",
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const [symbols, setSymbols] = useState<SymbolItem[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null)
  const [finalPhrase, setFinalPhrase] = useState<string>("")
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string>("")
  const [voiceId, setVoiceId] = useState<string>(process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "")
  const [aacPlan, setAacPlan] = useState<{ intent: string; queries: string[]; tags: string[] } | null>(null)
  const [status, setStatus] = useState<string>("")

  const updateRecording = useCallback((updates: Partial<RecordingState>) => {
    setRecording((prev) => ({ ...prev, ...updates }))
  }, [])

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop()
    }
    cleanupStream()
    updateRecording({ isRecording: false })
  }, [cleanupStream, updateRecording])

  const processAudioClient = useCallback(async (audioBlob: Blob) => {
    updateRecording({ isProcessing: true, error: "" })
    try {
      setStatus("Transcribing...")
      const form = new FormData()
      form.append("file", audioBlob, "recording.webm")
      const res = await fetch("/api/aac/transcribe", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Transcription failed")
      updateRecording({ transcript: data.text || "", transcriptionTime: data.transcriptionTime })
      // Immediately get AAC plan (intent + queries) from Gemini with profile context
      try {
        setStatus("Planning keywords...")
        const planRes = await fetch('/api/aac/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: data.text || '' }) })
        const plan = await planRes.json()
        if (planRes.ok && !plan.error) {
          setAacPlan(plan)
        }
      } catch (e) { /* ignore */ }
    } catch (err: any) {
      updateRecording({ error: err.message || "Failed to transcribe audio" })
    }
    finally { setStatus(""); updateRecording({ isProcessing: false }) }
  }, [updateRecording])

  const startRecording = useCallback(async () => {
    try {
      updateRecording({ transcript: "", error: "", transcriptionTime: undefined })
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
      streamRef.current = stream
      const mimeType = getMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        processAudioClient(audioBlob)
      }
      mediaRecorder.start()
      updateRecording({ isRecording: true })
    } catch (err) {
      updateRecording({ error: "Microphone permission denied", isRecording: false })
      console.error("Microphone error:", err)
    }
  }, [processAudioClient, updateRecording])

  const handleRecordToggle = useCallback(() => {
    if (recording.isRecording) stopRecording()
    else startRecording()
  }, [recording.isRecording, startRecording, stopRecording])

  useEffect(() => () => cleanupStream(), [cleanupStream])

  const searchSymbols = useCallback(async () => {
    const queries = (aacPlan?.queries || []).map((q) => q.trim()).filter(Boolean)
    if (!queries.length) return
    try {
      setStatus("Searching symbols...")
      // Fetch for each keyword, aggregate candidates
      const all: any[] = []
      for (const q of queries) {
        const url = `https://symbotalkapiv1.azurewebsites.net/search/?name=${encodeURIComponent(q)}&lang=en&repo=arasaac&limit=10`
        const res = await fetch(url)
        const data = await res.json().catch(() => [])
        if (Array.isArray(data)) {
          for (const d of data) all.push(d)
        }
      }
      // Ask Gemini to filter the best options
      setStatus("Filtering best options...")
      const filtRes = await fetch('/api/aac/filter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: recording.transcript, candidates: all })
      })
      const filtered = await filtRes.json()
      const items: SymbolItem[] = Array.isArray(filtered?.selected) ? filtered.selected.map((d:any) => ({ name: d.name, image: d.image_url || d.alt_url, repo: d.repo_key })) : []
      setSymbols(items)
    } catch (err) {
      console.error("Symbol search/filter error", err)
    } finally { setStatus("") }
  }, [aacPlan?.queries, recording.transcript])

  const interpretWithGemini = useCallback(async () => {
    try {
      setStatus("Forming phrase...")
      const res = await fetch("/api/aac/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: recording.transcript, symbol: selectedSymbol })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Interpretation failed")
      setFinalPhrase(data.phrase || recording.transcript)
    } catch (err) {
      console.error("Gemini interpretation error", err)
    } finally { setStatus("") }
  }, [recording.transcript, selectedSymbol])

  const synthesizeVoice = useCallback(async () => {
    if (!finalPhrase) return
    try {
      const res = await fetch("/api/aac/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalPhrase, voiceId })
      })
      if (!res.ok) throw new Error("Failed to generate speech")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setVoiceAudioUrl(url)
    } catch (err) {
      console.error("TTS error", err)
    }
  }, [finalPhrase, voiceId])

  return (
    <div className="mx-auto w-full">
      <Card className="border-border relative m-0 gap-0 overflow-hidden p-0 shadow-2xl">
        <div className="relative py-6">
          <div className="flex h-32 items-center justify-center">
            {recording.isRecording ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording... Tap Stop when done.
              </div>
            ) : recording.isProcessing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner /> {status || "Processing..."}
              </div>
            ) : finalPhrase ? (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Phrase</div>
                <div className="text-lg font-medium">{finalPhrase}</div>
              </div>
            ) : symbols.length ? (
              <div className="text-sm text-muted-foreground">Select a symbol below</div>
            ) : recording.error ? (
              <div className="text-red-500 text-sm">{recording.error}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Tap Record to start</div>
            )}
          </div>
        </div>

        <Separator />
        
        <div className="bg-card px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {recording.transcriptionTime ? (
                <span className={cn("text-muted-foreground/60 font-mono text-[10px] tracking-widest uppercase", recording.transcriptionTime ? "animate-in fade-in duration-500" : "opacity-0")}>
                  {(recording.transcriptionTime / 1000).toFixed(2)}s
                </span>
              ) : null}
              {aacPlan?.queries?.length ? <span className="text-muted-foreground text-[10px]">{aacPlan.queries.slice(0,3).join(', ')}</span> : null}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRecordToggle} disabled={recording.isProcessing}>
                {recording.isRecording || recording.isProcessing ? "Stop" : "Record"}
              </Button>
              <Button size="sm" className="gap-2" onClick={searchSymbols} disabled={!aacPlan?.queries?.length}>Show Images</Button>
              <Button size="sm" className="gap-2" onClick={synthesizeVoice} disabled={!finalPhrase}>Speak</Button>
            </div>
          </div>
        </div>

        {symbols.length > 0 && (
          <div className="px-4 py-3">
            <div className="text-sm mb-2">Select a symbol that matches:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {symbols.map((s, idx) => (
                <button key={idx} className={cn("border rounded p-2 text-left", selectedSymbol?.name === s.name && "border-foreground")} onClick={() => { setSelectedSymbol(s); setFinalPhrase(""); interpretWithGemini(); }}>
                  <div className="text-xs font-medium">{s.name}</div>
                  {s.image && <img src={s.image} alt={s.name} className="mt-1 h-16 object-contain" />}
                  {s.repo && <div className="text-[10px] text-muted-foreground mt-1">{s.repo}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {finalPhrase && (
          <div className="px-4 pb-4">
            <div className="text-sm">Phrase:</div>
            <div className="text-base font-medium mb-2">{finalPhrase}</div>
            {voiceAudioUrl && <audio controls src={voiceAudioUrl} autoPlay className="w-full" />}
          </div>
        )}

      </Card> 
      <VoiceButton />
    </div>
  )
}

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
