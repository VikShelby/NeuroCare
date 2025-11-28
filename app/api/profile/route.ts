import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const experienceSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  school: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

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
});

const profileSchema = z.object({
  role: z.enum(["caree", "caregiver"]).optional(),
  category: z.string().optional(),
  professionalRole: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  paymentRate: z.number().optional(),
  dateOfBirth: z.string().optional(),
  name: z.string().optional(),
  autismProfile: autismProfileSchema.optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }
  await connectToDatabase();
  const update: any = { ...parsed.data };
  // If onboarding payload provided (role or autismProfile), mark complete
  if (parsed.data.role || parsed.data.autismProfile) {
    update.profileCompleted = true;
  }
  if (update.dateOfBirth) {
    update.dateOfBirth = new Date(update.dateOfBirth);
  }
  if (update.experiences) {
    update.experiences = update.experiences.map((exp: any) => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : undefined,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    }));
  }
  if (update.education) {
    update.education = update.education.map((ed: any) => ({
      ...ed,
      startDate: ed.startDate ? new Date(ed.startDate) : undefined,
      endDate: ed.endDate ? new Date(ed.endDate) : undefined,
    }));
  }
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: update },
    { new: true }
  ).select("email name profileCompleted");
  return NextResponse.json({ ok: true, profileCompleted: user?.profileCompleted ?? false });
}
