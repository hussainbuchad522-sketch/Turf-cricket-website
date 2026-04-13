import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  const deleted = await Booking.findByIdAndDelete(id);

  if (!deleted) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
