import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Unavailable from "@/lib/models/Unavailable";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const date = request.nextUrl.searchParams.get("date");
    const turfParam = request.nextUrl.searchParams.get("turf");

    if (!date) {
      return Response.json({ error: "Date required" }, { status: 400 });
    }

    const query: { date: string; turf?: 1 | 2 } = { date };
    if (turfParam === "1" || turfParam === "2") {
      query.turf = Number(turfParam) as 1 | 2;
    }

    const entries = await Unavailable.find(query).sort({ createdAt: -1 });
    return Response.json({ entries });
  } catch (error) {
    console.error("Failed to fetch unavailable entries:", error);
    return Response.json(
      { error: "Failed to fetch unavailable entries", entries: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { date, slots, reason = "Maintenance", turf } = body;

    if (!date || !slots?.length) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const turfNum = turf === 2 ? 2 : 1;

    const entry = await Unavailable.create({ date, turf: turfNum, slots, reason });
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to mark unavailable:", error);
    return Response.json({ error: "Failed to mark unavailable" }, { status: 500 });
  }
}
