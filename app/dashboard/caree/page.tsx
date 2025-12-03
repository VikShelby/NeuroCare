
"use client"

import React, { useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { useScribe } from "@elevenlabs/react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, Copy, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { usePrevious } from "@/hooks/use-previous"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShimmeringText } from "@/components/ui/shimmering-text"

import type { ComponentProps } from "react"
import { useConversation } from "@elevenlabs/react"
import { useSession } from "next-auth/react"
import DockMenu from "@/components/panel/caree/DocMenu"
import ExpressSpeach from "@/components/panel/caree/ExpressSpeach"
import SocialCommunication from "@/components/panel/caree/SocialCommunication"
import AACCommunication from "@/components/panel/caree/AACCommunication"
import { useEffect, useState } from "react"
import { useGenMode } from "@/components/panel/caree/GenModeContext"
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Response } from "@/components/ui/response"
import { Orb } from "@/components/ui/orb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SortableList, SortableListItem, Item } from "@/components/ui/sortable-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen } from "lucide-react"


type SystemMessageType = "initial" | "connecting" | "connected" | "error"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  type?: SystemMessageType
}

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
  name: "Customer Support",
  description: "AI Voice Assistant",
}


type ConnectionState = "idle" | "connecting" | "connected" | "disconnecting"
type ChatActionsProps = ComponentProps<"div">

  const ChatActions = ({ className, children, ...props }: ChatActionsProps) => (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  )

  type ChatActionProps = ComponentProps<typeof Button> & {
    tooltip?: string
    label?: string
  }

  const ChatAction = ({
    tooltip,
    children,
    label,
    className,
    variant = "ghost",
    size = "sm",
    ...props
  }: ChatActionProps) => {
    const button = (
      <Button
        className={cn(
          "text-muted-foreground hover:text-foreground relative size-9 p-1.5",
          className
        )}
        size={size}
        type="button"
        variant={variant}
        {...props}
      >
        {children}
        <span className="sr-only">{label || tooltip}</span>
      </Button>
    )

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }
const TranscriptCharacter = React.memo(
  ({ char, delay }: { char: string; delay: number }) => {
    return (
      <motion.span
        initial={{ filter: `blur(3.5px)`, opacity: 0 }}
        animate={{ filter: `none`, opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        style={{ willChange: delay > 0 ? "filter, opacity" : "auto" }}
      >
        {char}
      </motion.span>
    )
  }
)
TranscriptCharacter.displayName = "TranscriptCharacter"

// Memoize background effects to prevent re-renders
const BackgroundAura = React.memo(
  ({ status, isConnected }: { status: string; isConnected: boolean }) => {
    const isActive = status === "connecting" || isConnected

    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 transition-opacity duration-300 ease-out",
          isActive ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center bottom pool - main glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: "130%",
            height: "20vh",
            background:
              "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(34, 211, 238, 0.5) 0%, rgba(168, 85, 247, 0.4) 35%, rgba(251, 146, 60, 0.5) 70%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />

        {/* Pulsing layer */}
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 animate-pulse",
            isConnected ? "opacity-100" : "opacity-80"
          )}
          style={{
            width: "100%",
            height: "18vh",
            background:
              "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(134, 239, 172, 0.5) 0%, rgba(192, 132, 252, 0.4) 50%, transparent 100%)",
            filter: "blur(60px)",
            animationDuration: "4s",
          }}
        />

        {/* Left corner bloom */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: "25vw",
            height: "30vh",
            background:
              "radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.5) 0%, rgba(134, 239, 172, 0.3) 30%, transparent 60%)",
            filter: "blur(70px)",
          }}
        />

        {/* Left rising glow - organic curve */}
        <div
          className="absolute bottom-0 -left-8"
          style={{
            width: "20vw",
            height: "45vh",
            background:
              "radial-gradient(ellipse 50% 100% at 10% 100%, rgba(34, 211, 238, 0.4) 0%, rgba(134, 239, 172, 0.25) 25%, transparent 60%)",
            filter: "blur(60px)",
            animation: "pulseGlow 5s ease-in-out infinite alternate",
          }}
        />

        {/* Right corner bloom */}
        <div
          className="absolute right-0 bottom-0"
          style={{
            width: "25vw",
            height: "30vh",
            background:
              "radial-gradient(circle at 100% 100%, rgba(251, 146, 60, 0.5) 0%, rgba(251, 146, 60, 0.3) 30%, transparent 60%)",
            filter: "blur(70px)",
          }}
        />

        {/* Right rising glow - organic curve */}
        <div
          className="absolute -right-8 bottom-0"
          style={{
            width: "20vw",
            height: "45vh",
            background:
              "radial-gradient(ellipse 50% 100% at 90% 100%, rgba(251, 146, 60, 0.4) 0%, rgba(192, 132, 252, 0.25) 25%, transparent 60%)",
            filter: "blur(60px)",
            animation: "pulseGlow 5s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: "100%",
            height: "15vh",
            background:
              "linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.3) 30%, rgba(251, 146, 60, 0.3) 60%, rgba(134, 239, 172, 0.3) 100%)",
            filter: "blur(30px)",
            animation: "shimmer 8s linear infinite",
          }}
        />
      </div>
    )
  }
)
BackgroundAura.displayName = "BackgroundAura"

// Memoize bottom controls with comparison function
const BottomControls = React.memo(
  ({
    isConnected,
    getInputVolume,
    getOutputVolume,
    onStop,
  }: {
    isConnected: boolean
    getInputVolume: () => number,
    getOutputVolume: () => number,
    onStop: () => void
  }) => {
    return (
      <AnimatePresence mode="popLayout">
        {isConnected  && (
          <motion.div
            key="bottom-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.1 },
            }}
            exit={{
              opacity: 0,
              y: 10,
              transition: { duration: 0.1 },
            }}
            className="fixed bottom-60 xl:bottom-20 left-1/2 z-40 -translate-x-1/2 h-24 w-24 flex items-center justify-center"
          >
            <motion.div
              layoutId="voice-orb"
              key="orb-bottom"
              initial={{ opacity: 0.85, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.7, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
              className="h-24 w-24 will-change-transform"
            >
              <Orb
                className="h-24 w-24"
                volumeMode="manual"
                onClick={onStop}
                getInputVolume={getInputVolume}
                getOutputVolume={getOutputVolume}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
  (prev, next) => {
    if (prev.isConnected !== next.isConnected) return false
   
    return true
  }
)
BottomControls.displayName = "BottomControls"

export default  function CareeDashboard() {

 


    const { data: session } = useSession()
    const { mode } = useGenMode()
    const userName = (session?.user as any)?.name || (session?.user as any)?.email || "You"
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [agentState, setAgentState] = useState<
      "disconnected" | "connecting" | "connected" | "disconnecting" | null
    >("disconnected")
    const [textInput, setTextInput] = useState("")
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const isTextOnlyModeRef = useRef<boolean>(true)
  
    const conversation = useConversation({
      dynamicVariables:{
        user_name: userName,
      },
      onConnect: () => {
        // Only clear messages for voice mode
        if (!isTextOnlyModeRef.current) {
          setMessages([])
        }
      },   
      onDisconnect: () => {
        // Only clear messages for voice mode
        if (!isTextOnlyModeRef.current) {
          setMessages([])
        }
      },
      onMessage: (message) => {
        if (message.message) {
          const newMessage: ChatMessage = {
            role: message.source === "user" ? "user" : "assistant",
            content: message.message,
          }
          setMessages((prev) => [...prev, newMessage])
        }
      },
      onError: (error) => {
        console.error("Error:", error)
        setAgentState("disconnected")
      },
      onDebug: (debug) => {
        console.log("Debug:", debug)
      },
    })
  
    const getMicStream = useCallback(async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream
        setErrorMessage(null)
        return stream
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage("Please enable microphone permissions in your browser.")
        }
        throw error
      }
    }, [])
  
    const startConversation = useCallback(
      async (
        textOnly: boolean = true,
        skipConnectingMessage: boolean = false
      ) => {
        try {
          isTextOnlyModeRef.current = textOnly
  
          if (!skipConnectingMessage) {
            setMessages([])
          }
  
          if (!textOnly) {
            await getMicStream()
          }
  
          await conversation.startSession({
            agentId: DEFAULT_AGENT.agentId,
            connectionType: textOnly ? "websocket" : "webrtc",
            overrides: {
              conversation: {
                textOnly: textOnly,
              },
              agent: {
                // Provide a first message in voice mode to elicit a spoken response
                firstMessage: textOnly ? "" : undefined,
              },
            },
            onStatusChange: (status) => setAgentState(status.status),
          })
        } catch (error) {
          console.error(error)
          setAgentState("disconnected")
          setMessages([])
        }
      },
      [conversation, getMicStream]
    )
  
    const handleCall = useCallback(async () => {
      if (agentState === "disconnected" || agentState === null) {
        setAgentState("connecting")
        try {
          await startConversation(false)
        } catch {
          setAgentState("disconnected")
        }
      } else if (agentState === "connected") {
        conversation.endSession()
        setAgentState("disconnected")
  
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
          mediaStreamRef.current = null
        }
      }
    }, [agentState, conversation, startConversation])

    // Auto-disconnect voice assistant if GenMode changes mid-connection
    useEffect(() => {
      const isActive = agentState === "connecting" || agentState === "connected"
      if (!isActive) return
      if (mode !== "voice-assistant") {
        // End the session and stop mic
        try {
          conversation.endSession()
        } catch {}
        setAgentState("disconnected")
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
          mediaStreamRef.current = null
        }
      }
    }, [mode, agentState, conversation])
  
    const handleTextInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextInput(e.target.value)
      },
      []
    )
  
    const handleSendText = useCallback(async () => {
      if (!textInput.trim()) return
  
      const messageToSend = textInput
  
      if (agentState === "disconnected" || agentState === null) {
        const userMessage: ChatMessage = {
          role: "user",
          content: messageToSend,
        }
        setTextInput("")
        setAgentState("connecting")
  
        try {
          await startConversation(true, true)
          // Add message once converstation started
          setMessages([userMessage])
          // Send message after connection is established
          conversation.sendUserMessage(messageToSend)
        } catch (error) {
          console.error("Failed to start conversation:", error)
        }
      } else if (agentState === "connected") {
        const newMessage: ChatMessage = {
          role: "user",
          content: messageToSend,
        }
        setMessages((prev) => [...prev, newMessage])
        setTextInput("")
  
        conversation.sendUserMessage(messageToSend)
      }
    }, [textInput, agentState, conversation, startConversation])
  
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSendText()
        }
      },
      [handleSendText]
    )
  
    useEffect(() => {
      return () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        }
      }
    }, [])

    // Listen for global audio shutdown requests (e.g., when Express Speech starts)
    useEffect(() => {
      const handler = () => {
        try {
          conversation.endSession()
        } catch {}
        setAgentState("disconnected")
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
          mediaStreamRef.current = null
        }
      }
      window.addEventListener('audio-shutdown', handler as EventListener)
      return () => window.removeEventListener('audio-shutdown', handler as EventListener)
    }, [conversation])
  
    const isCallActive = agentState === "connected"
    const isTransitioning =
      agentState === "connecting" || agentState === "disconnecting"
  
    const getInputVolume = useCallback(() => {
      const rawValue = conversation.getInputVolume?.() ?? 0
      return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
    }, [conversation])
  
    const getOutputVolume = useCallback(() => {
      const rawValue = conversation.getOutputVolume?.() ?? 0
      return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
    }, [conversation])

      // Broadcast agent connection state to other components (e.g., DockMenu)
      // Now true during both connecting and connected phases
      useEffect(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('agent-connection-state', {
              detail: { connected: agentState === 'connecting' || agentState === 'connected' }
            })
          )
        }
      }, [agentState])
    
  // When social coach mode, ensure a lesson exists or prompt to generate
  const [hasLesson, setHasLesson] = useState<boolean | null>(null)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [genLoading, setGenLoading] = useState(false)
  const [showLessonSelector, setShowLessonSelector] = useState(false)
  
  useEffect(() => {
    const checkLessons = async () => {
      try {
        const res = await fetch("/api/lessons", { method: "GET" })
        if (!res.ok) { setHasLesson(false); return }
        const data = await res.json().catch(() => ({}))
        const lessons = Array.isArray(data.lessons) ? data.lessons : []
        setAllLessons(lessons)
        setHasLesson(lessons.length > 0)
      } catch { setHasLesson(false) }
    }
    if (mode === "social-communication-coach") checkLessons()
  }, [mode])

  const handleGenerateLesson = async () => {
    setGenLoading(true)
    try {
      const res = await fetch("/api/lessons", { method: "POST" })
      setGenLoading(false)
      if (!res.ok) return
      // Refresh lessons list
      const listRes = await fetch("/api/lessons", { method: "GET" })
      const data = await listRes.json().catch(() => ({}))
      const lessons = Array.isArray(data.lessons) ? data.lessons : []
      setAllLessons(lessons)
      setHasLesson(lessons.length > 0)
    } catch { setGenLoading(false) }
  }

  const handleSelectLesson = async (lessonId: string) => {
    try {
      await fetch("/api/lessons/set-current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      })
      setShowLessonSelector(false)
      // Reload to pick up new lesson
      window.location.reload()
    } catch (e) {
      console.error("Failed to set current lesson:", e)
    }
  }
  useEffect(() => {console.log(messages)} , [messages])
  // If Expression & Speech Support mode is selected, render the realtime transcriber experience
  if (mode === "expression-speech-support") return <ExpressSpeach />
  // AAC Communication mode
  if (mode === "aac-communication") return <AACCommunication />

  if (mode === "social-communication-coach") {
    if (hasLesson === false) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">No lessons found for your profile.</p>
            <Button onClick={handleGenerateLesson} disabled={genLoading}>
              {genLoading ? "Generating..." : "Generate New Lesson"}
            </Button>
          </div>
        </div>
      )
    }
    if (hasLesson === true) {
      return (
        <>
          <SocialCommunication />
          <Button
            onClick={() => setShowLessonSelector(true)}
            className="fixed top-4 left-4 z-50"
            variant="outline"
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Change Lesson
          </Button>
          <Dialog open={showLessonSelector} onOpenChange={setShowLessonSelector}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select a Lesson</DialogTitle>
                <DialogDescription>
                  Choose a lesson to practice or generate a new one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <SortableList
                  items={allLessons.map((lesson: any, idx: number) => ({
                    id: idx,
                    text: lesson.title || "Untitled Lesson",
                    description: lesson.summary || "",
                    checked: false,
                  }))}
                  setItems={() => {}}
                  onCompleteItem={() => {}}
                  renderItem={(item, order, onComplete, onRemove) => (
                    <div key={item.id} className="mb-2">
                      <button
                        onClick={() => {
                          const lesson = allLessons[item.id]
                          if (lesson?._id) handleSelectLesson(lesson._id)
                        }}
                        className="w-full text-left"
                      >
                        <SortableListItem
                          item={item}
                          order={order}
                          onCompleteItem={onComplete}
                          onRemoveItem={onRemove}
                          handleDrag={() => {}}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </button>
                    </div>
                  )}
                />
                <div className="pt-4 border-t">
                  <Button onClick={handleGenerateLesson} disabled={genLoading} className="w-full">
                    {genLoading ? "Generating..." : "Generate New Lesson"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    }
  }

  return (
  <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center">
      <BackgroundAura
        status={agentState === "connecting" ? "connecting" : agentState ?? "idle"}
        isConnected={agentState === "connected"}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-20%) scale(1);
          }
          50% {
            transform: translateX(20%) scale(1.1);
          }
          100% {
            transform: translateX(-20%) scale(1);
          }
        }
        @keyframes drift {
          0% {
            transform: translateX(-10%) scale(1);
          }
          100% {
            transform: translateX(10%) scale(1.05);
          }
        }
        @keyframes pulseGlow {
          0% {
            opacity: 0.5;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0.8;
            transform: translateY(-5%) scale(1.02);
          }
        }
      `}</style>

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden px-8 py-12">
        {/* Main transcript area */}
        <div className="relative flex min-h-[350px] w-full flex-1 items-center justify-center overflow-hidden">
          {/* Transcript - shown when there's content */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-250",
              isCallActive ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {isCallActive && (
              <TranscriberTranscript
                transcript={messages}
                error={errorMessage ?? ""}
                isPartial={true}
                isConnected={agentState === "connected"}
              />
            )}
          </div>

          {/* Status text - shown when no content */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-250",
              !isCallActive ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
           
           
          </div>

         {messages.length === 0 && (
                <ConversationEmptyState
                  icon={
                    <AnimatePresence mode="popLayout">
                      {!isCallActive && (
                        <motion.div
                          layoutId="voice-orb"
                          key="orb-top"
                          initial={{ opacity: 0.95, scale: 1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0.9, scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
                          className="h-24 w-24 will-change-transform"
                        >
                          <Orb onClick={handleCall} className="h-24 w-24" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  }
                  title={
                    agentState === "connecting" ? (
                      <ShimmeringText text="Starting conversation" />
                    ) : agentState === "connected" ? (
                      <ShimmeringText text="Start talking or type" />
                    ) : (
                      "Start a conversation"
                    )
                  }
                  description={
                    agentState === "connecting"
                      ? "Connecting..."
                      : agentState === "connected"
                        ? "Ready to chat"
                        : "Type a message or tap the voice button"
                  }
                />
              ) }
          
        </div>
         <BottomControls
          isConnected={agentState === "connected"}
          onStop={handleCall}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
         
        />

      </div>
    </div>
  );
}

const TranscriberTranscript = React.memo(
  ({
    transcript,
    error,
    isPartial,
    isConnected,
  }: {
    transcript: ChatMessage[]
    error: string
    isPartial?: boolean
    isConnected: boolean
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [previousTranscriptLength, setPreviousTranscriptLength] = useState(0)

    // Auto-scroll to bottom when connected and text is updating
    useEffect(() => {
      if (isConnected && scrollRef.current) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }, 50)
      }
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }, [transcript, isConnected])

    useEffect(() => {
      setPreviousTranscriptLength(transcript.length)
    }, [transcript.length])

    return (
      <div className="absolute inset-0 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div className="w-full px-12 py-8 space-y-6">
            {transcript.map((message, msgIndex) => {
              const characters = message.content.split("")
              const isNewMessage = msgIndex >= previousTranscriptLength - 1
              
              return (
                <div
                  key={msgIndex}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] text-xl leading-relaxed font-light",
                      message.role === "user" 
                        ? "text-foreground/90 text-right" 
                        : "text-foreground/90 text-left",
                      error && "text-red-500",
                      isPartial && !error && "text-foreground/60"
                    )}
                  >
                    {characters.map((char, charIndex) => {
                      const delay = isNewMessage ? charIndex * 0.012 : 0
                      return (
                        <TranscriptCharacter 
                          key={`${msgIndex}-${charIndex}`} 
                          char={char} 
                          delay={delay} 
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
)
TranscriberTranscript.displayName = "TranscriberTranscript"
