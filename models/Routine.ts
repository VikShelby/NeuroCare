import mongoose, { Schema, models, Model, Types } from "mongoose"

export interface IRoutine {
  title: string
  description?: string
  time?: string | { start?: Date; end?: Date }
  frequency?: string
  importance?: number
  associatedActivities?: string[]
  flexibility?: number | string
  notes?: string
  caregiverId: Types.ObjectId
  careeId?: Types.ObjectId
}

const RoutineSchema = new Schema<IRoutine>({
  title: { type: String, required: true },
  description: { type: String },
  time: { type: Schema.Types.Mixed },
  frequency: { type: String },
  importance: { type: Number },
  associatedActivities: [{ type: String }],
  flexibility: { type: Schema.Types.Mixed },
  notes: { type: String },
  caregiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  careeId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true })

const Routine: Model<IRoutine> = models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema)
export default Routine
