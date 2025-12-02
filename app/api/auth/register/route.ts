import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const autismProfileSchema = z.object({
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
  // New QA fields
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
}).optional();

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["caree", "caregiver"]).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  autismProfile: autismProfileSchema,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[register] incoming body:", JSON.stringify(body));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    let { email, password, name, role, dateOfBirth, gender, pronouns, autismProfile } = parsed.data;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    await connectToDatabase();
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const doc: any = {
      email,
      name: name || email.split("@")[0],
      password: hash,
    };
    if (role) doc.role = role;
    if (dateOfBirth) doc.dateOfBirth = new Date(dateOfBirth);
    if (gender) doc.gender = gender;
    if (pronouns) doc.pronouns = pronouns;
    // Backward compatibility: map legacy supportNeeds -> formalDiagnosis if present
    let mappedAutism: any = null;
    if (autismProfile) {
      mappedAutism = { ...autismProfile } as any;
      if ((mappedAutism as any).supportNeeds && !mappedAutism.formalDiagnosis) {
        mappedAutism.formalDiagnosis = (mappedAutism as any).supportNeeds;
        delete mappedAutism.supportNeeds;
      }
      doc.autismProfile = mappedAutism;
    }
    if (role || autismProfile) doc.profileCompleted = true;
    const created = await User.create(doc);
    console.log("[register] created user:", created._id);
    // If onboarding preferences provided, persist them linked to userId
    if (mappedAutism || role) {
      const prefs = {
        userId: created._id as any,
        role,
        gender,
        pronouns,
        ...mappedAutism,
      } as any;
      console.log("[register] prefs to upsert:", JSON.stringify(prefs));
      const { default: Preferences } = await import("@/models/Preferences");
      const upserted = await Preferences.findOneAndUpdate(
        { userId: created._id },
        { $set: prefs },
        { upsert: true, new: true }
      );
      console.log("[register] upserted preferences:", upserted ? upserted._id : null, { role: upserted?.role, gender: upserted?.gender, pronouns: upserted?.pronouns });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
