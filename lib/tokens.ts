// lib/tokens.ts
import crypto from "crypto";
export const newToken = () => crypto.randomBytes(32).toString("hex");
export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
export const isValid = (s: { revoked: boolean; expires_at: string | Date }, now = new Date()) =>
  !s.revoked && new Date(s.expires_at) > now;