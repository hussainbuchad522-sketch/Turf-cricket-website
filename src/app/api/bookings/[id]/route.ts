import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return Response.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
