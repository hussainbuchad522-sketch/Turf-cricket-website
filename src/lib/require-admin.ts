import { getSession } from "./session";

export async function requireAdmin(): Promise<Response | null> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
