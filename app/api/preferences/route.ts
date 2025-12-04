import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Preferences from "@/models/Preferences";
import User from "@/models/User";
import { z } from "zod";

const preferencesSchema = z.object({
  role: z.enum(["caree", "caregiver"]).optional(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  aboutMe: z.string().optional(),
  interests: z.array(z.string()).optional(),
  sensoryPreferences: z.string().optional(),
  routines: z.string().optional(),
  triggers: z.string().optional(),
  calmingStrategies: z.string().optional(),
  communicationNotes: z.string().optional(),
  careGoals: z.string().optional(),
  diagnosis: z.string().optional(),
  formalDiagnosis: z.string().optional(),
  caregiverSkills: z.array(z.string()).optional(),
  availability: z.string().optional(),
  anxietyFrequency: z.string().optional(),
  focusEase: z.number().optional(),
  overwhelmFrequency: z.string().optional(),
  preferredCommunication: z.string().optional(),
  eyeContactComfort: z.number().optional(),
  usesAAC: z.string().optional(),
  sensorySensitivity: z.number().optional(),
  texturesUncomfortable: z.string().optional(),
  sensorySeeking: z.number().optional(),
  routineImportance: z.number().optional(),
  upsetByChange: z.number().optional(),
  useOrganizationTools: z.string().optional(),
  favoriteHobbies: z.array(z.string()).optional(),
  specialInterestTime: z.string().optional(),
  absorptionLevel: z.number().optional(),
  socialComfort: z.number().optional(),
  preferAloneVsOthers: z.number().optional(),
  hardSocialCues: z.array(z.string()).optional(),
});

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const pref = await Preferences.findOne({ userId: (session.user as any).id }).lean();
  return NextResponse.json({ preferences: pref || null });
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  console.log("[preferences] incoming body:", JSON.stringify(body));
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  await connectToDatabase();
  const userId = (session.user as any).id;
  const update = { ...parsed.data } as any;
  // backward compat: map supportNeeds -> formalDiagnosis if ever sent
  if ((update as any).supportNeeds && !update.formalDiagnosis) {
    update.formalDiagnosis = (update as any).supportNeeds;
    delete update.supportNeeds;
  }
  const doc = await Preferences.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true }
  );
  console.log("[preferences] upserted:", doc ? doc._id : null, { role: doc?.role, gender: doc?.gender, pronouns: doc?.pronouns });
  // optional: mirror some fields onto User.autismProfile for convenience
  await User.findByIdAndUpdate(userId, { $set: { autismProfile: update, role: parsed.data.role ?? (await User.findById(userId))?.role, gender: parsed.data.gender, pronouns: parsed.data.pronouns } });
  return NextResponse.json({ ok: true });
}
