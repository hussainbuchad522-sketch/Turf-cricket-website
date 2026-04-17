import mongoose, { Schema, Document } from "mongoose";

export interface ISlotLock extends Document {
  orderId: string;
  name: string;
  phone: string;
  date: string;
  turf: 1 | 2;
  slots: number[];
  totalPrice: number;
  expiresAt: Date;
  createdAt: Date;
}

const SlotLockSchema = new Schema<ISlotLock>({
  orderId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true, index: true },
  turf: { type: Number, enum: [1, 2], required: true },
  slots: { type: [Number], required: true },
  totalPrice: { type: Number, required: true },
  // MongoDB TTL index: document auto-deletes once expiresAt <= now
  expiresAt: { type: Date, required: true, expires: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SlotLock ||
  mongoose.model<ISlotLock>("SlotLock", SlotLockSchema);
