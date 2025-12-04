import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Lesson from "@/models/Lesson";
import Preferences from "@/models/Preferences";
import User from "@/models/User";
// Google GenAI client will be imported dynamically to avoid build errors if not installed

function buildFallbackLesson(pref: any, user: any) {
  const title = "Social Communication Coaching: Reading Social Cues";
  const summary = "A structured, autism-aware lesson designed to improve comfort and skills in social communication scenarios, tailored to the user's preferences and sensory profile.";
  const objectives = [
    "Increase awareness of common social cues",
    "Practice preferred communication strategies (e.g., " + (pref?.preferredCommunication || "text or visual aids") + ")",
    "Build confidence engaging at a comfortable pace",
  ];
  const steps = [
    { label: "Warm-up", detail: "Start with a calming strategy: " + (pref?.calmingStrategies || "deep breaths, pressure, or a favorite song") },
    { label: "Identify cues", detail: "Review 3 social cues that are hard: " + JSON.stringify(pref?.hardSocialCues || ["sarcasm"]) },
    { label: "Preferred approach", detail: "Use your preferred communication method: " + (pref?.preferredCommunication || "text/DM") },
    { label: "Practice", detail: "Role-play a short scenario; limit eye contact to comfort level " + (pref?.eyeContactComfort ?? 2) },
    { label: "Reflect", detail: "Note what felt okay and what you prefer to change next time." },
  ];
  const practicePrompts = [
    "How would you respond to a group invite today?",
    "Ask a clarifying question when unsure about sarcasm.",
  ];
  const reflectionQuestions = [
    "What made today’s practice easier or harder?",
    "What support or tools helped most?",
  ];
  const tips = [
    "Schedule social time based on energy and absorption level (" + (pref?.absorptionLevel ?? 3) + ")",
    "Use organization tools: " + (pref?.useOrganizationTools || "planner/app") + " to plan small interactions",
    "Lean on hobbies like " + JSON.stringify(pref?.favoriteHobbies || []) + " to start conversations",
  ];
  return { title, summary, objectives, steps, practicePrompts, reflectionQuestions, tips };
}

async function generateLessonFromGemini(pref: any, user: any, avoidTitles: string[] = []) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Gemini not configured");

  const prompt = `You are a supportive, autism-aware social communication coach. Generate a detailed tutoring-style lesson, spoken as if guiding the learner, tailored to the user's preferences and sensory profile. Ensure novelty by avoiding overlap with prior lesson titles.

Return ONLY JSON with fields: { "title": string, "summary": string, "objectives": string[], "steps": { label: string, detail: string }[], "practicePrompts": string[], "reflectionQuestions": string[], "tips": string[] }.
Avoid repeating titles from: ${JSON.stringify(avoidTitles)}
Persona: ${JSON.stringify({
    autismLevel: pref?.diagnosis ?? user?.autismProfile?.diagnosis ?? null,
    formalDiagnosis: pref?.formalDiagnosis ?? user?.autismProfile?.formalDiagnosis ?? null,
    gender: pref?.gender ?? user?.gender ?? null,
    pronouns: pref?.pronouns ?? user?.pronouns ?? null,
  })}
Profile: ${JSON.stringify({
    anxietyFrequency: pref?.anxietyFrequency,
    focusEase: pref?.focusEase,
    overwhelmFrequency: pref?.overwhelmFrequency,
    preferredCommunication: pref?.preferredCommunication,
    eyeContactComfort: pref?.eyeContactComfort,
    usesAAC: pref?.usesAAC,
    sensorySensitivity: pref?.sensorySensitivity,
    texturesUncomfortable: pref?.texturesUncomfortable,
    sensorySeeking: pref?.sensorySeeking,
    routineImportance: pref?.routineImportance,
    upsetByChange: pref?.upsetByChange,
    useOrganizationTools: pref?.useOrganizationTools,
    favoriteHobbies: pref?.favoriteHobbies,
    specialInterestTime: pref?.specialInterestTime,
    absorptionLevel: pref?.absorptionLevel,
    socialComfort: pref?.socialComfort,
    preferAloneVsOthers: pref?.preferAloneVsOthers,
    hardSocialCues: pref?.hardSocialCues,
  })}
Constraints: Trauma-informed, supportive tone; accessible, concise steps; include specific activities and measurable objectives; end with reflection and a short homework.`;

  // Stream model output and robustly parse JSON
  let text = '';
  try {
    // @ts-ignore dynamic import
    const mod: any = await import("@google/genai");
    const ai = new mod.GoogleGenAI({ apiKey });
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const modelFallbacks = ['gemini-2.0-flash'];
    let lastErr: any = null;
    for (const model of modelFallbacks) {
      try {
        const stream: any = await ai.models.generateContentStream({ model, contents });
        for await (const chunk of stream) {
          if (chunk?.text) text += chunk.text;
        }
        text = text.trim();
        if (text) break;
      } catch (e: any) {
        lastErr = e;
        text = '';
        continue;
      }
    }
    if (!text && lastErr) throw lastErr;
  } catch (e) {
    console.error('[gemini] client error:', e);
    return buildFallbackLesson(pref, user);
  }

  const tryParse = (s: string) => { try { return JSON.parse(s) } catch { return null } };
  const extractJson = (raw: string) => {
    if (!raw) return null;
    const t = raw.trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence && fence[1]) {
      const p = tryParse(fence[1].trim());
      if (p) return p;
    }
    const greedy = t.match(/\{[\s\S]*\}/);
    if (greedy) {
      const p = tryParse(greedy[0]);
      if (p) return p;
    }
    const fi = t.indexOf('{'); const li = t.lastIndexOf('}');
    if (fi !== -1 && li !== -1 && li > fi) {
      const p = tryParse(t.slice(fi, li + 1));
      if (p) return p;
    }
    return null;
  };

  const parsed = extractJson(text) || buildFallbackLesson(pref, user);
  return parsed as any;
}

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const userId = (session.user as any).id;
  const lessons = await Lesson.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ lessons });
}

export async function POST() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const userId = (session.user as any).id;
  const pref = await Preferences.findOne({ userId }).lean();
  const user = await User.findById(userId).lean();
  if (!pref && !user) return NextResponse.json({ error: "No profile found" }, { status: 400 });
  try {
    const existing = await Lesson.find({ userId }).select({ title: 1 }).lean();
    const avoidTitles = (existing || []).map((l: any) => l.title).filter(Boolean);
    const lesson = await generateLessonFromGemini(pref || {}, user || {}, avoidTitles);
    const doc = await Lesson.create({
      userId,
      title: lesson.title || "Social Communication Lesson",
      summary: lesson.summary || "",
      content: JSON.stringify(lesson),
      autismProfileSnapshot: { preferences: pref || null, userAutismProfile: user?.autismProfile || null },
    });
    // Set this new lesson as current pointer in Preferences
    await Preferences.findOneAndUpdate(
      { userId },
      { $set: { currentLessonId: doc._id } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, lesson: doc });
  } catch (e: any) {
    console.error("[lessons] generation error:", e);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}