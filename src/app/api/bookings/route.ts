import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { timeSlots } from "@/lib/timeSlots";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await connectDB();
  const date = request.nextUrl.searchParams.get("date");

  if (date) {
    const bookings = await Booking.find({ date }).sort({ createdAt: -1 });
    return Response.json({ bookings });
  }

  const bookings = await Booking.find().sort({ createdAt: -1 });
  return Response.json({ bookings });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const { name, phone, date, slots, type = "offline" } = body;

  if (!name || !phone || !date || !slots?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check for conflicts
  const existing = await Booking.find({ date });
  const bookedSlots = new Set<number>();
  existing.forEach((b) => b.slots.forEach((s: number) => bookedSlots.add(s)));

  const conflict = slots.find((s: number) => bookedSlots.has(s));
  if (conflict !== undefined) {
    return Response.json(
      { error: `Slot "${timeSlots[conflict].time}" is already booked` },
      { status: 409 }
    );
  }

  const totalPrice = slots.reduce(
    (sum: number, i: number) => sum + timeSlots[i].price,
    0
  );

  const booking = await Booking.create({ name, phone, date, slots, totalPrice, type });
  return Response.json({ booking }, { status: 201 });
}
