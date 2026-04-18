import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SlotLock from "@/lib/models/SlotLock";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { orderId } = await request.json();

    if (!orderId) {
      return Response.json({ error: "Missing orderId" }, { status: 400 });
    }

    await SlotLock.deleteOne({ orderId });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to release lock:", error);
    return Response.json({ error: "Failed to release lock" }, { status: 500 });
  }
}
