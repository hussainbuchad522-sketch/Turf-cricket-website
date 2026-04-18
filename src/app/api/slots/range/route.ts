import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Unavailable from "@/lib/models/Unavailable";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// GET /api/slots/range?start=YYYY-MM-DD&end=YYYY-MM-DD&turf=1
// Returns, per slot index, the list of dates in that range where the slot is unavailable.
export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const start = request.nextUrl.searchParams.get("start");
    const end = request.nextUrl.searchParams.get("end");
    const turfParam = request.nextUrl.searchParams.get("turf");

    if (!start || !end) {
      return Response.json({ error: "start and end dates required" }, { status: 400 });
    }

    const turf = turfParam === "2" ? 2 : 1;

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    if (endDate < startDate) {
      return Response.json({ error: "end must be on or after start" }, { status: 400 });
    }

    // Build list of dates for the range
    const dates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      dates.push(toISODate(d));
    }

    const [bookings, unavailables] = await Promise.all([
      Booking.find({ date: { $in: dates }, turf }),
      Unavailable.find({ date: { $in: dates }, turf }),
    ]);

    // Map: slot index -> set of dates
    const conflictsBySlot: Record<number, Set<string>> = {};
    const slotNames: Record<number, Set<string>> = {};
    const addConflict = (slot: number, date: string, name?: string) => {
      if (!conflictsBySlot[slot]) conflictsBySlot[slot] = new Set();
      conflictsBySlot[slot].add(date);
      if (name) {
        if (!slotNames[slot]) slotNames[slot] = new Set();
        slotNames[slot].add(name);
      }
    };

    bookings.forEach((b) => b.slots.forEach((s: number) => addConflict(s, b.date, b.name)));
    unavailables.forEach((u) => u.slots.forEach((s: number) => addConflict(s, u.date)));

    const result: Record<number, string[]> = {};
    for (const [slot, dateSet] of Object.entries(conflictsBySlot)) {
      result[Number(slot)] = Array.from(dateSet).sort();
    }

    const names: Record<number, string[]> = {};
    for (const [slot, nameSet] of Object.entries(slotNames)) {
      names[Number(slot)] = Array.from(nameSet);
    }

    return Response.json({
      totalDates: dates.length,
      conflictsBySlot: result,
      slotNames: names,
    });
  } catch (error) {
    console.error("Failed to fetch range availability:", error);
    return Response.json(
      { error: "Failed to fetch availability", conflictsBySlot: {}, totalDates: 0 },
      { status: 500 }
    );
  }
}
