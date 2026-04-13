import mongoose, { Schema, Document } from "mongoose";

export interface IUnavailable extends Document {
  date: string;
  turf: 1 | 2;
  slots: number[];
  reason: string;
  createdAt: Date;
}

const UnavailableSchema = new Schema<IUnavailable>({
  date: { type: String, required: true, index: true },
  turf: { type: Number, enum: [1, 2], required: true, default: 1 },
  slots: { type: [Number], required: true },
  reason: { type: String, default: "Maintenance" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Unavailable ||
  mongoose.model<IUnavailable>("Unavailable", UnavailableSchema);
