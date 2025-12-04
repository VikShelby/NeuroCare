"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Volume2, Check, Sparkles, RotateCcw } from "lucide-react"

interface SymbolItem {
  id?: string
  name: string
  image?: string
  repo?: string
}

type FlowState = "idle" | "recording" | "processing" | "selecting" | "ready"

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
}

function getMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm"]
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return "audio/webm"
}

export default function AACCommunication() {
  const [flowState, setFlowState] = useState<FlowState>("idle")
  const [transcript, setTranscript] = useState("")
  const [symbols, setSymbols] = useState<SymbolItem[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolItem[]>([])
  const [finalPhrase, setFinalPhrase] = useState("")
  const [statusText, setStatusText] = useState("")
  const [error, setError] = useState("")
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => () => cleanupStream(), [cleanupStream])

  const reset = useCallback(() => {
    setFlowState("idle")
    setTranscript("")
    setSymbols([])
    setSelectedSymbols([])
    setFinalPhrase("")
    setStatusText("")
    setError("")
    cleanupStream()
  }, [cleanupStream])

  const startRecording = useCallback(async () => {
    try {
      setError("")
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
      streamRef.current = stream
      const mimeType = getMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        await processAudio(audioBlob)
      }
      
      mediaRecorder.start()
      setFlowState("recording")
    } catch (err) {
      setError("Microphone access denied")
      setFlowState("idle")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop()
    }
    cleanupStream()
    setFlowState("processing")
  }, [cleanupStream])

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatusText("Listening...")
      
      // Transcribe
      const form = new FormData()
      form.append("file", audioBlob, "recording.webm")
      const res = await fetch("/api/aac/transcribe", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Transcription failed")
      
      const text = data.text || ""
      setTranscript(text)
      setStatusText("Finding symbols...")

      // Get AAC plan
      const planRes = await fetch('/api/aac/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text })
      })
      const plan = await planRes.json()
      const queries = plan?.queries || []

      // Search symbols
      if (queries.length > 0) {
        const all: any[] = []
        for (const q of queries.slice(0, 5)) {
          const url = `https://symbotalkapiv1.azurewebsites.net/search/?name=${encodeURIComponent(q)}&lang=en&repo=arasaac&limit=8`
          const sRes = await fetch(url)
          const sData = await sRes.json().catch(() => [])
          if (Array.isArray(sData)) all.push(...sData)
        }

        // Filter best options
        setStatusText("Selecting best matches...")
        const filtRes = await fetch('/api/aac/filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: text, candidates: all })
        })
        const filtered = await filtRes.json()
        const items: SymbolItem[] = Array.isArray(filtered?.selected)
          ? filtered.selected.map((d: any) => ({
              name: d.name,
              image: d.image_url || d.alt_url,
              repo: d.repo_key
            }))
          : []
        
        setSymbols(items)
        setFlowState("selecting")
      } else {
        setFinalPhrase(text)
        setFlowState("ready")
      }
    } catch (err: any) {
      setError(err.message || "Failed to process audio")
      setFlowState("idle")
    } finally {
      setStatusText("")
    }
  }

  const toggleSymbol = (symbol: SymbolItem) => {
    setSelectedSymbols(prev => {
      const exists = prev.find(s => s.name === symbol.name)
      if (exists) {
        return prev.filter(s => s.name !== symbol.name)
      }
      return [...prev, symbol]
    })
  }

  const generatePhrase = async () => {
    if (selectedSymbols.length === 0) {
      setFinalPhrase(transcript)
      setFlowState("ready")
      return
    }

    setFlowState("processing")
    setStatusText("Creating phrase...")

    try {
      const res = await fetch("/api/aac/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          symbols: selectedSymbols.map(s => s.name)
        })
      })
      const data = await res.json()
      setFinalPhrase(data.phrase || transcript)
      setFlowState("ready")
    } catch (err) {
      setFinalPhrase(transcript)
      setFlowState("ready")
    } finally {
      setStatusText("")
    }
  }

  const speakPhrase = async () => {
    if (!finalPhrase) return
    
    setStatusText("Speaking...")
    try {
      const res = await fetch("/api/aac/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalPhrase })
      })
      if (!res.ok) throw new Error("Speech failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
      }
    } catch (err) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(finalPhrase)
      speechSynthesis.speak(utterance)
    } finally {
      setStatusText("")
    }
  }

  const handleOrbClick = () => {
    switch (flowState) {
      case "idle":
        startRecording()
        break
      case "recording":
        stopRecording()
        break
      case "selecting":
        generatePhrase()
        break
      case "ready":
        speakPhrase()
        break
    }
  }

  const getOrbConfig = () => {
    switch (flowState) {
      case "idle":
        return {
          gradient: "from-blue-500 to-purple-600",
          icon: <Mic className="w-10 h-10" />,
          label: "Tap to speak",
          pulse: false
        }
      case "recording":
        return {
          gradient: "from-red-500 to-pink-600",
          icon: <Mic className="w-10 h-10" />,
          label: "Listening...",
          pulse: true
        }
      case "processing":
        return {
          gradient: "from-amber-500 to-orange-600",
          icon: <Sparkles className="w-10 h-10 animate-spin" />,
          label: statusText || "Processing...",
          pulse: false
        }
      case "selecting":
        return {
          gradient: "from-emerald-500 to-teal-600",
          icon: <Check className="w-10 h-10" />,
          label: selectedSymbols.length > 0 ? `Confirm (${selectedSymbols.length})` : "Select symbols",
          pulse: false
        }
      case "ready":
        return {
          gradient: "from-violet-500 to-purple-600",
          icon: <Volume2 className="w-10 h-10" />,
          label: "Tap to speak",
          pulse: false
        }
    }
  }

  const orb = getOrbConfig()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 ">
      <audio ref={audioRef} className="hidden" />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AAC Communication
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Express yourself with symbols and voice
        </p>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && flowState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md text-center"
          >
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">You said</p>
            <p className="text-gray-900 dark:text-white font-medium">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Phrase Display */}
      <AnimatePresence>
        {finalPhrase && flowState === "ready" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg max-w-md text-center"
          >
            <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Phrase</p>
            <p className="text-white text-xl font-semibold">{finalPhrase}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Symbol Selection Grid */}
      <AnimatePresence>
        {flowState === "selecting" && symbols.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8 w-full max-w-lg"
          >
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
              Select symbols to build your phrase
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {symbols.map((symbol, idx) => {
                const isSelected = selectedSymbols.find(s => s.name === symbol.name)
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => toggleSymbol(symbol)}
                    className={cn(
                      "relative p-3 rounded-2xl border-2 transition-all",
                      "bg-white dark:bg-gray-800 hover:shadow-md",
                      isSelected
                        ? "border-emerald-500 shadow-emerald-100 dark:shadow-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {symbol.image && (
                      <img
                        src={symbol.image}
                        alt={symbol.name}
                        className="w-full h-16 object-contain mb-2"
                      />
                    )}
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {symbol.name}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb Button */}
      <motion.button
        onClick={handleOrbClick}
        disabled={flowState === "processing"}
        className="relative group"
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500",
          `bg-gradient-to-r ${orb.gradient}`,
          orb.pulse && "animate-pulse"
        )} />
        
        {/* Pulse rings for recording */}
        {flowState === "recording" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}

        {/* Main orb */}
        <div className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center",
          "bg-gradient-to-br shadow-2xl transition-all duration-300",
          orb.gradient,
          "text-white",
          flowState !== "processing" && "hover:scale-105 active:scale-95"
        )}>
          {orb.icon}
        </div>
      </motion.button>

      {/* Label */}
      <motion.p
        key={orb.label}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-gray-600 dark:text-gray-400 font-medium"
      >
        {orb.label}
      </motion.p>

      {/* Error */}
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}

      {/* Reset Button */}
      {flowState !== "idle" && flowState !== "recording" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={reset}
          className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start over
        </motion.button>
      )}
    </div>
  )
}
