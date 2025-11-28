import mongoose, { Schema, models, Model } from "mongoose";

export interface IExperience {
  name?: string | null;
  company?: string | null;
  location?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

export interface IEducation {
  school?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
}

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
  category?: string | null;
  professionalRole?: string | null;
  skills?: string[];
  experiences?: IExperience[];
  education?: IEducation[];
  languages?: string[];
  bio?: string | null;
  paymentRate?: number | null; // hourly or project rate
  dateOfBirth?: Date | null;
  profileCompleted?: boolean;
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
    supportNeeds?: string | null; // caree-specific optional
    caregiverSkills?: string[]; // caregiver-specific optional
    availability?: string | null; // caregiver-specific optional
  } | null;
}

export interface IUserDocument extends IUser, Document {}

const ExperienceSchema = new Schema<IExperience>(
  {
    name: { type: String },
    company: { type: String },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducation>(
  {
    school: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: false }
);

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
    category: { type: String },
    professionalRole: { type: String },
    skills: [{ type: String }],
    experiences: [ExperienceSchema],
    education: [EducationSchema],
    languages: [{ type: String }],
    bio: { type: String },
    paymentRate: { type: Number },
    dateOfBirth: { type: Date },
    profileCompleted: { type: Boolean, default: false },
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
      supportNeeds: { type: String },
      caregiverSkills: [{ type: String }],
      availability: { type: String },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
