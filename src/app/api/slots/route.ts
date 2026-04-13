import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Unavailable from "@/lib/models/Unavailable";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await connectDB();
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return Response.json({ error: "Date is required" }, { status: 400 });
  }

  const bookings = await Booking.find({ date });
  const bookedSlots = new Set<number>();
  bookings.forEach((b) => b.slots.forEach((s: number) => bookedSlots.add(s)));

  const unavailableEntries = await Unavailable.find({ date });
  const unavailableSlots = new Set<number>();
  unavailableEntries.forEach((e) => e.slots.forEach((s: number) => unavailableSlots.add(s)));

  return Response.json({
    bookedSlots: Array.from(bookedSlots),
    unavailableSlots: Array.from(unavailableSlots),
  });
}
