import mongoose, { Schema, models, Model, Types } from "mongoose";

export interface IPreferences {
  userId: Types.ObjectId;
  role?: "caree" | "caregiver";
  gender?: string | null;
  pronouns?: string | null;
  currentLessonId?: Types.ObjectId | null;
  aboutMe?: string | null;
  interests?: string[];
  sensoryPreferences?: string | null;
  routines?: string | null;
  triggers?: string | null;
  calmingStrategies?: string | null;
  communicationNotes?: string | null;
  careGoals?: string | null;
  diagnosis?: string | null;
  formalDiagnosis?: string | null;
  caregiverSkills?: string[];
  availability?: string | null;
  // QA fields
  anxietyFrequency?: string | null;
  focusEase?: number | null;
  overwhelmFrequency?: string | null;
  preferredCommunication?: string | null;
  eyeContactComfort?: number | null;
  usesAAC?: string | null;
  sensorySensitivity?: number | null;
  texturesUncomfortable?: string | null;
  sensorySeeking?: number | null;
  routineImportance?: number | null;
  upsetByChange?: number | null;
  useOrganizationTools?: string | null;
  favoriteHobbies?: string[] | null;
  specialInterestTime?: string | null;
  absorptionLevel?: number | null;
  socialComfort?: number | null;
  preferAloneVsOthers?: number | null;
  hardSocialCues?: string[] | null;
}

const PreferencesSchema = new Schema<IPreferences>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["caree", "caregiver"] },
  gender: { type: String },
  pronouns: { type: String },
  currentLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
  aboutMe: { type: String },
  interests: [{ type: String }],
  sensoryPreferences: { type: String },
  routines: { type: String },
  triggers: { type: String },
  calmingStrategies: { type: String },
  communicationNotes: { type: String },
  careGoals: { type: String },
  diagnosis: { type: String },
  formalDiagnosis: { type: String },
  caregiverSkills: [{ type: String }],
  availability: { type: String },
  anxietyFrequency: { type: String },
  focusEase: { type: Number },
  overwhelmFrequency: { type: String },
  preferredCommunication: { type: String },
  eyeContactComfort: { type: Number },
  usesAAC: { type: String },
  sensorySensitivity: { type: Number },
  texturesUncomfortable: { type: String },
  sensorySeeking: { type: Number },
  routineImportance: { type: Number },
  upsetByChange: { type: Number },
  useOrganizationTools: { type: String },
  favoriteHobbies: [{ type: String }],
  specialInterestTime: { type: String },
  absorptionLevel: { type: Number },
  socialComfort: { type: Number },
  preferAloneVsOthers: { type: Number },
  hardSocialCues: [{ type: String }],
}, { timestamps: true });

const Preferences: Model<IPreferences> = models.Preferences || mongoose.model<IPreferences>("Preferences", PreferencesSchema);

export default Preferences;
