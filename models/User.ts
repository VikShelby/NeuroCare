import mongoose, { Schema, models, Model, Types } from "mongoose";

export interface IUser {
  name?: string | null;
  email: string;
  image?: string | null;
  password?: string | null;
  emailVerified?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  // Profile fields
  role?: "caree" | "caregiver" | null;
  gender?: string | null;
  pronouns?: string | null;
    // Removed legacy freelancing fields: category, professionalRole, skills, experiences, education, languages
  bio?: string | null;
    // Removed legacy paymentRate
  dateOfBirth?: Date | null;
  profileCompleted?: boolean;
  // Relationships
  caregiverId?: Types.ObjectId | null; // set on caree
  careeIds?: Types.ObjectId[] | null;  // set on caregiver
    autismProfile?: {
    aboutMe?: string | null;
    interests?: string[];
    sensoryPreferences?: string | null;
    routines?: string | null;
    triggers?: string | null;
    calmingStrategies?: string | null;
    communicationNotes?: string | null;
    careGoals?: string | null;
    diagnosis?: string | null; // caree-specific optional
    formalDiagnosis?: string | null; // caree-specific optional (Yes/No/Prefer not to say)
    caregiverSkills?: string[]; // caregiver-specific optional
    availability?: string | null; // caregiver-specific optional
      // New QA fields
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
    } | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    password: { type: String },
    emailVerified: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: ["caree", "caregiver"], default: undefined },
    gender: { type: String },
    pronouns: { type: String },
      // Legacy freelancing fields removed
    bio: { type: String },
      // paymentRate removed
    dateOfBirth: { type: Date },
    profileCompleted: { type: Boolean, default: false },
    caregiverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    careeIds: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
    autismProfile: {
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
      // New QA fields
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
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
