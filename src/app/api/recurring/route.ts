import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { timeSlots } from "@/lib/timeSlots";
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

// GET: list active recurring groups (one row per group)
export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();

    // Aggregate: group by recurringGroupId, earliest date first
    const groups = await Booking.aggregate([
      { $match: { isRecurring: true, recurringGroupId: { $ne: null } } },
      {
        $group: {
          _id: "$recurringGroupId",
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          turf: { $first: "$turf" },
          slots: { $first: "$slots" },
          pricePerDay: { $first: "$totalPrice" },
          startDate: { $min: "$date" },
          endDate: { $max: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { startDate: 1 } },
    ]);

    return Response.json({ groups });
  } catch (error) {
    console.error("Failed to list recurring:", error);
    return Response.json(
      { error: "Failed to fetch recurring bookings", groups: [] },
      { status: 500 }
    );
  }
}

// POST: create recurring booking across a date range
export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const body = await request.json();
    const { name, phone, turf, slots, startDate, endDate, pricePerDay } = body;

    if (!name || !phone || !slots?.length || !startDate || !endDate || pricePerDay == null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const turfNum = turf === 2 ? 2 : 1;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    if (end < start) {
      return Response.json({ error: "End date must be on or after start date" }, { status: 400 });
    }

    // Build list of dates
    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      dates.push(toISODate(d));
    }

    // Check for conflicts on the selected turf/slots
    const existing = await Booking.find({
      date: { $in: dates },
      turf: turfNum,
    });

    const conflicts: { date: string; slot: number }[] = [];
    for (const b of existing) {
      for (const s of b.slots as number[]) {
        if (slots.includes(s)) {
          conflicts.push({ date: b.date, slot: s });
        }
      }
    }

    if (conflicts.length) {
      return Response.json(
        {
          error: `Conflict: ${conflicts.length} slot(s) already booked. First conflict: ${conflicts[0].date} "${timeSlots[conflicts[0].slot].time}"`,
          conflicts,
        },
        { status: 409 }
      );
    }

    const recurringGroupId = crypto.randomUUID();

    // Bulk insert
    const docs = dates.map((date) => ({
      name,
      phone,
      date,
      turf: turfNum,
      slots,
      totalPrice: pricePerDay,
      type: "offline" as const,
      isRecurring: true,
      recurringGroupId,
    }));

    await Booking.insertMany(docs);

    return Response.json({
      success: true,
      recurringGroupId,
      count: dates.length,
      startDate: dates[0],
      endDate: dates[dates.length - 1],
    });
  } catch (error) {
    console.error("Failed to create recurring booking:", error);
    return Response.json({ error: "Failed to create recurring booking" }, { status: 500 });
  }
}
