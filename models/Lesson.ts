import mongoose, { Schema, models, Model, Types } from "mongoose"

export interface ILesson {
  title: string
  description?: string
  content?: string
  objectives?: string[]
  tags?: string[]
  caregiverId?: Types.ObjectId
  careeId?: Types.ObjectId
  userId?: Types.ObjectId
  progress?: {
    currentStepIndex: number
    completedSteps: number[]
    percent: number
    startedAt?: Date
    updatedAt?: Date
    completedAt?: Date | null
  }
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  objectives: [{ type: String }],
  tags: [{ type: String }],
  caregiverId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  careeId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  progress: {
    currentStepIndex: { type: Number, default: 0 },
    completedSteps: { type: [Number], default: [] },
    percent: { type: Number, default: 0 },
    startedAt: { type: Date },
    updatedAt: { type: Date },
    completedAt: { type: Date, default: null },
  },
}, { timestamps: true })

const Lesson: Model<ILesson> = models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema)
export default Lesson