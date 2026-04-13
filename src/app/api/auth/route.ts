import { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "krishna@turf2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid password" }, { status: 401 });
}
