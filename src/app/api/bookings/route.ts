import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { timeSlots, calcTotal } from "@/lib/timeSlots";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const date = request.nextUrl.searchParams.get("date");

    if (date) {
      const bookings = await Booking.find({ date }).sort({ createdAt: -1 });
      return Response.json({ bookings });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 });
    return Response.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings", bookings: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const body = await request.json();
    const { name, phone, date, slots, type = "offline", turf } = body;

    if (!name || !phone || !date || !slots?.length) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const turfNum = turf === 2 ? 2 : 1;

    // Check for conflicts on the selected turf only
    const existing = await Booking.find({ date, turf: turfNum });
    const bookedSlots = new Set<number>();
    existing.forEach((b) => b.slots.forEach((s: number) => bookedSlots.add(s)));

    const conflict = slots.find((s: number) => bookedSlots.has(s));
    if (conflict !== undefined) {
      return Response.json(
        { error: `Slot "${timeSlots[conflict].time}" is already booked on Box ${turfNum}` },
        { status: 409 }
      );
    }

    // totalPrice stored includes the flat ₹50 GST that the customer pays.
    const { total: totalPrice } = calcTotal(slots);

    const booking = await Booking.create({
      name,
      phone,
      date,
      turf: turfNum,
      slots,
      totalPrice,
      type,
    });
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return Response.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
