import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

// DELETE /api/bookings/bulk-delete
// Body: { turf, startDate, endDate, name? }
// Deletes all bookings matching the filters
export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const body = await request.json();
    const { turf, startDate, endDate, name } = body;

    if (!turf || !startDate || !endDate) {
      return Response.json({ error: "turf, startDate, and endDate are required" }, { status: 400 });
    }

    const filter: Record<string, unknown> = {
      turf: Number(turf),
      date: { $gte: startDate, $lte: endDate },
    };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const result = await Booking.deleteMany(filter);

    return Response.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return Response.json({ error: "Bulk delete failed" }, { status: 500 });
  }
}
