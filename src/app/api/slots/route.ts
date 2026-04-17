import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Unavailable from "@/lib/models/Unavailable";
import SlotLock from "@/lib/models/SlotLock";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const date = request.nextUrl.searchParams.get("date");
    const turfParam = request.nextUrl.searchParams.get("turf");

    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    const turf = turfParam === "2" ? 2 : 1;

    const bookings = await Booking.find({ date, turf });
    const bookedSlots = new Set<number>();
    const recurringSlots = new Set<number>();
    const onlineSlots = new Set<number>();
    const slotNames: Record<number, string> = {};
    bookings.forEach((b) => {
      b.slots.forEach((s: number) => {
        bookedSlots.add(s);
        slotNames[s] = b.name;
        if (b.isRecurring) recurringSlots.add(s);
        else if (b.type === "online") onlineSlots.add(s);
      });
    });

    const unavailableEntries = await Unavailable.find({ date, turf });
    const unavailableSlots = new Set<number>();
    unavailableEntries.forEach((e) => e.slots.forEach((s: number) => unavailableSlots.add(s)));

    // Actively-locked slots: someone else has payment in progress
    const activeLocks = await SlotLock.find({
      date,
      turf,
      expiresAt: { $gt: new Date() },
    });
    const lockedSlots = new Set<number>();
    activeLocks.forEach((l) => l.slots.forEach((s: number) => lockedSlots.add(s)));

    return Response.json({
      bookedSlots: Array.from(bookedSlots),
      unavailableSlots: Array.from(unavailableSlots),
      lockedSlots: Array.from(lockedSlots),
      recurringSlots: Array.from(recurringSlots),
      onlineSlots: Array.from(onlineSlots),
      slotNames,
    });
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    return Response.json(
      { error: "Failed to fetch slots", bookedSlots: [], unavailableSlots: [] },
      { status: 500 }
    );
  }
}
