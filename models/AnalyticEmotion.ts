import mongoose, { Schema, models, Model } from "mongoose";

export interface IEmotionItem {
  emotion: string;
  percentage: number;
}

export interface IAnalyticEmotion {
  userId: string;
  emotions: IEmotionItem[];
  dominant_emotion: string;
  analysis_summary: string;
}

const EmotionItemSchema = new Schema<IEmotionItem>({
  emotion: { type: String, required: true },
  percentage: { type: Number, required: true },
}, { _id: false })

const AnalyticEmotionSchema = new Schema<IAnalyticEmotion>({
  userId: { type: String, required: true, index: true },
  emotions: { type: [EmotionItemSchema], required: true },
  dominant_emotion: { type: String, required: true },
  analysis_summary: { type: String, required: true },
}, { timestamps: true })

const AnalyticEmotion: Model<IAnalyticEmotion> = models.AnalyticEmotion || mongoose.model<IAnalyticEmotion>("AnalyticEmotion", AnalyticEmotionSchema)

export default AnalyticEmotion;
