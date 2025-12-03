
"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import { useGenMode } from "@/components/panel/caree/GenModeContext"
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Response } from "@/components/ui/response"
import { Orb } from "@/components/ui/orb"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"


type SystemMessageType = "initial" | "connecting" | "connected" | "error"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  type?: SystemMessageType
}

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_COACH_ID!,
  name: "Social Communication Coach",
  description: "Adaptive conversational coaching for neurodiverse users",
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
                colors={["#F6E7D8", "#E0CFC2"]}
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

export default  function SocialCommunication() {

 


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
  
    // Lesson state
    const [lesson, setLesson] = useState<any | null>(null)
    const [lessonLoading, setLessonLoading] = useState(false)
    const [systemPrompt, setSystemPrompt] = useState<string | null>(null)

     
    const lessonDynamics: Record<string, string | number | boolean> = useMemo(() => {
      if (!lesson) {
        return {
          title: '',
          lesson_summary: '',
          lesson_objectives: '',
          lesson_steps: '',
          lesson_practice_prompts: '',
          lesson_reflection_questions: '',
          lesson_tips: '',
          lesson_first_reflection_question: '',
          lesson_second_reflection_question: '',
          profile_preferredCommunication: '',
          profile_eyeContactComfort: '',
          profile_absorptionLevel: '',
          profile_socialComfort: '',
          profile_favoriteHobbies: '',
          profile_useOrganizationTools: '',
          profile_anxietyFrequency: '',
          // progress defaults
          lesson_percent_complete: 0,
          lesson_current_step_index: 0,
          lesson_total_steps: 0,
          lesson_completed_steps_count: 0,
        }
      }
      let parsed: any = null
      try { parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content } catch { parsed = {} }
      const ap = lesson.autismProfileSnapshot?.userAutismProfile || {}
      const objectives: string[] = parsed.objectives || []
      const steps: any[] = parsed.steps || []
      const practicePrompts: string[] = parsed.practicePrompts || []
      const reflectionQuestions: string[] = parsed.reflectionQuestions || []
      const tips: string[] = parsed.tips || []
      const currentIdx = (lesson.progress?.currentStepIndex ?? 0) as number
      const completedSteps = Array.isArray(lesson.progress?.completedSteps) ? (lesson.progress!.completedSteps as number[]) : []
      const percent = (lesson.progress?.percent ?? Math.round(((completedSteps.length / Math.max(1, steps.length)) * 100))) as number
      return {
        title: parsed.title || 'Lesson',
        lesson_summary: parsed.summary || '',
        lesson_objectives: objectives.join('\n'),
        lesson_steps: steps.map((s:any,i:number)=>`${i+1}. ${(s.label||'Step')} — ${s.detail||''}`).join('\n'),
        lesson_practice_prompts: practicePrompts.join('\n'),
        lesson_reflection_questions: reflectionQuestions.join('\n'),
        lesson_tips: tips.join('\n'),
        lesson_first_reflection_question: reflectionQuestions[0] || '',
        lesson_second_reflection_question: reflectionQuestions[1] || '',
        profile_preferredCommunication: ap.preferredCommunication || '',
        profile_eyeContactComfort: (ap.eyeContactComfort ?? '').toString(),
        profile_absorptionLevel: (ap.absorptionLevel ?? '').toString(),
        profile_socialComfort: (ap.socialComfort ?? '').toString(),
        profile_favoriteHobbies: Array.isArray(ap.favoriteHobbies) ? ap.favoriteHobbies.join(', ') : (ap.favoriteHobbies || ''),
        profile_useOrganizationTools: ap.useOrganizationTools || '',
        profile_anxietyFrequency: ap.anxietyFrequency || '',
        // progress as dynamic variables
        lesson_percent_complete: percent,
        lesson_current_step_index: currentIdx,
        lesson_total_steps: steps.length,
        lesson_completed_steps_count: completedSteps.length,
      }
    }, [lesson])

    // Fetch current lesson when social coach mode is active
    useEffect(() => {
      if (mode !== 'social-communication-coach') return
      let cancelled = false
      const run = async () => {
        setLessonLoading(true)
        // Broadcast lesson loading state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('lesson-loading-state', {
              detail: { loading: true }
            })
          )
        }
        try {
          const res = await fetch('/api/lessons/current', { method: 'GET' })
          const data = await res.json().catch(() => ({}))
          if (!cancelled && data?.lesson) {
            setLesson(data.lesson)
            // Fetch latest progress snapshot and merge into lesson
            try {
              const progRes = await fetch(`/api/lessons/progress?lessonId=${data.lesson._id}`)
              const progData = await progRes.json().catch(() => ({}))
              if (progData?.progress) {
                setLesson((prev: any) => prev ? { ...prev, progress: progData.progress } : prev)
              }
            } catch {}
            // Resume logic: set dynamic variables for progress
            try {
              const parsed = typeof data.lesson.content === 'string' ? JSON.parse(data.lesson.content) : (data.lesson.content || {})
              const steps = Array.isArray(parsed?.steps) ? parsed.steps : []
              const currentIndex = data.lesson.progress?.currentStepIndex ?? 0
              const percent = data.lesson.progress?.percent ?? 0
              // If API supports updating dynamic variables mid-session, merge here;
              // otherwise, include these in initial dynamicVariables.
              // conversation.setDynamicVariables?.({
              //   lesson_percent_complete: percent,
              //   lesson_current_step_index: currentIndex,
              //   lesson_total_steps: steps.length,
              // })
            } catch {}
          }
        } catch (err) {
          console.error('[lessons/current] fetch error', err)
        } finally {
          if (!cancelled) {
            setLessonLoading(false)
            // Broadcast lesson loading complete
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('lesson-loading-state', {
                  detail: { loading: false }
                })
              )
            }
          }
        }
      }
      run()
      return () => { cancelled = true }
    }, [mode])

    
   console.log(session , lesson)
    const conversation = useConversation({
      dynamicVariables: {
        user_name: userName,
        userId: (session?.user as any)?.id || "", 
        lessonId: lesson?._id || "",
        currentStepIndex: lesson?.progress?.currentStepIndex ?? 0,
        ...lessonDynamics,
      },
    
      onConnect: () => {
        if (!isTextOnlyModeRef.current) setMessages([])
        sendProgress('voice-start')
      },
      onDisconnect: () => {
        if (!isTextOnlyModeRef.current) setMessages([])
        sendProgress('voice-end')
      },
      onMessage: (message) => {
        if (message.message) {
          const newMessage: ChatMessage = {
            role: message.source === 'user' ? 'user' : 'assistant',
            content: message.message,
          }
          setMessages(prev => [...prev, newMessage])
        }
      },
      onError: (error: any) => {
        const normalized = error && typeof error === 'object' && 'message' in error
          ? error
          : new Error(`conversation error: ${JSON.stringify(error)}`)
        console.error('[Conversation error]', normalized)
        setAgentState('disconnected')
      },
      onStatusChange: (status) => setAgentState((status as any).status || status as any),
      onDebug: () => {},
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
            connectionType: textOnly ? 'websocket' : 'webrtc',
            userId: (session?.user as any)?.id || undefined,
          })
        } catch (error) {
          console.error(error)
          setAgentState("disconnected")
          setMessages([])
        }
      },
      [conversation, getMicStream, session]
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

    // Auto-disconnect social coach session if GenMode changes away mid-connection
    useEffect(() => {
      const isActive = agentState === "connecting" || agentState === "connected"
      if (!isActive) return
      if (mode !== "social-communication-coach") {
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

    // Session tracking only (step completion now handled by agent webhook)
    const sendProgress = useCallback(async (action: 'voice-start' | 'voice-end') => {
      if (!lesson?._id) return
      try {
        const parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : (lesson.content || {})
        const totalSteps = Array.isArray(parsed?.steps) ? parsed.steps.length : 0
        await fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson._id, action, totalSteps }),
        })
      } catch (e) {
        console.error('[lessons/progress] session tracking error', e)
      }
    }, [lesson])

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

      // Poll for progress updates while connected (agent webhook updates via external call)
      useEffect(() => {
        if (agentState !== 'connected' || !lesson?._id) return
        
        const pollProgress = async () => {
          try {
            const res = await fetch(`/api/lessons/progress?lessonId=${lesson._id}`)
            const data = await res.json().catch(() => ({}))
            if (data?.progress) {
              setLesson(prev => prev ? ({ ...prev, progress: data.progress }) : prev)
            }
          } catch (e) {
            console.error('[poll progress] error', e)
          }
        }

        const interval = setInterval(pollProgress, 3000) // Poll every 3 seconds
        return () => clearInterval(interval)
      }, [agentState, lesson?._id])
    
  // If Expression & Speech Support mode is selected, render the realtime transcriber experience
  if (mode === "expression-speech-support") {
    return <ExpressSpeach />
  }

  // Loading state for lesson before coach starts
  if (mode === 'social-communication-coach' && lessonLoading && !lesson) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
       <Spinner/>
      </div>
    )
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
                          <Orb colors={["#F6E7D8", "#E0CFC2"]} onClick={handleCall} className="h-24 w-24" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  }
                  title={
                    agentState === "connecting" ? (
                      <ShimmeringText text="Preparing coach" />
                    ) : agentState === "connected" ? (
                      <ShimmeringText text="Begin social practice" />
                    ) : (  
                      "Social Communication Coach"
                    )
                  }
                  description={
                    agentState === "connecting"
                      ? "Establishing adaptive coaching session..."
                      : agentState === "connected"
                        ? "Practice conversation, ask for feedback, or explore scenarios."
                        : "Type or speak to start — supportive space for autistic & neurodiverse expression."
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
      {lesson && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge variant="outline">
            {(() => {
              let stepsCount = 0
              try {
                const parsed = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : (lesson.content || {})
                stepsCount = Array.isArray(parsed?.steps) ? parsed.steps.length : 0
              } catch {}
              const currentIdx = lesson.progress?.currentStepIndex ?? 0
              const percent = lesson.progress?.percent ?? 0
              return `Step ${Math.min(currentIdx + 1, Math.max(1, stepsCount))}/${Math.max(1, stepsCount)} • ${percent}%`
            })()}
          </Badge>
        </div>
      )}
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
