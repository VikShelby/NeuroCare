import { NextRequest, NextResponse } from "next/server"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { SpeechToTextChunkResponseModel } from "@elevenlabs/elevenlabs-js/api/types/SpeechToTextChunkResponseModel"

const MODEL_ID = "scribe_v1"

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Service not configured" }, { status: 500 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 })

    const client = new ElevenLabsClient({ apiKey })
    const startTime = Date.now()
    const transcriptionResult = await client.speechToText.convert({
      file,
      modelId: MODEL_ID,
      languageCode: "en",
    })
    const transcriptionTime = Date.now() - startTime
    const rawText = (transcriptionResult as SpeechToTextChunkResponseModel).text
    if (!rawText) return NextResponse.json({ error: "No transcription available" }, { status: 500 })

    return NextResponse.json({ text: rawText, transcriptionTime })
  } catch (error: any) {
    console.error("[aac/transcribe] error", error)
    return NextResponse.json({ error: error?.message || "Failed to transcribe audio" }, { status: 500 })
  }
}
