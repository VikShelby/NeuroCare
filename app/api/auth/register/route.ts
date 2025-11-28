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
  supportNeeds: z.string().optional(),
  caregiverSkills: z.array(z.string()).optional(),
  availability: z.string().optional(),
}).optional();

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["caree", "caregiver"]).optional(),
  dateOfBirth: z.string().optional(),
  autismProfile: autismProfileSchema,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password, name, role, dateOfBirth, autismProfile } = parsed.data;

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
    if (autismProfile) doc.autismProfile = autismProfile;
    if (role || autismProfile) doc.profileCompleted = true;
    await User.create(doc);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
