import crypto from "crypto";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = { role: "admin"; exp: number };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable is missing or shorter than 32 chars",
    );
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

export function signSession(payload: SessionPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(
    crypto.createHmac("sha256", getSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

export function verifySession(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  let expected: string;
  try {
    expected = b64url(
      crypto.createHmac("sha256", getSecret()).update(body).digest(),
    );
  } catch {
    return null;
  }

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString()) as SessionPayload;
    if (payload.role !== "admin") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
