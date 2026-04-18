import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// DELETE: cancel all FUTURE dates in a recurring group. Past bookings are kept.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const { id } = await params;

    const result = await Booking.deleteMany({
      recurringGroupId: id,
      date: { $gte: todayISO() },
    });

    return Response.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Failed to cancel recurring booking:", error);
    return Response.json({ error: "Failed to cancel recurring booking" }, { status: 500 });
  }
}
