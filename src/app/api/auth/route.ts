import { NextRequest } from "next/server";
import { createSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD env var is not set");
    return Response.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string") {
    return Response.json({ error: "Missing password" }, { status: 400 });
  }

  if (body.password !== adminPassword) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  await createSession();
  return Response.json({ success: true });
}
