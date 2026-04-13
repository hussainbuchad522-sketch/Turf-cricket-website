import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  name: string;
  phone: string;
  date: string;
  turf: 1 | 2;
  slots: number[];
  totalPrice: number;
  type: "online" | "offline";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true, index: true },
  turf: { type: Number, enum: [1, 2], required: true, default: 1 },
  slots: { type: [Number], required: true },
  totalPrice: { type: Number, required: true },
  type: { type: String, enum: ["online", "offline"], default: "offline" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
