import { connectDB } from "@/lib/mongodb";
import Unavailable from "@/lib/models/Unavailable";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Unavailable.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete unavailable entry:", error);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
