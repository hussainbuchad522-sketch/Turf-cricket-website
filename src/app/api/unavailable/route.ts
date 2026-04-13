import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Unavailable from "@/lib/models/Unavailable";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await connectDB();
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return Response.json({ error: "Date required" }, { status: 400 });
  }

  const entries = await Unavailable.find({ date }).sort({ createdAt: -1 });
  return Response.json({ entries });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const { date, slots, reason = "Maintenance" } = body;

  if (!date || !slots?.length) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const entry = await Unavailable.create({ date, slots, reason });
  return Response.json({ entry }, { status: 201 });
}
